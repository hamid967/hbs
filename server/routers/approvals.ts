import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { buildApprovalWorkload, decideApprovalTask, getApprovalInbox } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function rolesForApproval(role: string): Array<"hr" | "government" | "manager" | "admin"> {
  if (role === "admin") return ["hr", "government", "manager", "admin"];
  if (role === "hr") return ["hr"];
  if (role === "government") return ["government"];
  if (role === "manager") return ["manager"];
  return [];
}

export const approvalsRouter = router({
  inbox: protectedProcedure.query(({ ctx }) => { const roles = rolesForApproval(ctx.user.role); if (!roles.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية صندوق الموافقات" }); return getApprovalInbox(ctx.user.companyId, ctx.user.id, roles); }),
  workload: protectedProcedure.query(async ({ ctx }) => { const roles = rolesForApproval(ctx.user.role); if (!roles.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية صندوق الموافقات" }); const inbox = await getApprovalInbox(ctx.user.companyId, ctx.user.id, roles); return buildApprovalWorkload({ tasks: inbox.map(item => item.task) }); }),
  decide: protectedProcedure.input(z.object({ id: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(2500).optional() })).mutation(({ ctx, input }) => { const allowedRoles = rolesForApproval(ctx.user.role); if (!allowedRoles.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية اتخاذ القرار" }); return decideApprovalTask({ ...input, companyId: ctx.user.companyId, actorId: ctx.user.id, allowedRoles }); }),
});
