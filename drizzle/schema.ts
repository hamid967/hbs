import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "hr", "government", "manager", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;
export type RequestHistoryEntry = typeof requestHistory.$inferSelect;
