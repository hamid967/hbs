import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { accountActivationHistory, approvalTasks, chatMessages, chatSessions, companyPermissionTemplates, demoRequests, departments, employeeProfiles, expenseRequests, hrSystemPlans, inAppNotifications, leaveRequests, requestHistory, serviceRequests, type InsertUser, userModulePermissionHistory, userModulePermissions, users } from "../drizzle/schema";
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
  values.companyId = user.companyId ?? 1;
  if (user.companyId !== undefined) updateSet.companyId = user.companyId;
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

export async function listUserAccounts(status?: "pending" | "active" | "suspended" | "rejected", companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [status ? eq(users.accountStatus, status) : undefined, companyId ? eq(users.companyId, companyId) : undefined].filter(Boolean);
  const accounts = await db.select().from(users).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(users.createdAt));
  if (!accounts.length) return [];
  const rows = await db.select().from(userModulePermissions).where(inArray(userModulePermissions.userId, accounts.map(account => account.id)));
  return accounts.map(account => ({ ...account, modulePermissions: rows.filter(row => row.userId === account.id).length ? normalizeModulePermissions(rows.filter(row => row.userId === account.id)) : defaultModulePermissionsForRole(account.role) }));
}

export async function updateUserAccount(input: { userId: number; actorId: number; companyId?: number; accountStatus: "pending" | "active" | "suspended" | "rejected"; role: UserRole; modulePermissions?: ModulePermission[]; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    const user = (await tx.select().from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!user) throw new Error("الحساب غير موجود");
    if (input.companyId !== undefined && user.companyId !== input.companyId) throw new Error("لا تملك صلاحية تعديل حساب تابع لشركة أخرى");
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

export function companyTemplatePermissions(template: { hrCanView: boolean; hrCanManage: boolean; governmentCanView: boolean; governmentCanManage: boolean }): ModulePermission[] {
  return normalizeModulePermissions([{ module: "hr", canView: template.hrCanView, canManage: template.hrCanManage }, { module: "government", canView: template.governmentCanView, canManage: template.governmentCanManage }]);
}

export async function getCompanyPermissionTemplates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyPermissionTemplates).where(eq(companyPermissionTemplates.companyId, companyId)).orderBy(desc(companyPermissionTemplates.updatedAt));
}

export async function createCompanyPermissionTemplate(input: { companyId: number; createdByUserId: number; title: string; description?: string; role: UserRole; modulePermissions: ModulePermission[] }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const permissions = normalizeModulePermissions(input.modulePermissions);
  const hr = permissions.find(permission => permission.module === "hr")!;
  const government = permissions.find(permission => permission.module === "government")!;
  await db.insert(companyPermissionTemplates).values({ companyId: input.companyId, createdByUserId: input.createdByUserId, title: input.title, description: input.description ?? null, role: input.role, hrCanView: hr.canView, hrCanManage: hr.canManage, governmentCanView: government.canView, governmentCanManage: government.canManage });
  const created = (await db.select().from(companyPermissionTemplates).where(and(eq(companyPermissionTemplates.companyId, input.companyId), eq(companyPermissionTemplates.title, input.title))).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ قالب الصلاحيات");
  return created;
}

export async function getCompanyPermissionTemplate(id: number, companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(companyPermissionTemplates).where(and(eq(companyPermissionTemplates.id, id), eq(companyPermissionTemplates.companyId, companyId))).limit(1))[0];
}

export async function updateCompanyPermissionTemplate(input: { id: number; companyId: number; title: string; description?: string; role: UserRole; modulePermissions: ModulePermission[] }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await getCompanyPermissionTemplate(input.id, input.companyId);
  if (!existing) throw new Error("قالب الشركة غير موجود أو لا يتبع لشركتك");
  const permissions = normalizeModulePermissions(input.modulePermissions);
  const hr = permissions.find(permission => permission.module === "hr")!;
  const government = permissions.find(permission => permission.module === "government")!;
  await db.update(companyPermissionTemplates).set({ title: input.title, description: input.description ?? null, role: input.role, hrCanView: hr.canView, hrCanManage: hr.canManage, governmentCanView: government.canView, governmentCanManage: government.canManage }).where(and(eq(companyPermissionTemplates.id, input.id), eq(companyPermissionTemplates.companyId, input.companyId)));
  return getCompanyPermissionTemplate(input.id, input.companyId);
}

export async function deleteCompanyPermissionTemplate(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await getCompanyPermissionTemplate(id, companyId);
  if (!existing) throw new Error("قالب الشركة غير موجود أو لا يتبع لشركتك");
  await db.delete(companyPermissionTemplates).where(and(eq(companyPermissionTemplates.id, id), eq(companyPermissionTemplates.companyId, companyId)));
  return { success: true } as const;
}

export async function listCompanyDepartments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).where(eq(departments.companyId, companyId)).orderBy(desc(departments.updatedAt));
}

export async function createCompanyDepartment(input: { companyId: number; name: string; code?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(departments).values({ companyId: input.companyId, name: input.name, code: input.code ?? null });
  const created = (await db.select().from(departments).where(and(eq(departments.companyId, input.companyId), eq(departments.name, input.name))).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ القسم");
  return created;
}

export async function listCompanyEmployees(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ user: users, profile: employeeProfiles, department: departments }).from(users).leftJoin(employeeProfiles, eq(employeeProfiles.userId, users.id)).leftJoin(departments, eq(employeeProfiles.departmentId, departments.id)).where(and(eq(users.companyId, companyId), eq(users.accountStatus, "active"))).orderBy(desc(users.lastSignedIn));
  return rows.map(row => ({ ...row.user, profile: row.profile, department: row.department ? { id: row.department.id, name: row.department.name, code: row.department.code } : null }));
}

export async function saveEmployeeProfile(input: { companyId: number; userId: number; employeeNumber?: string; jobTitle?: string; departmentId?: number; region?: string; managerUserId?: number; employmentStatus: "active" | "on_leave" | "inactive"; joinedAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const user = (await db.select().from(users).where(and(eq(users.id, input.userId), eq(users.companyId, input.companyId))).limit(1))[0];
  if (!user) throw new Error("الموظف غير موجود ضمن الشركة الحالية");
  if (input.departmentId) {
    const department = (await db.select().from(departments).where(and(eq(departments.id, input.departmentId), eq(departments.companyId, input.companyId))).limit(1))[0];
    if (!department) throw new Error("القسم غير موجود ضمن الشركة الحالية");
  }
  if (input.managerUserId) {
    const manager = (await db.select().from(users).where(and(eq(users.id, input.managerUserId), eq(users.companyId, input.companyId))).limit(1))[0];
    if (!manager) throw new Error("المدير غير موجود ضمن الشركة الحالية");
  }
  const values = { companyId: input.companyId, userId: input.userId, employeeNumber: input.employeeNumber ?? null, jobTitle: input.jobTitle ?? null, departmentId: input.departmentId ?? null, region: input.region ?? null, managerUserId: input.managerUserId ?? null, employmentStatus: input.employmentStatus, joinedAt: input.joinedAt ?? null };
  await db.insert(employeeProfiles).values(values).onDuplicateKeyUpdate({ set: { employeeNumber: values.employeeNumber, jobTitle: values.jobTitle, departmentId: values.departmentId, region: values.region, managerUserId: values.managerUserId, employmentStatus: values.employmentStatus, joinedAt: values.joinedAt } });
  return (await db.select().from(employeeProfiles).where(eq(employeeProfiles.userId, input.userId)).limit(1))[0];
}

export async function createRequestWithHistory(input: {
  reference: string;
  type: RequestType;
  category: string;
  subject: string;
  details: string;
  priority: "normal" | "urgent";
  employeeId: number;
  companyId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    const { companyId, ...requestInput } = input;
    await tx.insert(serviceRequests).values({ ...requestInput, status: "submitted" });
    const request = (await tx.select().from(serviceRequests).where(eq(serviceRequests.reference, input.reference)).limit(1))[0];
    if (!request) throw new Error("تعذر إنشاء الطلب");
    await tx.insert(requestHistory).values({ requestId: request.id, actorId: input.employeeId, action: "created", nextStatus: "submitted", note: "تم إنشاء الطلب وإرساله للمراجعة.", visibleToEmployee: true });
    const profile = (await tx.select().from(employeeProfiles).where(eq(employeeProfiles.userId, input.employeeId)).limit(1))[0];
    const fallbackManager = profile?.managerUserId ? undefined : (await tx.select({ id: users.id }).from(users).where(and(eq(users.companyId, companyId), eq(users.role, "admin"), eq(users.accountStatus, "active"))).limit(1))[0];
    const managerUserId = profile?.managerUserId ?? fallbackManager?.id;
    const approverRole = managerUserId ? "manager" as const : request.type === "hr" ? "hr" as const : "government" as const;
    await tx.insert(approvalTasks).values({ companyId, requestId: request.id, approverRole, assigneeUserId: managerUserId ?? null });
    if (fallbackManager) await tx.insert(requestHistory).values({ requestId: request.id, actorId: input.employeeId, action: "note", note: "تم تعيين مدير افتراضي من مسؤولي الشركة لأن ملف الموظف لا يحتوي مديراً مباشراً.", visibleToEmployee: true });
    const approvers = managerUserId ? [{ id: managerUserId }] : await tx.select({ id: users.id }).from(users).where(and(eq(users.companyId, companyId), eq(users.role, approverRole), eq(users.accountStatus, "active")));
    if (approvers.length) await tx.insert(inAppNotifications).values(approvers.map(approver => ({ companyId, recipientUserId: approver.id, type: "approval_required" as const, title: "موافقة جديدة بانتظارك", body: `طلب ${request.reference} يحتاج إلى قرارك.`, href: "/approvals", relatedRequestId: request.id })));
  });
  const request = (await db.select().from(serviceRequests).where(eq(serviceRequests.reference, input.reference)).limit(1))[0];
  if (!request) throw new Error("تعذر قراءة الطلب المنشأ");
  return request;
}

export async function saveLeaveRequestDetails(input: { requestId: number; companyId: number; leaveType: "annual" | "sick" | "emergency"; startDate: string; endDate: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(leaveRequests).values(input).onDuplicateKeyUpdate({ set: { leaveType: input.leaveType, startDate: input.startDate, endDate: input.endDate } });
  return { success: true } as const;
}

export async function saveExpenseRequestDetails(input: { requestId: number; companyId: number; expenseType: "travel" | "operating"; amountSar: string; reason: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(expenseRequests).values(input).onDuplicateKeyUpdate({ set: { expenseType: input.expenseType, amountSar: input.amountSar, reason: input.reason } });
  return { success: true } as const;
}

export async function getEmployeeRequests(employeeId: number, filters: { type?: RequestType; status?: "submitted" | "in_review" | "approved" | "rejected" | "completed" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(serviceRequests.employeeId, employeeId)];
  if (filters.type) conditions.push(eq(serviceRequests.type, filters.type));
  if (filters.status) conditions.push(eq(serviceRequests.status, filters.status));
  return db.select({ request: serviceRequests, leave: leaveRequests, expense: expenseRequests }).from(serviceRequests)
    .leftJoin(leaveRequests, eq(leaveRequests.requestId, serviceRequests.id))
    .leftJoin(expenseRequests, eq(expenseRequests.requestId, serviceRequests.id))
    .where(and(...conditions)).orderBy(desc(serviceRequests.updatedAt));
}

export function redactRequestHistoryForEmployee<T extends { action: string; nextStatus: string | null; note: string }>(history: T[]) {
  return history.map(entry => entry.action === "status_change" ? { ...entry, note: entry.nextStatus ? `حالة المرحلة: ${entry.nextStatus}` : "تم تحديث مرحلة الموافقة." } : { ...entry, note: "تم تحديث مرحلة الموافقة." });
}

export function redactApprovalStagesForEmployee<T extends { decisionNote: unknown }>(stages: T[]) {
  return stages.map(({ decisionNote: _decisionNote, ...stage }) => stage);
}

export function projectApprovalStages<T extends { decisionNote: unknown }>(stages: T[], canManage: boolean) {
  return canManage ? stages : redactApprovalStagesForEmployee(stages);
}

export function hasDefaultManagerAssignment(history: Array<{ note: string }>) {
  return history.some(entry => entry.note.includes("مدير افتراضي"));
}

export function nextApprovalRoleForRequest(type: RequestType): "hr" | "government" {
  return type === "hr" ? "hr" : "government";
}

export function approvalNotificationAudience(input: { stageRole: "manager" | "hr" | "government" | "admin"; decision: "approved" | "rejected"; requestType: RequestType }) {
  if (input.stageRole === "manager" && input.decision === "approved") {
    return { recipient: "unit" as const, role: nextApprovalRoleForRequest(input.requestType), type: "approval_required" as const };
  }
  return { recipient: "employee" as const, type: "request_decision" as const };
}

export function approvalTransitionPlan(input: { stageRole: "manager" | "hr" | "government" | "admin"; decision: "approved" | "rejected"; requestType: RequestType; companyId: number; requestId: number; employeeId: number }) {
  const notification = approvalNotificationAudience(input);
  if (notification.recipient === "unit") return { nextTask: { companyId: input.companyId, requestId: input.requestId, approverRole: notification.role }, requestStatus: "in_review" as const, historyStatus: "in_review" as const, notification };
  return { nextTask: null, requestStatus: input.decision, historyStatus: input.decision, notification: { recipient: "employee" as const, employeeId: input.employeeId, type: notification.type } };
}

export async function getRequestDetail(id: number, userId: number, role: UserRole, permissions = defaultModulePermissionsForRole(role), companyId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const request = (await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1))[0];
  if (!request) return undefined;
  if (companyId !== undefined) {
    const owner = (await db.select({ id: users.id }).from(users).where(and(eq(users.id, request.employeeId), eq(users.companyId, companyId))).limit(1))[0];
    if (!owner) return undefined;
  }
  const canManage = canManageRequest(role, request.type, permissions);
  const canView = permittedRequestTypes(role, permissions).includes(request.type);
  if (!canView && request.employeeId !== userId) return undefined;
  const history = await db.select().from(requestHistory).where(and(eq(requestHistory.requestId, id), ...(canManage ? [] : [eq(requestHistory.visibleToEmployee, true)]) )).orderBy(desc(requestHistory.createdAt));
  const usesDefaultManager = hasDefaultManagerAssignment(history);
  const safeHistory = canManage ? history : redactRequestHistoryForEmployee(history);
  const tasks = await db.select({ id: approvalTasks.id, approverRole: approvalTasks.approverRole, status: approvalTasks.status, createdAt: approvalTasks.createdAt, decidedAt: approvalTasks.decidedAt, decisionNote: approvalTasks.decisionNote }).from(approvalTasks).where(and(eq(approvalTasks.requestId, id), ...(companyId === undefined ? [] : [eq(approvalTasks.companyId, companyId)]))).orderBy(approvalTasks.createdAt);
  const approvalStages = projectApprovalStages(tasks, canManage);
  return { request, history: safeHistory, approvalStages, usesDefaultManager, canManage };
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

export async function getApprovalInbox(companyId: number, recipientUserId: number, roles: Array<"hr" | "government" | "manager" | "admin">) {
  const db = await getDb();
  if (!db || !roles.length) return [];
  const rows = await db.select({ task: approvalTasks, request: serviceRequests, employee: { id: users.id, name: users.name, email: users.email } }).from(approvalTasks).innerJoin(serviceRequests, eq(approvalTasks.requestId, serviceRequests.id)).innerJoin(users, eq(serviceRequests.employeeId, users.id)).where(and(eq(approvalTasks.companyId, companyId), eq(approvalTasks.status, "pending"), inArray(approvalTasks.approverRole, roles))).orderBy(desc(approvalTasks.createdAt));
  return rows.filter(row => row.task.approverRole !== "manager" || row.task.assigneeUserId === recipientUserId);
}

export async function listNotifications(companyId: number, recipientUserId: number) { const db = await getDb(); if (!db) return []; return db.select().from(inAppNotifications).where(and(eq(inAppNotifications.companyId, companyId), eq(inAppNotifications.recipientUserId, recipientUserId))).orderBy(desc(inAppNotifications.createdAt)).limit(50); }
export async function markNotificationRead(id: number, companyId: number, recipientUserId: number) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); await db.update(inAppNotifications).set({ readAt: new Date() }).where(and(eq(inAppNotifications.id, id), eq(inAppNotifications.companyId, companyId), eq(inAppNotifications.recipientUserId, recipientUserId))); return { success: true } as const; }

export async function decideApprovalTask(input: { id: number; companyId: number; actorId: number; allowedRoles: Array<"hr" | "government" | "manager" | "admin">; decision: "approved" | "rejected"; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.transaction(async tx => {
    const task = (await tx.select().from(approvalTasks).where(and(eq(approvalTasks.id, input.id), eq(approvalTasks.companyId, input.companyId), eq(approvalTasks.status, "pending"))).limit(1))[0];
    if (!task || !input.allowedRoles.includes(task.approverRole)) throw new Error("مهمة الموافقة غير متاحة لهذا الحساب");
    const request = (await tx.select().from(serviceRequests).where(eq(serviceRequests.id, task.requestId)).limit(1))[0];
    if (!request) throw new Error("الطلب المرتبط بالمهمة غير موجود");
    if (task.approverRole !== "manager" && request.status !== "in_review") throw new Error("لا يمكن اتخاذ قرار المرحلة الثانية قبل موافقة المدير المباشر");
    await tx.update(approvalTasks).set({ status: input.decision, decidedByUserId: input.actorId, decisionNote: input.note ?? null, decidedAt: new Date() }).where(eq(approvalTasks.id, input.id));
    if (task.approverRole === "manager" && input.decision === "approved") {
      const nextRole = nextApprovalRoleForRequest(request.type);
      const notification = approvalNotificationAudience({ stageRole: task.approverRole, decision: input.decision, requestType: request.type });
      const transition = approvalTransitionPlan({ stageRole: task.approverRole, decision: input.decision, requestType: request.type, companyId: input.companyId, requestId: request.id, employeeId: request.employeeId });
      await tx.insert(approvalTasks).values(transition.nextTask!);
      const nextApprovers = await tx.select({ id: users.id }).from(users).where(and(eq(users.companyId, input.companyId), eq(users.role, nextRole), eq(users.accountStatus, "active")));
      if (nextApprovers.length) await tx.insert(inAppNotifications).values(nextApprovers.map(approver => ({ companyId: input.companyId, recipientUserId: approver.id, type: notification.type, title: "مرحلة موافقة جديدة بانتظارك", body: `تمت موافقة المدير على الطلب ${request.reference} وهو بانتظار قرار وحدتك.`, href: "/approvals", relatedRequestId: request.id })));
      await tx.update(serviceRequests).set({ status: transition.requestStatus }).where(eq(serviceRequests.id, request.id));
      await tx.insert(requestHistory).values({ requestId: request.id, actorId: input.actorId, action: "status_change", previousStatus: request.status, nextStatus: transition.historyStatus, note: input.note || `وافق المدير المباشر وأُحيل الطلب إلى ${nextRole === "hr" ? "الموارد البشرية" : "العلاقات الحكومية"}.`, visibleToEmployee: true });
      return;
    }
    await tx.update(serviceRequests).set({ status: input.decision }).where(eq(serviceRequests.id, request.id));
    await tx.insert(requestHistory).values({ requestId: request.id, actorId: input.actorId, action: "status_change", previousStatus: request.status, nextStatus: input.decision, note: input.note || (input.decision === "approved" ? "تمت الموافقة على الطلب." : "تم رفض الطلب."), visibleToEmployee: true });
    const notification = approvalNotificationAudience({ stageRole: task.approverRole, decision: input.decision, requestType: request.type });
    await tx.insert(inAppNotifications).values({ companyId: input.companyId, recipientUserId: request.employeeId, type: notification.type, title: input.decision === "approved" ? "تمت الموافقة على طلبك" : "تم تحديث قرار طلبك", body: input.note || (input.decision === "approved" ? "تمت الموافقة على طلبك ويمكنك متابعة حالته." : "تم رفض طلبك. راجع الملاحظة أو تواصل مع الفريق."), href: `/requests/${request.id}`, relatedRequestId: request.id });
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

export type HrOperationsReport = {
  leaveDays: { current: number; previous: number; delta: number; percentChange: number | null; byType: Record<string, number> };
  expensesSar: { current: number; previous: number; delta: number; percentChange: number | null; byType: Record<string, number> };
};

export function buildHrOperationsReport(source: { leaves: { leaveType: string; startDate: string; endDate: string }[]; expenses: { expenseType: string; amountSar: string; createdAt: Date }[] }, now = new Date()): HrOperationsReport {
  const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const dayCount = (startDate: string, endDate: string) => Math.max(1, Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1);
  const leaveMonth = (item: { startDate: string }) => new Date(`${item.startDate}T00:00:00Z`);
  const currentLeaves = source.leaves.filter(item => leaveMonth(item) >= currentStart && leaveMonth(item) <= now);
  const previousLeaves = source.leaves.filter(item => leaveMonth(item) >= previousStart && leaveMonth(item) < currentStart);
  const currentExpenses = source.expenses.filter(item => item.createdAt >= currentStart && item.createdAt <= now);
  const previousExpenses = source.expenses.filter(item => item.createdAt >= previousStart && item.createdAt < currentStart);
  const sumLeaveDays = (items: typeof source.leaves) => items.reduce((total, item) => total + dayCount(item.startDate, item.endDate), 0);
  const sumExpenses = (items: typeof source.expenses) => items.reduce((total, item) => total + (Number(item.amountSar) || 0), 0);
  const leaveCurrent = sumLeaveDays(currentLeaves); const leavePrevious = sumLeaveDays(previousLeaves);
  const expenseCurrent = sumExpenses(currentExpenses); const expensePrevious = sumExpenses(previousExpenses);
  return {
    leaveDays: { ...calculateMonthlyMetric(leaveCurrent, leavePrevious), byType: Object.fromEntries(currentLeaves.reduce((map, item) => map.set(item.leaveType, (map.get(item.leaveType) ?? 0) + dayCount(item.startDate, item.endDate)), new Map<string, number>())) },
    expensesSar: { ...calculateMonthlyMetric(expenseCurrent, expensePrevious), byType: Object.fromEntries(currentExpenses.reduce((map, item) => map.set(item.expenseType, (map.get(item.expenseType) ?? 0) + (Number(item.amountSar) || 0)), new Map<string, number>())) },
  };
}

export type HrReportScope = "company" | "team";
export type HrReportFilters = { category?: "annual" | "sick" | "emergency" | "travel" | "operating"; region?: string };

export function buildOperationsPulse(source: {
  requests: Array<{ status: "submitted" | "in_review" | "approved" | "rejected" | "completed" }>;
  tasks: Array<{ status: "pending" | "approved" | "rejected" | "cancelled" }>;
}) {
  const requestCount = (status: "submitted" | "in_review" | "approved" | "rejected" | "completed") => source.requests.filter(item => item.status === status).length;
  const taskCount = (status: "pending" | "approved" | "rejected" | "cancelled") => source.tasks.filter(item => item.status === status).length;
  return {
    requests: { submitted: requestCount("submitted"), inReview: requestCount("in_review"), completed: requestCount("completed") + requestCount("approved") },
    approvals: { pending: taskCount("pending"), approved: taskCount("approved"), rejected: taskCount("rejected") },
  };
}

export function buildApprovalWorkload(source: { tasks: Array<{ status: "pending" | "approved" | "rejected" | "cancelled"; approverRole: "manager" | "hr" | "government" | "admin"; createdAt: Date }> }, now = new Date()) {
  const pending = source.tasks.filter(task => task.status === "pending");
  const hoursOpen = (task: { createdAt: Date }) => Math.max(0, Math.floor((now.getTime() - task.createdAt.getTime()) / 3600000));
  const byRole = (role: "manager" | "hr" | "government" | "admin") => pending.filter(task => task.approverRole === role).length;
  return {
    pending: pending.length,
    overdue: pending.filter(task => hoursOpen(task) >= 24).length,
    oldestHours: pending.length ? Math.max(...pending.map(hoursOpen)) : 0,
    byRole: { manager: byRole("manager"), hr: byRole("hr"), government: byRole("government"), admin: byRole("admin") },
  };
}

export function assertReportsAccess(role: UserRole): HrReportScope {
  if (role === "admin" || role === "hr") return "company";
  if (role === "manager") return "team";
  throw new Error("لا تملك صلاحية عرض تقارير الموارد البشرية");
}

export function reportDateFromMonth(month?: string) {
  if (!month) return new Date();
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const year = Number(match?.[1]);
  const monthIndex = Number(match?.[2]) - 1;
  if (!match || monthIndex < 0 || monthIndex > 11) throw new Error("صيغة الشهر غير صالحة");
  return new Date(Date.UTC(year, monthIndex, 1));
}

export function buildHrOperationsTrend(source: { leaves: Array<{ startDate: string; endDate: string }>; expenses: Array<{ amountSar: string; createdAt: Date }> }, now = new Date(), periods = 6) {
  const dayCount = (startDate: string, endDate: string) => Math.max(1, Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1);
  return Array.from({ length: periods }, (_, index) => {
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (periods - 1 - index), 1));
    const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    const leaves = source.leaves.filter(item => { const start = new Date(`${item.startDate}T00:00:00Z`); return start >= monthStart && start < nextMonth; });
    const expenses = source.expenses.filter(item => item.createdAt >= monthStart && item.createdAt < nextMonth);
    return { month: monthLabel(monthStart), leaveDays: leaves.reduce((total, item) => total + dayCount(item.startDate, item.endDate), 0), expensesSar: expenses.reduce((total, item) => total + (Number(item.amountSar) || 0), 0) };
  });
}

export async function getHrOperationsReport(companyId: number, role: UserRole, userId: number, month?: string, filters: HrReportFilters = {}) {
  const scope = assertReportsAccess(role);
  const now = reportDateFromMonth(month);
  const db = await getDb();
  const emptyPulse = buildOperationsPulse({ requests: [], tasks: [] });
  if (!db) return { scope, selectedMonth: now.toISOString().slice(0, 7), availableRegions: [], appliedFilters: filters, operationPulse: emptyPulse, ...buildHrOperationsReport({ leaves: [], expenses: [] }, now), trend: buildHrOperationsTrend({ leaves: [], expenses: [] }, now) };

  const teamMemberIds = scope === "team" ? (await db.select({ userId: employeeProfiles.userId }).from(employeeProfiles).where(and(eq(employeeProfiles.companyId, companyId), eq(employeeProfiles.managerUserId, userId)))).map(row => row.userId) : undefined;
  if (scope === "team" && !teamMemberIds?.length) return { scope, selectedMonth: now.toISOString().slice(0, 7), availableRegions: [], appliedFilters: filters, operationPulse: emptyPulse, ...buildHrOperationsReport({ leaves: [], expenses: [] }, now), trend: buildHrOperationsTrend({ leaves: [], expenses: [] }, now) };

  const employeeScope = scope === "team" ? inArray(serviceRequests.employeeId, teamMemberIds!) : undefined;
  const [leaves, expenses, requests, tasks] = await Promise.all([
    db.select({ leaveType: leaveRequests.leaveType, startDate: leaveRequests.startDate, endDate: leaveRequests.endDate, region: employeeProfiles.region }).from(leaveRequests).innerJoin(serviceRequests, eq(leaveRequests.requestId, serviceRequests.id)).innerJoin(employeeProfiles, eq(serviceRequests.employeeId, employeeProfiles.userId)).where(and(eq(leaveRequests.companyId, companyId), eq(employeeProfiles.companyId, companyId), employeeScope)),
    db.select({ expenseType: expenseRequests.expenseType, amountSar: expenseRequests.amountSar, createdAt: expenseRequests.createdAt, region: employeeProfiles.region }).from(expenseRequests).innerJoin(serviceRequests, eq(expenseRequests.requestId, serviceRequests.id)).innerJoin(employeeProfiles, eq(serviceRequests.employeeId, employeeProfiles.userId)).where(and(eq(expenseRequests.companyId, companyId), eq(employeeProfiles.companyId, companyId), employeeScope)),
    db.select({ status: serviceRequests.status }).from(serviceRequests).innerJoin(employeeProfiles, eq(serviceRequests.employeeId, employeeProfiles.userId)).where(and(eq(employeeProfiles.companyId, companyId), employeeScope)),
    db.select({ status: approvalTasks.status }).from(approvalTasks).innerJoin(serviceRequests, eq(approvalTasks.requestId, serviceRequests.id)).innerJoin(employeeProfiles, eq(serviceRequests.employeeId, employeeProfiles.userId)).where(and(eq(approvalTasks.companyId, companyId), eq(employeeProfiles.companyId, companyId), employeeScope)),
  ]);
  const allowedLeaveTypes = ["annual", "sick", "emergency"];
  const allowedExpenseTypes = ["travel", "operating"];
  const visibleLeaves = leaves.filter(item => (!filters.region || item.region === filters.region) && (!filters.category || !allowedLeaveTypes.includes(filters.category) || item.leaveType === filters.category));
  const visibleExpenses = expenses.filter(item => (!filters.region || item.region === filters.region) && (!filters.category || !allowedExpenseTypes.includes(filters.category) || item.expenseType === filters.category));
  const availableRegions = Array.from(new Set([...leaves, ...expenses].map(item => item.region).filter((region): region is string => !!region))).sort();
  return { scope, selectedMonth: now.toISOString().slice(0, 7), availableRegions, appliedFilters: filters, operationPulse: buildOperationsPulse({ requests, tasks }), ...buildHrOperationsReport({ leaves: visibleLeaves, expenses: visibleExpenses }, now), trend: buildHrOperationsTrend({ leaves: visibleLeaves, expenses: visibleExpenses }, now) };
}

export async function getCompanyHrOperationsReport(companyId: number, now = new Date()): Promise<HrOperationsReport> {
  const month = now.toISOString().slice(0, 7);
  const report = await getHrOperationsReport(companyId, "admin", 0, month);
  return { leaveDays: report.leaveDays, expensesSar: report.expensesSar };
}
