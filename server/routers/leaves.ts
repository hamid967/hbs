import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getLeaveManagementOverview, getMyLeaveBalances, listCompanyEmployees, recordAuditEvent, upsertCompanyLeavePolicy, upsertEmployeeLeaveAllocation } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const leaveType = z.enum(["annual", "sick", "emergency"]);
const allocationYear = z.number().int().min(2020).max(2100);

function currentYear() { return new Date().getUTCFullYear(); }
function ensureLeaveManagementAccess(role: string) {
  if (!['admin', 'hr'].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة سياسات الإجازة والأرصدة" });
}

export const leavesRouter = router({
  mine: protectedProcedure.input(z.object({ allocationYear: allocationYear.optional() })).query(({ ctx, input }) =>
    getMyLeaveBalances({ companyId: ctx.user.companyId, employeeUserId: ctx.user.id, allocationYear: input.allocationYear ?? currentYear() })
  ),

  management: protectedProcedure.input(z.object({ allocationYear: allocationYear.optional() })).query(async ({ ctx, input }) => {
    ensureLeaveManagementAccess(ctx.user.role);
    const year = input.allocationYear ?? currentYear();
    const [overview, employees] = await Promise.all([getLeaveManagementOverview(ctx.user.companyId, year), listCompanyEmployees(ctx.user.companyId)]);
    return { ...overview, employees, allocationYear: year };
  }),

  savePolicy: protectedProcedure.input(z.object({ leaveType, title: z.string().trim().min(2).max(120), referenceDays: z.number().int().min(0).max(365), isActive: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
    ensureLeaveManagementAccess(ctx.user.role);
    const policy = await upsertCompanyLeavePolicy({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "leave", action: "leave_policy_saved", entityType: "leave_policy", entityId: policy.id, summary: "حفظ سياسة إجازة" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث سياسة الإجازة", error); }
    return policy;
  }),

  saveAllocation: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), leavePolicyId: z.number().int().positive(), allocationYear, allocatedDays: z.number().int().min(0).max(365) })).mutation(async ({ ctx, input }) => {
    ensureLeaveManagementAccess(ctx.user.role);
    const allocation = await upsertEmployeeLeaveAllocation({ companyId: ctx.user.companyId, allocatedByUserId: ctx.user.id, ...input });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "leave", action: "leave_allocation_saved", entityType: "leave_allocation", entityId: allocation.id, summary: "حفظ تخصيص رصيد إجازة" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث تخصيص رصيد الإجازة", error); }
    return allocation;
  }),
});
