import { getApprovalInbox, listMyTrainingAssignments, listNotifications } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function approvalRoles(role: string): Array<"hr" | "government" | "manager" | "admin"> {
  if (role === "admin") return ["hr", "government", "manager", "admin"];
  if (["hr", "government", "manager"].includes(role)) return [role as "hr" | "government" | "manager"];
  return [];
}

export const workboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const roles = approvalRoles(ctx.user.role);
    const [notifications, approvals, training] = await Promise.all([
      listNotifications(ctx.user.companyId, ctx.user.id),
      roles.length ? getApprovalInbox(ctx.user.companyId, ctx.user.id, roles) : Promise.resolve([]),
      listMyTrainingAssignments(ctx.user.companyId, ctx.user.id),
    ]);
    return {
      approvals: approvals.map(({ task, request, employee }) => ({ id: task.id, stage: task.approverRole, createdAt: task.createdAt, reference: request.reference, subject: request.subject, requestId: request.id, employeeName: employee.name || employee.email || "موظف" })),
      notifications: notifications.slice(0, 12),
      training,
    };
  }),
});
