import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { requestHistory, serviceRequests, type InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { canManageRequest, type RequestType, type UserRole } from "./requestPolicy";

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
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
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

export async function getRequestDetail(id: number, userId: number, role: UserRole) {
  const db = await getDb();
  if (!db) return undefined;
  const request = (await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1))[0];
  if (!request) return undefined;
  const isManager = canManageRequest(role, request.type);
  if (!isManager && request.employeeId !== userId) return undefined;
  const history = await db.select().from(requestHistory).where(and(eq(requestHistory.requestId, id), ...(isManager ? [] : [eq(requestHistory.visibleToEmployee, true)]) )).orderBy(desc(requestHistory.createdAt));
  return { request, history, canManage: isManager };
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
