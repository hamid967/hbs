export type UserRole = "user" | "hr" | "government" | "manager" | "admin";
export type RequestType = "hr" | "government";
import { canManageModule, defaultModulePermissionsForRole, type ModulePermission, permittedModules } from "../shared/moduleAccess";

export function canManageRequest(role: UserRole, type: RequestType, permissions = defaultModulePermissionsForRole(role)) {
  return canManageModule(role, permissions, type);
}

export function permittedRequestTypes(role: UserRole, permissions = defaultModulePermissionsForRole(role)): RequestType[] {
  return permittedModules(role, permissions);
}

export function createRequestReference(type: RequestType, timestamp = Date.now()) {
  const prefix = type === "hr" ? "HR" : "GR";
  const sequence = String(timestamp).slice(-6);
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HBS-${prefix}-${sequence}-${randomPart}`;
}
