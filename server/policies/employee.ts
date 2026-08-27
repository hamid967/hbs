import type { PlatformRole } from "../../shared/permissions";
import { can, type PolicyContext } from "./context";

export type EmployeeRef = {
  companyId: number;
  userId: number;
  managerUserId?: number | null;
};

export type EmployeeDirectoryRecord = EmployeeRef & {
  id: number;
  name: string | null;
  role: string;
  profile: {
    employeeNumber: string | null;
    jobTitle: string | null;
    designationId: number | null;
    departmentId: number | null;
    region: string | null;
    workLocation: string | null;
    managerUserId: number | null;
    employmentStatus: "active" | "on_leave" | "inactive";
    joinedAt: Date | null;
  } | null;
  department: { id: number; name: string; code: string | null } | null;
  designation: { id: number; title: string; code: string | null; isActive: boolean } | null;
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

export function projectEmployeeDirectoryRecord(ctx: PolicyContext, employee: EmployeeDirectoryRecord) {
  const canReadSensitive = canReadSensitiveEmployeeFields(ctx, employee);
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    profile: employee.profile ? {
      employeeNumber: canReadSensitive ? employee.profile.employeeNumber : null,
      jobTitle: employee.profile.jobTitle,
      designationId: employee.profile.designationId,
      departmentId: employee.profile.departmentId,
      region: employee.profile.region,
      workLocation: employee.profile.workLocation,
      managerUserId: employee.profile.managerUserId,
      employmentStatus: employee.profile.employmentStatus,
      joinedAt: canReadSensitive ? employee.profile.joinedAt : null,
    } : null,
    department: employee.department,
    designation: employee.designation,
  };
}
