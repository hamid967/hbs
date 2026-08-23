import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { accountActivationHistory, chatMessages, chatSessions, demoRequests, hrSystemPlans, requestHistory, serviceRequests, type InsertUser, userModulePermissionHistory, userModulePermissions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { canManageRequest, permittedRequestTypes, type RequestType, type UserRole } from "./requestPolicy";
import { createActivationHistoryRecord, getBootstrapAccountSettings } from "./accountPolicy";
import { defaultModulePermissionsForRole, normalizeModulePermissions, type ModulePermission } from "../shared/moduleAccess";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  const bootstrap = getBootstrapAccountSettings({ openId: user.openId, email: user.email, ownerOpenId: ENV.ownerOpenId });
  values.role = user.role ?? bootstrap.role;
  values.accountStatus = user.accountStatus ?? bootstrap.accountStatus;
  if (user.role !== undefined) updateSet.role = user.role;
  if (user.accountStatus !== undefined) updateSet.accountStatus = user.accountStatus;
  if (bootstrap.role === "admin") {
    updateSet.role = "admin";
    updateSet.accountStatus = "active";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getUserModulePermissions(userId: number, role: UserRole): Promise<ModulePermission[]> {
  const db = await getDb();
  if (!db) return defaultModulePermissionsForRole(role);
  const rows = await db.select().from(userModulePermissions).where(eq(userModulePermissions.userId, userId));
  return rows.length ? normalizeModulePermissions(rows) : defaultModulePermissionsForRole(role);
}

export async function listUserAccounts(status?: "pending" | "active" | "suspended" | "rejected") {
  const db = await getDb();
  if (!db) return [];
  const accounts = await db.select().from(users).where(status ? eq(users.accountStatus, status) : undefined).orderBy(desc(users.createdAt));
  if (!accounts.length) return [];
  const rows = await db.select().from(userModulePermissions).where(inArray(userModulePermissions.userId, accounts.map(account => account.id)));
  return accounts.map(account => ({ ...account, modulePermissions: rows.filter(row => row.userId === account.id).length ? normalizeModulePermissions(rows.filter(row => row.userId === account.id)) : defaultModulePermissionsForRole(account.role) }));
}

export async function updateUserAccount(input: { userId: number; actorId: number; accountStatus: "pending" | "active" | "suspended" | "rejected"; role: UserRole; modulePermissions?: ModulePermission[]; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    const user = (await tx.select().from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!user) throw new Error("الحساب غير موجود");
    await tx.update(users).set({ accountStatus: input.accountStatus, role: input.role }).where(eq(users.id, input.userId));
    if (user.accountStatus !== input.accountStatus || user.role !== input.role) await tx.insert(accountActivationHistory).values(createActivationHistoryRecord({ userId: input.userId, actorId: input.actorId, previousStatus: user.accountStatus, nextStatus: input.accountStatus, assignedRole: input.role, note: input.note }));
    if (input.modulePermissions) {
      const existing = await tx.select().from(userModulePermissions).where(eq(userModulePermissions.userId, input.userId));
      for (const permission of normalizeModulePermissions(input.modulePermissions)) {
        const previous = existing.find(item => item.module === permission.module);
        if (previous?.canView === permission.canView && previous?.canManage === permission.canManage) continue;
        await tx.insert(userModulePermissions).values({ userId: input.userId, ...permission }).onDuplicateKeyUpdate({ set: { canView: permission.canView, canManage: permission.canManage } });
        await tx.insert(userModulePermissionHistory).values({ userId: input.userId, actorId: input.actorId, module: permission.module, previousCanView: previous?.canView ?? false, previousCanManage: previous?.canManage ?? false, nextCanView: permission.canView, nextCanManage: permission.canManage, note: input.note ?? null });
      }
    }
  });
  return { success: true } as const;
}

export async function createRequestWithHistory(input: {
  reference: string;
  type: RequestType;
  category: string;
  subject: string;
  details: string;
  priority: "normal" | "urgent";
  employeeId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    await tx.insert(serviceRequests).values({ ...input, status: "submitted" });
    const request = (await tx.select().from(serviceRequests).where(eq(serviceRequests.reference, input.reference)).limit(1))[0];
    if (!request) throw new Error("تعذر إنشاء الطلب");
    await tx.insert(requestHistory).values({ requestId: request.id, actorId: input.employeeId, action: "created", nextStatus: "submitted", note: "تم إنشاء الطلب وإرساله للمراجعة.", visibleToEmployee: true });
  });
  const request = (await db.select().from(serviceRequests).where(eq(serviceRequests.reference, input.reference)).limit(1))[0];
  if (!request) throw new Error("تعذر قراءة الطلب المنشأ");
  return request;
}

export async function getEmployeeRequests(employeeId: number, filters: { type?: RequestType; status?: "submitted" | "in_review" | "approved" | "rejected" | "completed" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(serviceRequests.employeeId, employeeId)];
  if (filters.type) conditions.push(eq(serviceRequests.type, filters.type));
  if (filters.status) conditions.push(eq(serviceRequests.status, filters.status));
  return db.select().from(serviceRequests).where(and(...conditions)).orderBy(desc(serviceRequests.updatedAt));
}

export async function getRequestDetail(id: number, userId: number, role: UserRole, permissions = defaultModulePermissionsForRole(role)) {
  const db = await getDb();
  if (!db) return undefined;
  const request = (await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1))[0];
  if (!request) return undefined;
  const canManage = canManageRequest(role, request.type, permissions);
  const canView = permittedRequestTypes(role, permissions).includes(request.type);
  if (!canView && request.employeeId !== userId) return undefined;
  const history = await db.select().from(requestHistory).where(and(eq(requestHistory.requestId, id), ...(canManage ? [] : [eq(requestHistory.visibleToEmployee, true)]) )).orderBy(desc(requestHistory.createdAt));
  return { request, history, canManage };
}

export async function getOperationsRequests(filters: { type?: RequestType; status?: "submitted" | "in_review" | "approved" | "rejected" | "completed" }, permittedTypes: RequestType[]) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [inArray(serviceRequests.type, permittedTypes)];
  if (filters.type) conditions.push(eq(serviceRequests.type, filters.type));
  if (filters.status) conditions.push(eq(serviceRequests.status, filters.status));
  return db.select({ request: serviceRequests, employee: { id: users.id, name: users.name, email: users.email } }).from(serviceRequests).innerJoin(users, eq(serviceRequests.employeeId, users.id)).where(and(...conditions)).orderBy(desc(serviceRequests.updatedAt));
}

export async function updateRequestStatus(id: number, actorId: number, previousStatus: "submitted" | "in_review" | "approved" | "rejected" | "completed", nextStatus: "submitted" | "in_review" | "approved" | "rejected" | "completed", note?: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    await tx.update(serviceRequests).set({ status: nextStatus }).where(eq(serviceRequests.id, id));
    await tx.insert(requestHistory).values({ requestId: id, actorId, action: "status_change", previousStatus, nextStatus, note: note || `تم تحديث حالة الطلب إلى ${nextStatus}.`, visibleToEmployee: true });
  });
  return { success: true } as const;
}

export async function addRequestNote(requestId: number, actorId: number, note: string, visibleToEmployee: boolean) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(requestHistory).values({ requestId, actorId, action: "note", note, visibleToEmployee });
  return { success: true } as const;
}

export async function getOpenChatSession(employeeId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  return (await db.select().from(chatSessions).where(and(eq(chatSessions.employeeId, employeeId), eq(chatSessions.status, "open"))).orderBy(desc(chatSessions.updatedAt)).limit(1))[0];
}

export async function createChatSession(employeeId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(chatSessions).values({ employeeId, status: "open" });
  const session = (await db.select().from(chatSessions).where(and(eq(chatSessions.employeeId, employeeId), eq(chatSessions.status, "open"))).orderBy(desc(chatSessions.createdAt)).limit(1))[0];
  if (!session) throw new Error("تعذر إنشاء جلسة المحادثة");
  return session;
}

export async function getChatSessionForUser(sessionId: number, employeeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(chatSessions).where(and(eq(chatSessions.id, sessionId), eq(chatSessions.employeeId, employeeId))).limit(1))[0];
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(asc(chatMessages.createdAt), asc(chatMessages.id));
}

export async function appendChatMessage(sessionId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(chatMessages).values({ sessionId, role, content });
}

export async function updateChatDraft(sessionId: number, draft: { type?: "hr" | "government"; category?: string; subject?: string; details?: string; priority?: "normal" | "urgent" }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.update(chatSessions).set({
    ...(draft.type ? { draftType: draft.type } : {}),
    ...(draft.category ? { draftCategory: draft.category } : {}),
    ...(draft.subject ? { draftSubject: draft.subject } : {}),
    ...(draft.details ? { draftDetails: draft.details } : {}),
    ...(draft.priority ? { draftPriority: draft.priority } : {}),
  }).where(eq(chatSessions.id, sessionId));
}

export async function markChatConverted(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.update(chatSessions).set({ status: "converted" }).where(eq(chatSessions.id, sessionId));
}

export async function createHrSystemPlan(input: { employeeId: number; businessActivity: string; companySize: string; operatingNotes?: string; workModel?: string; geographicFootprint?: string; growthHorizon?: string; peopleChallenges?: string; generatedContent: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(hrSystemPlans).values(input);
  const plan = (await db.select().from(hrSystemPlans).where(eq(hrSystemPlans.employeeId, input.employeeId)).orderBy(desc(hrSystemPlans.createdAt)).limit(1))[0];
  if (!plan) throw new Error("تعذر حفظ النظام المولّد");
  return plan;
}

export async function getHrSystemPlans(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hrSystemPlans).where(eq(hrSystemPlans.employeeId, employeeId)).orderBy(desc(hrSystemPlans.updatedAt));
}

export async function getHrSystemPlan(id: number, employeeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(hrSystemPlans).where(and(eq(hrSystemPlans.id, id), eq(hrSystemPlans.employeeId, employeeId))).limit(1))[0];
}

export async function createDemoRequest(input: { fullName: string; workEmail: string; phone?: string; companyName: string; companySize: string; businessActivity?: string; interest: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(demoRequests).values(input);
  const request = (await db.select().from(demoRequests).where(and(eq(demoRequests.workEmail, input.workEmail), eq(demoRequests.companyName, input.companyName))).orderBy(desc(demoRequests.createdAt)).limit(1))[0];
  if (!request) throw new Error("تعذر حفظ طلب العرض");
  return request;
}

export async function getDemoRequests(filters: { status?: "new" | "contacted" | "qualified" | "closed" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = filters.status ? [eq(demoRequests.status, filters.status)] : [];
  return db.select().from(demoRequests).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(demoRequests.updatedAt));
}

export async function updateDemoRequest(input: { id: number; status: "new" | "contacted" | "qualified" | "closed"; ownerId?: number; internalNote?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.update(demoRequests).set({ status: input.status, ...(input.ownerId ? { ownerId: input.ownerId } : {}), ...(input.internalNote !== undefined ? { internalNote: input.internalNote } : {}) }).where(eq(demoRequests.id, input.id));
  return { success: true } as const;
}

export type MvpMetrics = {
  requests: { total: number; open: number; urgent: number; completed: number; inReview: number; submitted: number; rejected: number; last30Days: number };
  demos: { total: number; new: number; contacted: number; qualified: number; closed: number; last30Days: number };
  hrPlans: { total: number; last30Days: number };
  monthly: { currentMonth: string; previousMonth: string; requests: MonthlyMetric; demos: MonthlyMetric; hrPlans: MonthlyMetric };
};

export type MonthlyMetric = { current: number; previous: number; delta: number; percentChange: number | null };
type MetricRequestRow = { status: string; priority: string; createdAt: Date };
type MetricDemoRow = { status: string; createdAt: Date };
type MetricPlanRow = { createdAt: Date };

export function calculateMonthlyMetric(current: number, previous: number): MonthlyMetric {
  return { current, previous, delta: current - previous, percentChange: previous === 0 ? null : Math.round(((current - previous) / previous) * 100) };
}

function monthLabel(date: Date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; }

export function buildMvpMetrics(source: { requests: MetricRequestRow[]; demos: MetricDemoRow[]; plans: MetricPlanRow[] }, now = new Date()): MvpMetrics {
  const { requests, demos, plans } = source;
  const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const since = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const requestCount = (status: string) => requests.filter(item => item.status === status).length;
  const demoCount = (status: string) => demos.filter(item => item.status === status).length;
  const countPeriod = <T extends { createdAt: Date }>(items: T[], start: Date, end: Date) => items.filter(item => item.createdAt >= start && item.createdAt < end).length;
  const submitted = requestCount("submitted"); const inReview = requestCount("in_review");
  return {
    requests: { total: requests.length, open: submitted + inReview, urgent: requests.filter(item => item.priority === "urgent").length, completed: requestCount("completed"), inReview, submitted, rejected: requestCount("rejected"), last30Days: requests.filter(item => item.createdAt.getTime() >= since).length },
    demos: { total: demos.length, new: demoCount("new"), contacted: demoCount("contacted"), qualified: demoCount("qualified"), closed: demoCount("closed"), last30Days: demos.filter(item => item.createdAt.getTime() >= since).length },
    hrPlans: { total: plans.length, last30Days: plans.filter(item => item.createdAt.getTime() >= since).length },
    monthly: { currentMonth: monthLabel(currentStart), previousMonth: monthLabel(previousStart), requests: calculateMonthlyMetric(countPeriod(requests, currentStart, now), countPeriod(requests, previousStart, currentStart)), demos: calculateMonthlyMetric(countPeriod(demos, currentStart, now), countPeriod(demos, previousStart, currentStart)), hrPlans: calculateMonthlyMetric(countPeriod(plans, currentStart, now), countPeriod(plans, previousStart, currentStart)) },
  };
}

export async function getMvpMetrics(): Promise<MvpMetrics> {
  const db = await getDb();
  const now = new Date(); const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const empty: MvpMetrics = { requests: { total: 0, open: 0, urgent: 0, completed: 0, inReview: 0, submitted: 0, rejected: 0, last30Days: 0 }, demos: { total: 0, new: 0, contacted: 0, qualified: 0, closed: 0, last30Days: 0 }, hrPlans: { total: 0, last30Days: 0 }, monthly: { currentMonth: monthLabel(currentStart), previousMonth: monthLabel(previousStart), requests: calculateMonthlyMetric(0, 0), demos: calculateMonthlyMetric(0, 0), hrPlans: calculateMonthlyMetric(0, 0) } };
  if (!db) return empty;
  const [requests, demos, plans] = await Promise.all([
    db.select({ status: serviceRequests.status, priority: serviceRequests.priority, createdAt: serviceRequests.createdAt }).from(serviceRequests),
    db.select({ status: demoRequests.status, createdAt: demoRequests.createdAt }).from(demoRequests),
    db.select({ createdAt: hrSystemPlans.createdAt }).from(hrSystemPlans),
  ]);
  return buildMvpMetrics({ requests, demos, plans }, now);
}
