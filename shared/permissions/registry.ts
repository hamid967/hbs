import type { AccountRole } from "../moduleAccess";

export const platformRoles = [
  "super_admin",
  "company_admin",
  "hr_admin",
  "hr_manager",
  "direct_manager",
  "payroll_officer",
  "government_relations_officer",
  "finance_officer",
  "employee",
  "auditor",
] as const;

export type PlatformRole = (typeof platformRoles)[number];

export const permissions = [
  "organization.read",
  "organization.manage",
  "employee.read",
  "employee.create",
  "employee.update",
  "employee.archive",
  "employee.sensitive.read",
  "contract.read",
  "contract.create",
  "contract.update",
  "contract.approve",
  "contract.compensation.read",
  "document.read",
  "document.upload",
  "document.delete",
  "audit.read",
  "settings.manage",
] as const;

export type Permission = (typeof permissions)[number];

const allPermissions: readonly Permission[] = permissions;

const rolePermissionMatrix: Record<PlatformRole, readonly Permission[]> = {
  super_admin: allPermissions,
  company_admin: allPermissions,
  hr_admin: [
    "organization.read",
    "employee.read",
    "employee.create",
    "employee.update",
    "employee.archive",
    "employee.sensitive.read",
    "contract.read",
    "contract.create",
    "contract.update",
    "contract.approve",
    "document.read",
    "document.upload",
    "document.delete",
    "audit.read",
  ],
  hr_manager: [
    "organization.read",
    "employee.read",
    "employee.update",
    "employee.sensitive.read",
    "contract.read",
    "document.read",
    "document.upload",
  ],
  direct_manager: ["organization.read", "employee.read", "contract.read", "document.read"],
  payroll_officer: ["employee.read", "contract.read", "contract.compensation.read"],
  government_relations_officer: ["organization.read", "employee.read", "document.read", "document.upload"],
  finance_officer: ["employee.read", "contract.read", "contract.compensation.read"],
  employee: ["employee.read", "contract.read", "document.read", "document.upload"],
  auditor: ["organization.read", "employee.read", "contract.read", "document.read", "audit.read"],
};

const permissionSets: Record<PlatformRole, ReadonlySet<Permission>> = platformRoles.reduce(
  (result, role) => {
    result[role] = new Set(rolePermissionMatrix[role]);
    return result;
  },
  {} as Record<PlatformRole, Set<Permission>>,
);

export function roleHasPermission(role: PlatformRole, permission: Permission): boolean {
  return permissionSets[role].has(permission);
}

export function permissionsForRole(role: PlatformRole): Set<Permission> {
  return new Set(permissionSets[role]);
}

export function platformRoleForAccountRole(role: AccountRole): PlatformRole {
  switch (role) {
    case "admin":
      return "company_admin";
    case "hr":
      return "hr_admin";
    case "government":
      return "government_relations_officer";
    case "manager":
      return "direct_manager";
    case "user":
      return "employee";
  }
}

export function resolvePlatformRole(input: { role: AccountRole; isPlatformOwner?: boolean }): PlatformRole {
  if (input.isPlatformOwner && input.role === "admin") return "super_admin";
  return platformRoleForAccountRole(input.role);
}

export function accountRoleHasPermission(
  role: AccountRole,
  permission: Permission,
  isPlatformOwner = false,
): boolean {
  return roleHasPermission(resolvePlatformRole({ role, isPlatformOwner }), permission);
}
