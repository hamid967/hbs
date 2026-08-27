import type { PlatformRole } from "../../shared/permissions";
import { can, type PolicyContext } from "./context";

export type ContractRef = {
  companyId: number;
  employeeUserId: number;
  managerUserId?: number | null;
};

const companyWideContractReaders: ReadonlySet<PlatformRole> = new Set<PlatformRole>([
  "super_admin",
  "company_admin",
  "hr_admin",
  "hr_manager",
  "payroll_officer",
  "finance_officer",
  "auditor",
]);

export function canReadContract(ctx: PolicyContext, contract: ContractRef): boolean {
  if (ctx.companyId !== contract.companyId || !can(ctx, "contract.read")) return false;
  if (companyWideContractReaders.has(ctx.platformRole)) return true;
  return contract.employeeUserId === ctx.userId || contract.managerUserId === ctx.userId;
}

export function canCreateContract(ctx: PolicyContext): boolean {
  return can(ctx, "contract.create");
}

export function canUpdateContract(ctx: PolicyContext, contract: ContractRef): boolean {
  return ctx.companyId === contract.companyId && can(ctx, "contract.update");
}

export function canApproveContract(ctx: PolicyContext, contract: ContractRef): boolean {
  return ctx.companyId === contract.companyId && can(ctx, "contract.approve");
}

export function canReadCompensation(ctx: PolicyContext, contract: ContractRef): boolean {
  return ctx.companyId === contract.companyId && can(ctx, "contract.compensation.read");
}
