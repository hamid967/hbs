export const accessModules = ["hr", "government"] as const;
export type AccessModule = typeof accessModules[number];
export type ModulePermission = { module: AccessModule; canView: boolean; canManage: boolean };

export const moduleLabels: Record<AccessModule, string> = {
  hr: "الموارد البشرية",
  government: "العلاقات الحكومية",
};

export function normalizeModulePermissions(permissions: readonly ModulePermission[] | undefined): ModulePermission[] {
  return accessModules.map(module => {
    const permission = permissions?.find(item => item.module === module);
    const canManage = Boolean(permission?.canManage);
    return { module, canView: canManage || Boolean(permission?.canView), canManage };
  });
}

export function defaultModulePermissionsForRole(role: "user" | "hr" | "government" | "manager" | "admin"): ModulePermission[] {
  if (role === "hr") return normalizeModulePermissions([{ module: "hr", canView: true, canManage: true }]);
  if (role === "government") return normalizeModulePermissions([{ module: "government", canView: true, canManage: true }]);
  if (role === "manager" || role === "admin") return normalizeModulePermissions(accessModules.map(module => ({ module, canView: true, canManage: true })));
  return normalizeModulePermissions([]);
}

export function canManageModule(role: "user" | "hr" | "government" | "manager" | "admin", permissions: readonly ModulePermission[], module: AccessModule) {
  return role === "admin" || Boolean(permissions.find(item => item.module === module)?.canManage);
}

export function canViewModule(role: "user" | "hr" | "government" | "manager" | "admin", permissions: readonly ModulePermission[], module: AccessModule) {
  return role === "admin" || Boolean(permissions.find(item => item.module === module)?.canView);
}

export function permittedModules(role: "user" | "hr" | "government" | "manager" | "admin", permissions: readonly ModulePermission[]) {
  return accessModules.filter(module => canViewModule(role, permissions, module));
}
