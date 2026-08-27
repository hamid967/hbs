import { can, type PolicyContext } from "./context";

export function canReadOrganization(ctx: PolicyContext): boolean {
  return can(ctx, "organization.read");
}

export function canManageOrganization(ctx: PolicyContext): boolean {
  return can(ctx, "organization.manage");
}

export function canManageSettings(ctx: PolicyContext): boolean {
  return can(ctx, "settings.manage");
}
