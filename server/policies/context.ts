import type { AccountRole } from "../../shared/moduleAccess";
import {
  resolvePlatformRole,
  roleHasPermission,
  type Permission,
  type PlatformRole,
} from "../../shared/permissions";

export type PolicyContext = {
  userId: number;
  companyId: number;
  accountRole: AccountRole;
  platformRole: PlatformRole;
  isPlatformOwner: boolean;
};

export function policyContextFromUser(
  user: { id: number; companyId: number; role: AccountRole },
  options: { isPlatformOwner?: boolean } = {},
): PolicyContext {
  const isPlatformOwner = Boolean(options.isPlatformOwner);
  return {
    userId: user.id,
    companyId: user.companyId,
    accountRole: user.role,
    platformRole: resolvePlatformRole({ role: user.role, isPlatformOwner }),
    isPlatformOwner,
  };
}

export function can(ctx: PolicyContext, permission: Permission): boolean {
  return roleHasPermission(ctx.platformRole, permission);
}
