export const accessModules = ["hr", "government"] as const;
export type AccessModule = typeof accessModules[number];
export type AccountRole = "user" | "hr" | "government" | "manager" | "admin";
export type ModulePermission = { module: AccessModule; canView: boolean; canManage: boolean };
export type PermissionTemplate = { id: string; title: string; description: string; role: AccountRole; modulePermissions: ModulePermission[] };

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

export function defaultModulePermissionsForRole(role: AccountRole): ModulePermission[] {
  if (role === "hr") return normalizeModulePermissions([{ module: "hr", canView: true, canManage: true }]);
  if (role === "government") return normalizeModulePermissions([{ module: "government", canView: true, canManage: true }]);
  if (role === "manager" || role === "admin") return normalizeModulePermissions(accessModules.map(module => ({ module, canView: true, canManage: true })));
  return normalizeModulePermissions([]);
}

export const permissionTemplates: PermissionTemplate[] = [
  { id: "employee", title: "موظف طالب خدمة", description: "يقدم طلباته ويتابعها من دون الوصول إلى عمليات الوحدات.", role: "user", modulePermissions: normalizeModulePermissions([]) },
  { id: "hr-coordinator", title: "منسق موارد بشرية", description: "يعرض ويدير معاملات الموارد البشرية فقط.", role: "hr", modulePermissions: normalizeModulePermissions([{ module: "hr", canView: true, canManage: true }]) },
  { id: "government-officer", title: "أخصائي علاقات حكومية", description: "يعرض ويدير معاملات العلاقات الحكومية فقط.", role: "government", modulePermissions: normalizeModulePermissions([{ module: "government", canView: true, canManage: true }]) },
  { id: "hr-observer", title: "مراقب موارد بشرية", description: "يعرض معاملات الموارد البشرية دون تعديلها أو مراجعتها.", role: "user", modulePermissions: normalizeModulePermissions([{ module: "hr", canView: true, canManage: false }]) },
  { id: "operations-manager", title: "مدير عمليات مشترك", description: "يدير معاملات الموارد البشرية والعلاقات الحكومية معاً.", role: "manager", modulePermissions: normalizeModulePermissions(accessModules.map(module => ({ module, canView: true, canManage: true }))) },
  { id: "platform-admin", title: "مدير منصة", description: "وصول إداري كامل إلى المنصة ووحداتها.", role: "admin", modulePermissions: normalizeModulePermissions(accessModules.map(module => ({ module, canView: true, canManage: true }))) },
];

export function getPermissionTemplate(templateId: string | undefined) {
  return permissionTemplates.find(template => template.id === templateId);
}

export function canManageModule(role: AccountRole, permissions: readonly ModulePermission[], module: AccessModule) {
  return role === "admin" || Boolean(permissions.find(item => item.module === module)?.canManage);
}

export function canViewModule(role: AccountRole, permissions: readonly ModulePermission[], module: AccessModule) {
  return role === "admin" || Boolean(permissions.find(item => item.module === module)?.canView);
}

export function permittedModules(role: AccountRole, permissions: readonly ModulePermission[]) {
  return accessModules.filter(module => canViewModule(role, permissions, module));
}
