import type { PlatformRole } from "../../shared/permissions";
import { can, type PolicyContext } from "./context";

export type EmployeeRef = {
  companyId: number;
  userId: number;
  managerUserId?: number | null;
};

const companyWideEmployeeReaders: ReadonlySet<PlatformRole> = new Set<PlatformRole>([
  "super_admin",
  "company_admin",
  "hr_admin",
  "hr_manager",
  "payroll_officer",
  "government_relations_officer",
  "finance_officer",
  "auditor",
]);

export function canReadEmployee(ctx: PolicyContext, employee: EmployeeRef): boolean {
  if (ctx.companyId !== employee.companyId || !can(ctx, "employee.read")) return false;
  if (companyWideEmployeeReaders.has(ctx.platformRole)) return true;
  return employee.userId === ctx.userId || employee.managerUserId === ctx.userId;
}

export function canCreateEmployee(ctx: PolicyContext): boolean {
  return can(ctx, "employee.create");
}

export function canUpdateEmployee(ctx: PolicyContext, employee: EmployeeRef): boolean {
  return ctx.companyId === employee.companyId && can(ctx, "employee.update");
}

export function canArchiveEmployee(ctx: PolicyContext, employee: EmployeeRef): boolean {
  return ctx.companyId === employee.companyId && can(ctx, "employee.archive");
}

export function canReadSensitiveEmployeeFields(ctx: PolicyContext, employee: EmployeeRef): boolean {
  return ctx.companyId === employee.companyId && can(ctx, "employee.sensitive.read");
}
