import { can, type PolicyContext } from "./context";

export function canReadAudit(ctx: PolicyContext): boolean {
  return can(ctx, "audit.read");
}
