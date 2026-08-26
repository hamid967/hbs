import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { accountActivationHistory, approvalTasks, attendanceEntries, attendancePolicies, auditEvents, chatMessages, chatSessions, companyPermissionTemplates, demoRequests, departments, employeeEmergencyContacts, employeeLifecycleEvents, employeeProfiles, employeeShiftAssignments, employeeTrainingAssignments, executionDependencyReviews, expenseRequests, hrSystemPlans, inAppNotifications, jobCandidates, jobInterviews, jobOffers, jobOpenings, leaveRequests, onboardingTaskTemplates, onboardingTasks, requestHistory, serviceRequests, trainingPrograms, type InsertUser, userModulePermissionHistory, userModulePermissions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { canManageRequest, permittedRequestTypes, type RequestType, type UserRole } from "./requestPolicy";
import { createActivationHistoryRecord, getBootstrapAccountSettings } from "./accountPolicy";
import { defaultModulePermissionsForRole, normalizeModulePermissions, type ModulePermission } from "../shared/moduleAccess";
import { isCandidateStatusTransitionAllowed, isInterviewStatusTransitionAllowed, isOfferStatusTransitionAllowed, type CandidateStatus, type InterviewStatus, type OfferStatus } from "./recruitmentRules";

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

export function buildEmployeeProfileLifecycleChanges(previous: { employmentStatus: string; departmentId: number | null; managerUserId: number | null }, next: { employmentStatus: string; departmentId: number | null; managerUserId: number | null }) {
  const changes: Array<{ eventType: EmployeeLifecycleEventType; note: string }> = [];
  if (previous.employmentStatus !== next.employmentStatus) changes.push({ eventType: "status_changed", note: "تحديث الحالة الوظيفية من ملف الموظف" });
  if (previous.departmentId !== next.departmentId) changes.push({ eventType: "department_changed", note: "تحديث القسم من ملف الموظف" });
  if (previous.managerUserId !== next.managerUserId) changes.push({ eventType: "manager_changed", note: "تحديث المدير المباشر من ملف الموظف" });
  return changes;
}

export async function saveEmployeeProfile(input: { companyId: number; userId: number; updatedByUserId: number; employeeNumber?: string; jobTitle?: string; departmentId?: number; region?: string; workLocation?: string; managerUserId?: number; employmentStatus: "active" | "on_leave" | "inactive"; joinedAt?: Date }) {
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
  const existing = (await db.select().from(employeeProfiles).where(and(eq(employeeProfiles.companyId, input.companyId), eq(employeeProfiles.userId, input.userId))).limit(1))[0];
  const values = { companyId: input.companyId, userId: input.userId, employeeNumber: input.employeeNumber ?? null, jobTitle: input.jobTitle ?? null, departmentId: input.departmentId ?? null, region: input.region ?? null, workLocation: input.workLocation ?? null, managerUserId: input.managerUserId ?? null, employmentStatus: input.employmentStatus, joinedAt: input.joinedAt ?? null };
  await db.insert(employeeProfiles).values(values).onDuplicateKeyUpdate({ set: { employeeNumber: values.employeeNumber, jobTitle: values.jobTitle, departmentId: values.departmentId, region: values.region, workLocation: values.workLocation, managerUserId: values.managerUserId, employmentStatus: values.employmentStatus, joinedAt: values.joinedAt } });
  if (existing) {
    const changes = buildEmployeeProfileLifecycleChanges(existing, values);
    if (changes.length) await db.insert(employeeLifecycleEvents).values(changes.map(change => ({ companyId: input.companyId, employeeUserId: input.userId, eventType: change.eventType, effectiveAt: new Date(), note: change.note, createdByUserId: input.updatedByUserId })));
  }
  return (await db.select().from(employeeProfiles).where(eq(employeeProfiles.userId, input.userId)).limit(1))[0];
}

type EmployeeLifecycleEventType = "joined" | "profile_updated" | "status_changed" | "role_changed" | "department_changed" | "manager_changed" | "offboarding_started" | "offboarding_completed";

export async function listCompanyEmployeeLifecycleEvents(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeLifecycleEvents).where(eq(employeeLifecycleEvents.companyId, companyId)).orderBy(desc(employeeLifecycleEvents.effectiveAt), desc(employeeLifecycleEvents.createdAt));
}

export async function createCompanyEmployeeLifecycleEvent(input: { companyId: number; employeeUserId: number; eventType: EmployeeLifecycleEventType; effectiveAt: Date; note?: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const employee = (await db.select().from(users).where(and(eq(users.id, input.employeeUserId), eq(users.companyId, input.companyId))).limit(1))[0];
  if (!employee) throw new Error("الموظف غير موجود ضمن الشركة الحالية");
  await db.insert(employeeLifecycleEvents).values({ companyId: input.companyId, employeeUserId: input.employeeUserId, eventType: input.eventType, effectiveAt: input.effectiveAt, note: input.note ?? null, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(employeeLifecycleEvents).where(and(eq(employeeLifecycleEvents.companyId, input.companyId), eq(employeeLifecycleEvents.employeeUserId, input.employeeUserId), eq(employeeLifecycleEvents.eventType, input.eventType), eq(employeeLifecycleEvents.effectiveAt, input.effectiveAt))).orderBy(desc(employeeLifecycleEvents.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ حدث دورة الحياة");
  return created;
}

export async function listCompanyEmployeeEmergencyContacts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeEmergencyContacts).where(eq(employeeEmergencyContacts.companyId, companyId)).orderBy(desc(employeeEmergencyContacts.updatedAt));
}

export async function saveCompanyEmployeeEmergencyContact(input: { companyId: number; employeeUserId: number; contactName: string; relationship: string; phone: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const employee = (await db.select().from(users).where(and(eq(users.id, input.employeeUserId), eq(users.companyId, input.companyId))).limit(1))[0];
  if (!employee) throw new Error("الموظف غير موجود ضمن الشركة الحالية");
  const values = { companyId: input.companyId, employeeUserId: input.employeeUserId, contactName: input.contactName, relationship: input.relationship, phone: input.phone, createdByUserId: input.createdByUserId };
  await db.insert(employeeEmergencyContacts).values(values).onDuplicateKeyUpdate({ set: { contactName: values.contactName, relationship: values.relationship, phone: values.phone, createdByUserId: values.createdByUserId } });
  const saved = (await db.select().from(employeeEmergencyContacts).where(and(eq(employeeEmergencyContacts.companyId, input.companyId), eq(employeeEmergencyContacts.employeeUserId, input.employeeUserId))).limit(1))[0];
  if (!saved) throw new Error("تعذر حفظ جهة اتصال الطوارئ");
  return saved;
}

type OpeningStatus = "draft" | "open" | "closed";
type EmploymentType = "full_time" | "part_time" | "contract";

async function ensureRecruitmentCompanyUser(companyId: number, userId: number, label: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const user = (await db.select().from(users).where(and(eq(users.id, userId), eq(users.companyId, companyId), eq(users.accountStatus, "active"))).limit(1))[0];
  if (!user) throw new Error(`${label} غير موجود ضمن الشركة الحالية أو غير مفعّل`);
  return user;
}

export async function listCompanyJobOpenings(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ opening: jobOpenings, department: departments, manager: users }).from(jobOpenings).leftJoin(departments, eq(jobOpenings.departmentId, departments.id)).leftJoin(users, eq(jobOpenings.hiringManagerUserId, users.id)).where(eq(jobOpenings.companyId, companyId)).orderBy(desc(jobOpenings.updatedAt));
}

export async function createCompanyJobOpening(input: { companyId: number; createdByUserId: number; title: string; departmentId?: number; hiringManagerUserId?: number; employmentType: EmploymentType; headcount: number; description?: string; status: OpeningStatus }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  if (input.departmentId) {
    const department = (await db.select().from(departments).where(and(eq(departments.id, input.departmentId), eq(departments.companyId, input.companyId))).limit(1))[0];
    if (!department) throw new Error("القسم غير موجود ضمن الشركة الحالية");
  }
  if (input.hiringManagerUserId) await ensureRecruitmentCompanyUser(input.companyId, input.hiringManagerUserId, "المدير المسؤول");
  await db.insert(jobOpenings).values({ ...input, departmentId: input.departmentId ?? null, hiringManagerUserId: input.hiringManagerUserId ?? null, description: input.description ?? null });
  const created = (await db.select().from(jobOpenings).where(and(eq(jobOpenings.companyId, input.companyId), eq(jobOpenings.title, input.title))).orderBy(desc(jobOpenings.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ الشاغر");
  return created;
}

export async function listCompanyJobCandidates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ candidate: jobCandidates, opening: jobOpenings }).from(jobCandidates).innerJoin(jobOpenings, eq(jobCandidates.openingId, jobOpenings.id)).where(and(eq(jobCandidates.companyId, companyId), eq(jobOpenings.companyId, companyId))).orderBy(desc(jobCandidates.updatedAt));
}

export async function createCompanyJobCandidate(input: { companyId: number; openingId: number; fullName: string; email?: string; internalNote?: string; expectedStartAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const opening = (await db.select().from(jobOpenings).where(and(eq(jobOpenings.id, input.openingId), eq(jobOpenings.companyId, input.companyId))).limit(1))[0];
  if (!opening) throw new Error("الشاغر غير موجود ضمن الشركة الحالية");
  await db.insert(jobCandidates).values({ companyId: input.companyId, openingId: input.openingId, fullName: input.fullName, email: input.email ?? null, internalNote: input.internalNote ?? null, expectedStartAt: input.expectedStartAt ?? null });
  const created = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.companyId, input.companyId), eq(jobCandidates.openingId, input.openingId), eq(jobCandidates.fullName, input.fullName))).orderBy(desc(jobCandidates.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ المرشح");
  return created;
}

export async function updateCompanyJobCandidate(input: { companyId: number; candidateId: number; status: CandidateStatus; internalNote?: string; expectedStartAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const candidate = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
  if (!candidate) throw new Error("المرشح غير موجود ضمن الشركة الحالية");
  if (!isCandidateStatusTransitionAllowed(candidate.status, input.status)) throw new Error("لا يسمح بالانتقال بين مراحل المرشح المحددة");
  await db.update(jobCandidates).set({ status: input.status, internalNote: input.internalNote ?? candidate.internalNote, expectedStartAt: input.expectedStartAt ?? candidate.expectedStartAt }).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId)));
  return (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
}

export async function listCompanyJobInterviews(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ interview: jobInterviews, candidate: jobCandidates, opening: jobOpenings, interviewer: users }).from(jobInterviews).innerJoin(jobCandidates, eq(jobInterviews.candidateId, jobCandidates.id)).innerJoin(jobOpenings, eq(jobCandidates.openingId, jobOpenings.id)).innerJoin(users, eq(jobInterviews.interviewerUserId, users.id)).where(and(eq(jobInterviews.companyId, companyId), eq(jobCandidates.companyId, companyId), eq(jobOpenings.companyId, companyId), eq(users.companyId, companyId))).orderBy(desc(jobInterviews.scheduledAt));
}

export async function createCompanyJobInterview(input: { companyId: number; candidateId: number; interviewerUserId: number; scheduledAt: Date; channel: "in_person" | "video" | "phone"; internalSummary?: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const candidate = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
  if (!candidate) throw new Error("المرشح غير موجود ضمن الشركة الحالية");
  if (!isCandidateStatusTransitionAllowed(candidate.status, "interview")) throw new Error("لا يمكن جدولة مقابلة لمرشح في هذه المرحلة");
  await ensureRecruitmentCompanyUser(input.companyId, input.interviewerUserId, "محاور المقابلة");
  if (candidate.status !== "interview") await db.update(jobCandidates).set({ status: "interview" }).where(and(eq(jobCandidates.id, candidate.id), eq(jobCandidates.companyId, input.companyId)));
  await db.insert(jobInterviews).values({ companyId: input.companyId, candidateId: input.candidateId, interviewerUserId: input.interviewerUserId, scheduledAt: input.scheduledAt, channel: input.channel, internalSummary: input.internalSummary ?? null, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(jobInterviews).where(and(eq(jobInterviews.companyId, input.companyId), eq(jobInterviews.candidateId, input.candidateId), eq(jobInterviews.interviewerUserId, input.interviewerUserId), eq(jobInterviews.scheduledAt, input.scheduledAt))).orderBy(desc(jobInterviews.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ المقابلة");
  return created;
}

export async function updateCompanyJobInterview(input: { companyId: number; interviewId: number; status: InterviewStatus; internalSummary?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const interview = (await db.select().from(jobInterviews).where(and(eq(jobInterviews.id, input.interviewId), eq(jobInterviews.companyId, input.companyId))).limit(1))[0];
  if (!interview) throw new Error("المقابلة غير موجودة ضمن الشركة الحالية");
  if (!isInterviewStatusTransitionAllowed(interview.status, input.status)) throw new Error("لا يسمح بالانتقال بين حالات المقابلة المحددة");
  await db.update(jobInterviews).set({ status: input.status, internalSummary: input.internalSummary ?? interview.internalSummary }).where(and(eq(jobInterviews.id, input.interviewId), eq(jobInterviews.companyId, input.companyId)));
  return (await db.select().from(jobInterviews).where(and(eq(jobInterviews.id, input.interviewId), eq(jobInterviews.companyId, input.companyId))).limit(1))[0];
}

export async function listCompanyJobOffers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ offer: jobOffers, candidate: jobCandidates, opening: jobOpenings }).from(jobOffers).innerJoin(jobCandidates, eq(jobOffers.candidateId, jobCandidates.id)).innerJoin(jobOpenings, eq(jobCandidates.openingId, jobOpenings.id)).where(and(eq(jobOffers.companyId, companyId), eq(jobCandidates.companyId, companyId), eq(jobOpenings.companyId, companyId))).orderBy(desc(jobOffers.updatedAt));
}

export async function createCompanyJobOffer(input: { companyId: number; candidateId: number; proposedStartAt?: Date; responseDueAt?: Date; internalNote?: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const candidate = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
  if (!candidate) throw new Error("المرشح غير موجود ضمن الشركة الحالية");
  if (!isCandidateStatusTransitionAllowed(candidate.status, "offer")) throw new Error("لا يمكن إنشاء عرض لمرشح في هذه المرحلة");
  if (candidate.status !== "offer") await db.update(jobCandidates).set({ status: "offer" }).where(and(eq(jobCandidates.id, candidate.id), eq(jobCandidates.companyId, input.companyId)));
  await db.insert(jobOffers).values({ companyId: input.companyId, candidateId: input.candidateId, proposedStartAt: input.proposedStartAt ?? null, responseDueAt: input.responseDueAt ?? null, internalNote: input.internalNote ?? null, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(jobOffers).where(and(eq(jobOffers.companyId, input.companyId), eq(jobOffers.candidateId, input.candidateId))).orderBy(desc(jobOffers.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ العرض الداخلي");
  return created;
}

export async function updateCompanyJobOffer(input: { companyId: number; offerId: number; status: OfferStatus; internalNote?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const offer = (await db.select().from(jobOffers).where(and(eq(jobOffers.id, input.offerId), eq(jobOffers.companyId, input.companyId))).limit(1))[0];
  if (!offer) throw new Error("العرض الداخلي غير موجود ضمن الشركة الحالية");
  if (!isOfferStatusTransitionAllowed(offer.status, input.status)) throw new Error("لا يسمح بالانتقال بين حالات العرض المحددة");
  const now = new Date();
  await db.update(jobOffers).set({ status: input.status, internalNote: input.internalNote ?? offer.internalNote, issuedAt: input.status === "issued" ? now : offer.issuedAt, decidedAt: ["accepted", "declined", "withdrawn"].includes(input.status) ? now : offer.decidedAt }).where(and(eq(jobOffers.id, input.offerId), eq(jobOffers.companyId, input.companyId)));
  if (input.status === "accepted") await updateCompanyJobCandidate({ companyId: input.companyId, candidateId: offer.candidateId, status: "accepted" });
  return (await db.select().from(jobOffers).where(and(eq(jobOffers.id, input.offerId), eq(jobOffers.companyId, input.companyId))).limit(1))[0];
}

export async function listCompanyOnboardingTasks(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ task: onboardingTasks, candidate: jobCandidates, opening: jobOpenings, owner: users }).from(onboardingTasks).innerJoin(jobCandidates, eq(onboardingTasks.candidateId, jobCandidates.id)).innerJoin(jobOpenings, eq(jobCandidates.openingId, jobOpenings.id)).leftJoin(users, eq(onboardingTasks.ownerUserId, users.id)).where(and(eq(onboardingTasks.companyId, companyId), eq(jobCandidates.companyId, companyId), eq(jobOpenings.companyId, companyId))).orderBy(desc(onboardingTasks.updatedAt));
}

export async function listCompanyOnboardingTaskTemplates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ template: onboardingTaskTemplates, owner: users }).from(onboardingTaskTemplates).leftJoin(users, and(eq(onboardingTaskTemplates.defaultOwnerUserId, users.id), eq(users.companyId, companyId))).where(eq(onboardingTaskTemplates.companyId, companyId)).orderBy(desc(onboardingTaskTemplates.updatedAt));
}

export async function createCompanyOnboardingTaskTemplate(input: { companyId: number; title: string; defaultOwnerUserId?: number; dueOffsetDays: number; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  if (input.defaultOwnerUserId) await ensureRecruitmentCompanyUser(input.companyId, input.defaultOwnerUserId, "مالك القالب");
  await db.insert(onboardingTaskTemplates).values({ companyId: input.companyId, title: input.title, defaultOwnerUserId: input.defaultOwnerUserId ?? null, dueOffsetDays: input.dueOffsetDays, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(onboardingTaskTemplates).where(and(eq(onboardingTaskTemplates.companyId, input.companyId), eq(onboardingTaskTemplates.title, input.title))).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ قالب التهيئة");
  return created;
}

export async function applyCompanyOnboardingTaskTemplate(input: { companyId: number; templateId: number; candidateId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const template = (await db.select().from(onboardingTaskTemplates).where(and(eq(onboardingTaskTemplates.id, input.templateId), eq(onboardingTaskTemplates.companyId, input.companyId))).limit(1))[0];
  if (!template) throw new Error("قالب التهيئة غير موجود ضمن الشركة الحالية");
  const candidate = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
  if (!candidate) throw new Error("المرشح غير موجود ضمن الشركة الحالية");
  if (candidate.status !== "accepted") throw new Error("لا يمكن تطبيق قالب التهيئة إلا على مرشح مقبول");
  if (template.defaultOwnerUserId) await ensureRecruitmentCompanyUser(input.companyId, template.defaultOwnerUserId, "مالك القالب");
  const existing = (await db.select().from(onboardingTasks).where(and(eq(onboardingTasks.companyId, input.companyId), eq(onboardingTasks.candidateId, input.candidateId), eq(onboardingTasks.title, template.title))).limit(1))[0];
  if (existing) throw new Error("طُبّق هذا القالب على المرشح مسبقاً");
  const anchor = candidate.expectedStartAt ?? new Date();
  const dueAt = new Date(anchor);
  dueAt.setUTCDate(dueAt.getUTCDate() + template.dueOffsetDays);
  await db.insert(onboardingTasks).values({ companyId: input.companyId, candidateId: input.candidateId, ownerUserId: template.defaultOwnerUserId, title: template.title, dueAt });
  const created = (await db.select().from(onboardingTasks).where(and(eq(onboardingTasks.companyId, input.companyId), eq(onboardingTasks.candidateId, input.candidateId), eq(onboardingTasks.title, template.title))).orderBy(desc(onboardingTasks.id)).limit(1))[0];
  if (!created) throw new Error("تعذر تطبيق قالب التهيئة");
  return created;
}

export async function createCompanyOnboardingTask(input: { companyId: number; candidateId: number; ownerUserId?: number; title: string; dueAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const candidate = (await db.select().from(jobCandidates).where(and(eq(jobCandidates.id, input.candidateId), eq(jobCandidates.companyId, input.companyId))).limit(1))[0];
  if (!candidate) throw new Error("المرشح غير موجود ضمن الشركة الحالية");
  if (input.ownerUserId) await ensureRecruitmentCompanyUser(input.companyId, input.ownerUserId, "مالك مهمة التهيئة");
  await db.insert(onboardingTasks).values({ companyId: input.companyId, candidateId: input.candidateId, ownerUserId: input.ownerUserId ?? null, title: input.title, dueAt: input.dueAt ?? null });
  const created = (await db.select().from(onboardingTasks).where(and(eq(onboardingTasks.companyId, input.companyId), eq(onboardingTasks.candidateId, input.candidateId), eq(onboardingTasks.title, input.title))).orderBy(desc(onboardingTasks.id)).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ مهمة التهيئة");
  return created;
}

export async function completeCompanyOnboardingTask(companyId: number, taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const task = (await db.select().from(onboardingTasks).where(and(eq(onboardingTasks.id, taskId), eq(onboardingTasks.companyId, companyId))).limit(1))[0];
  if (!task) throw new Error("مهمة التهيئة غير موجودة ضمن الشركة الحالية");
  await db.update(onboardingTasks).set({ status: "completed", completedAt: new Date() }).where(and(eq(onboardingTasks.id, taskId), eq(onboardingTasks.companyId, companyId)));
  return (await db.select().from(onboardingTasks).where(and(eq(onboardingTasks.id, taskId), eq(onboardingTasks.companyId, companyId))).limit(1))[0];
}

export function getSaudiWorkDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export async function getMyAttendanceEntry(companyId: number, userId: number, workDate = getSaudiWorkDate()) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(attendanceEntries).where(and(eq(attendanceEntries.companyId, companyId), eq(attendanceEntries.userId, userId), eq(attendanceEntries.workDate, workDate))).limit(1))[0];
}

export async function checkInAttendance(input: { companyId: number; userId: number; workMode: "onsite" | "remote"; note?: string; now?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const now = input.now ?? new Date();
  const workDate = getSaudiWorkDate(now);
  const existing = await getMyAttendanceEntry(input.companyId, input.userId, workDate);
  if (existing) throw new Error("تم تسجيل دوامك لهذا اليوم بالفعل");
  await db.insert(attendanceEntries).values({ companyId: input.companyId, userId: input.userId, workDate, workMode: input.workMode, status: "open", checkInAt: now, note: input.note ?? null });
  return (await db.select().from(attendanceEntries).where(and(eq(attendanceEntries.companyId, input.companyId), eq(attendanceEntries.userId, input.userId), eq(attendanceEntries.workDate, workDate))).limit(1))[0];
}

export async function checkOutAttendance(input: { companyId: number; userId: number; now?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const now = input.now ?? new Date();
  const workDate = getSaudiWorkDate(now);
  const existing = await getMyAttendanceEntry(input.companyId, input.userId, workDate);
  if (!existing) throw new Error("لا يوجد تسجيل حضور مفتوح لهذا اليوم");
  if (existing.status === "completed") throw new Error("تم تسجيل الانصراف لهذا اليوم بالفعل");
  await db.update(attendanceEntries).set({ status: "completed", checkOutAt: now }).where(and(eq(attendanceEntries.id, existing.id), eq(attendanceEntries.companyId, input.companyId), eq(attendanceEntries.userId, input.userId)));
  return (await db.select().from(attendanceEntries).where(eq(attendanceEntries.id, existing.id)).limit(1))[0];
}

export async function listAttendanceForScope(input: { companyId: number; actorId: number; role: UserRole; workDate?: string }) {
  const db = await getDb();
  if (!db) return [];
  const workDate = input.workDate ?? getSaudiWorkDate();
  const base = db.select({ entry: attendanceEntries, user: users, profile: employeeProfiles }).from(attendanceEntries).innerJoin(users, eq(attendanceEntries.userId, users.id)).leftJoin(employeeProfiles, eq(employeeProfiles.userId, users.id));
  const companyAndDate = and(eq(attendanceEntries.companyId, input.companyId), eq(attendanceEntries.workDate, workDate), eq(users.companyId, input.companyId), eq(users.accountStatus, "active"));
  if (["admin", "hr"].includes(input.role)) return base.where(companyAndDate).orderBy(desc(attendanceEntries.checkInAt));
  if (input.role === "manager") return base.where(and(companyAndDate, eq(employeeProfiles.managerUserId, input.actorId))).orderBy(desc(attendanceEntries.checkInAt));
  return base.where(and(companyAndDate, eq(attendanceEntries.userId, input.actorId))).orderBy(desc(attendanceEntries.checkInAt));
}

export async function listCompanyAttendancePolicies(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendancePolicies).where(eq(attendancePolicies.companyId, companyId)).orderBy(desc(attendancePolicies.isActive), desc(attendancePolicies.updatedAt));
}

export async function listCompanyShiftAssignments(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ assignment: employeeShiftAssignments, policy: attendancePolicies, employee: users }).from(employeeShiftAssignments).innerJoin(attendancePolicies, eq(employeeShiftAssignments.attendancePolicyId, attendancePolicies.id)).innerJoin(users, eq(employeeShiftAssignments.employeeUserId, users.id)).where(and(eq(employeeShiftAssignments.companyId, companyId), eq(attendancePolicies.companyId, companyId), eq(users.companyId, companyId))).orderBy(desc(employeeShiftAssignments.effectiveFrom), desc(employeeShiftAssignments.createdAt));
}

export async function createCompanyAttendancePolicy(input: { companyId: number; title: string; startTime: string; endTime: string; workDays: string; graceMinutes: number; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(attendancePolicies).values({ companyId: input.companyId, title: input.title, startTime: input.startTime, endTime: input.endTime, workDays: input.workDays, graceMinutes: input.graceMinutes, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(attendancePolicies).where(and(eq(attendancePolicies.companyId, input.companyId), eq(attendancePolicies.title, input.title))).limit(1))[0];
  if (!created) throw new Error("تعذر حفظ سياسة الدوام");
  return created;
}

export async function assignCompanyAttendancePolicy(input: { companyId: number; employeeUserId: number; attendancePolicyId: number; effectiveFrom: string; effectiveTo?: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const employee = (await db.select().from(users).where(and(eq(users.id, input.employeeUserId), eq(users.companyId, input.companyId), eq(users.accountStatus, "active"))).limit(1))[0];
  if (!employee) throw new Error("الموظف غير موجود ضمن الشركة الحالية أو غير مفعّل");
  const policy = (await db.select().from(attendancePolicies).where(and(eq(attendancePolicies.id, input.attendancePolicyId), eq(attendancePolicies.companyId, input.companyId), eq(attendancePolicies.isActive, true))).limit(1))[0];
  if (!policy) throw new Error("سياسة الدوام غير موجودة ضمن الشركة الحالية أو غير مفعّلة");
  if (input.effectiveTo && input.effectiveTo < input.effectiveFrom) throw new Error("تاريخ نهاية الوردية يجب أن يأتي بعد تاريخ البداية");
  const existing = (await db.select().from(employeeShiftAssignments).where(and(eq(employeeShiftAssignments.companyId, input.companyId), eq(employeeShiftAssignments.employeeUserId, input.employeeUserId), eq(employeeShiftAssignments.attendancePolicyId, input.attendancePolicyId), eq(employeeShiftAssignments.effectiveFrom, input.effectiveFrom))).limit(1))[0];
  if (existing) throw new Error("هذه الوردية مضافة للموظف بالتاريخ نفسه بالفعل");
  await db.insert(employeeShiftAssignments).values({ companyId: input.companyId, employeeUserId: input.employeeUserId, attendancePolicyId: input.attendancePolicyId, effectiveFrom: input.effectiveFrom, effectiveTo: input.effectiveTo ?? null, createdByUserId: input.createdByUserId });
  const created = (await db.select().from(employeeShiftAssignments).where(and(eq(employeeShiftAssignments.companyId, input.companyId), eq(employeeShiftAssignments.employeeUserId, input.employeeUserId), eq(employeeShiftAssignments.attendancePolicyId, input.attendancePolicyId), eq(employeeShiftAssignments.effectiveFrom, input.effectiveFrom))).orderBy(desc(employeeShiftAssignments.id)).limit(1))[0];
  if (!created) throw new Error("تعذر تعيين وردية الموظف");
  return created;
}

export async function listCompanyTrainingPrograms(companyId: number) { const db = await getDb(); if (!db) return []; return db.select().from(trainingPrograms).where(eq(trainingPrograms.companyId, companyId)).orderBy(desc(trainingPrograms.isActive), desc(trainingPrograms.updatedAt)); }
export async function listCompanyTrainingAssignments(companyId: number) { const db = await getDb(); if (!db) return []; return db.select({ assignment: employeeTrainingAssignments, program: trainingPrograms, employee: users }).from(employeeTrainingAssignments).innerJoin(trainingPrograms, eq(employeeTrainingAssignments.trainingProgramId, trainingPrograms.id)).innerJoin(users, eq(employeeTrainingAssignments.employeeUserId, users.id)).where(and(eq(employeeTrainingAssignments.companyId, companyId), eq(trainingPrograms.companyId, companyId), eq(users.companyId, companyId))).orderBy(desc(employeeTrainingAssignments.createdAt)); }
export async function listMyTrainingAssignments(companyId: number, userId: number) { const db = await getDb(); if (!db) return []; return db.select({ assignment: employeeTrainingAssignments, program: trainingPrograms }).from(employeeTrainingAssignments).innerJoin(trainingPrograms, eq(employeeTrainingAssignments.trainingProgramId, trainingPrograms.id)).where(and(eq(employeeTrainingAssignments.companyId, companyId), eq(employeeTrainingAssignments.employeeUserId, userId), eq(trainingPrograms.companyId, companyId), eq(employeeTrainingAssignments.status, "assigned"))).orderBy(desc(employeeTrainingAssignments.dueAt), desc(employeeTrainingAssignments.createdAt)); }
export async function listCompanyExecutionDependencyReviews(companyId: number) { const db = await getDb(); if (!db) return []; return db.select().from(executionDependencyReviews).where(eq(executionDependencyReviews.companyId, companyId)).orderBy(desc(executionDependencyReviews.updatedAt)); }
export async function requestExecutionDependencyReview(input: { companyId: number; stageNumber: number; requestedByUserId: number }) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); const existing = (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; if (existing) { await db.update(executionDependencyReviews).set({ status: "review_requested", requestedByUserId: input.requestedByUserId, reviewedByUserId: null, reviewedAt: null, retryRequestedAt: null }).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))); } else { await db.insert(executionDependencyReviews).values({ companyId: input.companyId, stageNumber: input.stageNumber, requestedByUserId: input.requestedByUserId }); } const saved = (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; if (!saved) throw new Error("تعذر حفظ طلب مراجعة الاعتمادية"); return saved; }
export async function resolveExecutionDependency(input: { companyId: number; stageNumber: number; reviewedByUserId: number }) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); const existing = (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; if (!existing) throw new Error("لا يوجد طلب مراجعة مسجل لهذا البند"); await db.update(executionDependencyReviews).set({ status: "dependency_resolved", reviewedByUserId: input.reviewedByUserId, reviewedAt: new Date(), retryRequestedAt: null }).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))); return (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; }
export async function requestExecutionRetry(input: { companyId: number; stageNumber: number }) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); const existing = (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; if (!existing || existing.status !== "dependency_resolved") throw new Error("لا يمكن إعادة المحاولة قبل إقرار حل الاعتمادية"); await db.update(executionDependencyReviews).set({ status: "retry_requested", retryRequestedAt: new Date() }).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))); return (await db.select().from(executionDependencyReviews).where(and(eq(executionDependencyReviews.companyId, input.companyId), eq(executionDependencyReviews.stageNumber, input.stageNumber))).limit(1))[0]; }
export async function createCompanyTrainingProgram(input: { companyId: number; title: string; description?: string; durationMinutes: number; createdByUserId: number }) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); await db.insert(trainingPrograms).values({ companyId: input.companyId, title: input.title, description: input.description ?? null, durationMinutes: input.durationMinutes, createdByUserId: input.createdByUserId }); const created = (await db.select().from(trainingPrograms).where(and(eq(trainingPrograms.companyId, input.companyId), eq(trainingPrograms.title, input.title))).limit(1))[0]; if (!created) throw new Error("تعذر حفظ مسار التدريب"); return created; }
export async function assignCompanyTrainingProgram(input: { companyId: number; employeeUserId: number; trainingProgramId: number; dueAt?: Date; assignedByUserId: number }) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً"); const employee = (await db.select().from(users).where(and(eq(users.id, input.employeeUserId), eq(users.companyId, input.companyId), eq(users.accountStatus, "active"))).limit(1))[0]; if (!employee) throw new Error("الموظف غير موجود ضمن الشركة الحالية أو غير مفعّل"); const program = (await db.select().from(trainingPrograms).where(and(eq(trainingPrograms.id, input.trainingProgramId), eq(trainingPrograms.companyId, input.companyId), eq(trainingPrograms.isActive, true))).limit(1))[0]; if (!program) throw new Error("مسار التدريب غير موجود ضمن الشركة الحالية أو غير مفعّل"); await db.insert(employeeTrainingAssignments).values({ companyId: input.companyId, employeeUserId: input.employeeUserId, trainingProgramId: input.trainingProgramId, dueAt: input.dueAt ?? null, assignedByUserId: input.assignedByUserId }); const created = (await db.select().from(employeeTrainingAssignments).where(and(eq(employeeTrainingAssignments.companyId, input.companyId), eq(employeeTrainingAssignments.employeeUserId, input.employeeUserId), eq(employeeTrainingAssignments.trainingProgramId, input.trainingProgramId))).limit(1))[0]; if (!created) throw new Error("تعذر تعيين مسار التدريب"); return created; }

type AuditCategory = "recruitment" | "attendance" | "training" | "approval" | "account" | "permission";

export async function recordAuditEvent(input: { companyId: number; actorUserId?: number; category: AuditCategory; action: string; entityType: string; entityId?: number; summary: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.insert(auditEvents).values({ companyId: input.companyId, actorUserId: input.actorUserId ?? null, category: input.category, action: input.action, entityType: input.entityType, entityId: input.entityId ?? null, summary: input.summary });
}

export async function listCompanyAuditEvents(companyId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ event: auditEvents, actor: users }).from(auditEvents).leftJoin(users, eq(auditEvents.actorUserId, users.id)).where(eq(auditEvents.companyId, companyId)).orderBy(desc(auditEvents.createdAt)).limit(Math.min(Math.max(limit, 1), 200));
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
