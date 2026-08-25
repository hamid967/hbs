import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  companyId: int("companyId").notNull().default(1).references(() => companies.id, { onDelete: "restrict" }),
  role: mysqlEnum("role", ["user", "hr", "government", "manager", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["pending", "active", "suspended", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const accountActivationHistory = mysqlTable("accountActivationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorId: int("actorId").references(() => users.id, { onDelete: "set null" }),
  previousStatus: varchar("previousStatus", { length: 32 }),
  nextStatus: mysqlEnum("nextStatus", ["pending", "active", "suspended", "rejected"]).notNull(),
  assignedRole: mysqlEnum("assignedRole", ["user", "hr", "government", "manager", "admin"]),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accessModules = ["hr", "government"] as const;

export const userModulePermissions = mysqlTable("userModulePermissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  module: mysqlEnum("module", accessModules).notNull(),
  canView: boolean("canView").default(false).notNull(),
  canManage: boolean("canManage").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("userModulePermissions_user_module_unique").on(table.userId, table.module)]);

export const userModulePermissionHistory = mysqlTable("userModulePermissionHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorId: int("actorId").references(() => users.id, { onDelete: "set null" }),
  module: mysqlEnum("module", accessModules).notNull(),
  previousCanView: boolean("previousCanView").default(false).notNull(),
  previousCanManage: boolean("previousCanManage").default(false).notNull(),
  nextCanView: boolean("nextCanView").default(false).notNull(),
  nextCanManage: boolean("nextCanManage").default(false).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const companyPermissionTemplates = mysqlTable("companyPermissionTemplates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 120 }).notNull(),
  description: varchar("description", { length: 360 }),
  role: mysqlEnum("role", ["user", "hr", "government", "manager", "admin"]).notNull(),
  hrCanView: boolean("hrCanView").default(false).notNull(),
  hrCanManage: boolean("hrCanManage").default(false).notNull(),
  governmentCanView: boolean("governmentCanView").default(false).notNull(),
  governmentCanManage: boolean("governmentCanManage").default(false).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("companyPermissionTemplates_company_title_unique").on(table.companyId, table.title)]);

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 32 }),
  managerUserId: int("managerUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("departments_company_name_unique").on(table.companyId, table.name)]);

export const employeeProfiles = mysqlTable("employeeProfiles", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  employeeNumber: varchar("employeeNumber", { length: 40 }),
  jobTitle: varchar("jobTitle", { length: 160 }),
  departmentId: int("departmentId").references(() => departments.id, { onDelete: "set null" }),
  region: varchar("region", { length: 120 }),
  managerUserId: int("managerUserId").references(() => users.id, { onDelete: "set null" }),
  employmentStatus: mysqlEnum("employmentStatus", ["active", "on_leave", "inactive"]).default("active").notNull(),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("employeeProfiles_user_unique").on(table.userId), uniqueIndex("employeeProfiles_company_number_unique").on(table.companyId, table.employeeNumber)]);

export const employeeLifecycleEvents = mysqlTable("employeeLifecycleEvents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  employeeUserId: int("employeeUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: mysqlEnum("eventType", ["joined", "status_changed", "role_changed", "department_changed", "manager_changed", "offboarding_started", "offboarding_completed"]).notNull(),
  effectiveAt: timestamp("effectiveAt").notNull(),
  note: varchar("note", { length: 500 }),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("employeeLifecycleEvents_company_employee_effective_idx").on(table.companyId, table.employeeUserId, table.effectiveAt), index("employeeLifecycleEvents_company_type_idx").on(table.companyId, table.eventType)]);

export const jobOpenings = mysqlTable("jobOpenings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  departmentId: int("departmentId").references(() => departments.id, { onDelete: "set null" }),
  hiringManagerUserId: int("hiringManagerUserId").references(() => users.id, { onDelete: "set null" }),
  employmentType: mysqlEnum("employmentType", ["full_time", "part_time", "contract"]).default("full_time").notNull(),
  headcount: int("headcount").default(1).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "open", "closed"]).default("draft").notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("jobOpenings_company_status_idx").on(table.companyId, table.status)]);

export const jobCandidates = mysqlTable("jobCandidates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  openingId: int("openingId").notNull().references(() => jobOpenings.id, { onDelete: "cascade" }),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["applied", "screening", "interview", "offer", "accepted", "rejected", "withdrawn"]).default("applied").notNull(),
  internalNote: text("internalNote"),
  expectedStartAt: timestamp("expectedStartAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("jobCandidates_company_opening_status_idx").on(table.companyId, table.openingId, table.status)]);

export const onboardingTasks = mysqlTable("onboardingTasks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  candidateId: int("candidateId").notNull().references(() => jobCandidates.id, { onDelete: "cascade" }),
  ownerUserId: int("ownerUserId").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed"]).default("pending").notNull(),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("onboardingTasks_company_candidate_status_idx").on(table.companyId, table.candidateId, table.status)]);

export const onboardingTaskTemplates = mysqlTable("onboardingTaskTemplates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  defaultOwnerUserId: int("defaultOwnerUserId").references(() => users.id, { onDelete: "set null" }),
  dueOffsetDays: int("dueOffsetDays").default(0).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("onboardingTaskTemplates_company_title_unique").on(table.companyId, table.title), index("onboardingTaskTemplates_company_owner_idx").on(table.companyId, table.defaultOwnerUserId)]);

export const jobInterviews = mysqlTable("jobInterviews", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  candidateId: int("candidateId").notNull().references(() => jobCandidates.id, { onDelete: "cascade" }),
  interviewerUserId: int("interviewerUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  channel: mysqlEnum("channel", ["in_person", "video", "phone"]).default("video").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  internalSummary: text("internalSummary"),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("jobInterviews_company_candidate_scheduled_idx").on(table.companyId, table.candidateId, table.scheduledAt), index("jobInterviews_company_interviewer_idx").on(table.companyId, table.interviewerUserId)]);

export const jobOffers = mysqlTable("jobOffers", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  candidateId: int("candidateId").notNull().references(() => jobCandidates.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["draft", "issued", "accepted", "declined", "withdrawn"]).default("draft").notNull(),
  proposedStartAt: timestamp("proposedStartAt"),
  responseDueAt: timestamp("responseDueAt"),
  internalNote: text("internalNote"),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  issuedAt: timestamp("issuedAt"),
  decidedAt: timestamp("decidedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("jobOffers_company_candidate_status_idx").on(table.companyId, table.candidateId, table.status)]);

export const attendanceEntries = mysqlTable("attendanceEntries", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  workDate: varchar("workDate", { length: 10 }).notNull(),
  workMode: mysqlEnum("workMode", ["onsite", "remote"]).default("onsite").notNull(),
  status: mysqlEnum("status", ["open", "completed"]).default("open").notNull(),
  checkInAt: timestamp("checkInAt").notNull(),
  checkOutAt: timestamp("checkOutAt"),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("attendanceEntries_company_user_date_unique").on(table.companyId, table.userId, table.workDate), index("attendanceEntries_company_date_idx").on(table.companyId, table.workDate)]);

export const attendancePolicies = mysqlTable("attendancePolicies", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  workDays: varchar("workDays", { length: 32 }).notNull(),
  graceMinutes: int("graceMinutes").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("attendancePolicies_company_title_unique").on(table.companyId, table.title), index("attendancePolicies_company_active_idx").on(table.companyId, table.isActive)]);

export const employeeShiftAssignments = mysqlTable("employeeShiftAssignments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  employeeUserId: int("employeeUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  attendancePolicyId: int("attendancePolicyId").notNull().references(() => attendancePolicies.id, { onDelete: "cascade" }),
  effectiveFrom: varchar("effectiveFrom", { length: 10 }).notNull(),
  effectiveTo: varchar("effectiveTo", { length: 10 }),
  createdByUserId: int("createdByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("employeeShiftAssignments_company_employee_from_idx").on(table.companyId, table.employeeUserId, table.effectiveFrom), index("employeeShiftAssignments_company_policy_idx").on(table.companyId, table.attendancePolicyId)]);

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  actorUserId: int("actorUserId").references(() => users.id, { onDelete: "set null" }),
  category: mysqlEnum("category", ["recruitment", "attendance", "approval", "account", "permission"]).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId"),
  summary: varchar("summary", { length: 360 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("auditEvents_company_created_idx").on(table.companyId, table.createdAt), index("auditEvents_company_category_idx").on(table.companyId, table.category)]);

export const approvalTasks = mysqlTable("approvalTasks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  requestId: int("requestId").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }),
  approverRole: mysqlEnum("approverRole", ["hr", "government", "manager", "admin"]).notNull(),
  assigneeUserId: int("assigneeUserId").references(() => users.id, { onDelete: "set null" }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  decidedByUserId: int("decidedByUserId").references(() => users.id, { onDelete: "set null" }),
  decisionNote: text("decisionNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  decidedAt: timestamp("decidedAt"),
}, table => [uniqueIndex("approvalTasks_request_role_unique").on(table.requestId, table.approverRole)]);

export const inAppNotifications = mysqlTable("inAppNotifications", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  recipientUserId: int("recipientUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["approval_required", "request_decision"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  href: varchar("href", { length: 320 }),
  relatedRequestId: int("relatedRequestId").references(() => serviceRequests.id, { onDelete: "set null" }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("inAppNotifications_recipient_created_idx").on(table.recipientUserId, table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserModulePermission = typeof userModulePermissions.$inferSelect;
export type CompanyPermissionTemplate = typeof companyPermissionTemplates.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type EmployeeLifecycleEvent = typeof employeeLifecycleEvents.$inferSelect;
export type JobOpening = typeof jobOpenings.$inferSelect;
export type JobCandidate = typeof jobCandidates.$inferSelect;
export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type OnboardingTaskTemplate = typeof onboardingTaskTemplates.$inferSelect;
export type JobInterview = typeof jobInterviews.$inferSelect;
export type JobOffer = typeof jobOffers.$inferSelect;
export type AttendanceEntry = typeof attendanceEntries.$inferSelect;
export type AttendancePolicy = typeof attendancePolicies.$inferSelect;
export type EmployeeShiftAssignment = typeof employeeShiftAssignments.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type ApprovalTask = typeof approvalTasks.$inferSelect;
export type InAppNotification = typeof inAppNotifications.$inferSelect;

export const requestTypes = ["hr", "government"] as const;
export const requestStatuses = ["submitted", "in_review", "approved", "rejected", "completed"] as const;
export const requestPriorities = ["normal", "urgent"] as const;

export const serviceRequests = mysqlTable("serviceRequests", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  type: mysqlEnum("type", requestTypes).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  details: text("details").notNull(),
  priority: mysqlEnum("priority", requestPriorities).default("normal").notNull(),
  status: mysqlEnum("status", requestStatuses).default("submitted").notNull(),
  employeeId: int("employeeId").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedToId: int("assignedToId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leaveRequests = mysqlTable("leaveRequests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }).unique(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  leaveType: mysqlEnum("leaveType", ["annual", "sick", "emergency"]).notNull(),
  startDate: varchar("startDate", { length: 10 }).notNull(),
  endDate: varchar("endDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const expenseRequests = mysqlTable("expenseRequests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }).unique(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  expenseType: mysqlEnum("expenseType", ["travel", "operating"]).notNull(),
  amountSar: varchar("amountSar", { length: 32 }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const requestHistory = mysqlTable("requestHistory", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }),
  actorId: int("actorId").references(() => users.id, { onDelete: "set null" }),
  action: mysqlEnum("action", ["created", "status_change", "note"]).notNull(),
  previousStatus: varchar("previousStatus", { length: 32 }),
  nextStatus: varchar("nextStatus", { length: 32 }),
  note: text("note").notNull(),
  visibleToEmployee: boolean("visibleToEmployee").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["open", "converted", "closed"]).default("open").notNull(),
  draftType: mysqlEnum("draftType", requestTypes),
  draftCategory: varchar("draftCategory", { length: 120 }),
  draftSubject: varchar("draftSubject", { length: 240 }),
  draftDetails: text("draftDetails"),
  draftPriority: mysqlEnum("draftPriority", requestPriorities),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hrSystemPlans = mysqlTable("hrSystemPlans", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessActivity: varchar("businessActivity", { length: 240 }).notNull(),
  companySize: varchar("companySize", { length: 80 }).notNull(),
  operatingNotes: text("operatingNotes"),
  workModel: varchar("workModel", { length: 80 }),
  geographicFootprint: varchar("geographicFootprint", { length: 160 }),
  growthHorizon: varchar("growthHorizon", { length: 80 }),
  peopleChallenges: text("peopleChallenges"),
  generatedContent: text("generatedContent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const demoRequests = mysqlTable("demoRequests", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  workEmail: varchar("workEmail", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 48 }),
  companyName: varchar("companyName", { length: 180 }).notNull(),
  companySize: varchar("companySize", { length: 80 }).notNull(),
  businessActivity: varchar("businessActivity", { length: 240 }),
  interest: varchar("interest", { length: 120 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"]).default("new").notNull(),
  ownerId: int("ownerId").references(() => users.id, { onDelete: "set null" }),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;
export type RequestHistoryEntry = typeof requestHistory.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type HrSystemPlan = typeof hrSystemPlans.$inferSelect;
export type DemoRequest = typeof demoRequests.$inferSelect;
