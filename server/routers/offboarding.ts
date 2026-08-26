import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyEmployeeLifecycleEvent, createCompanyOffboarding, listCompanyEmployees, listCompanyOffboardingOverview, updateCompanyOffboardingTask, upsertCompanyExitInterview } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function ensureOffboardingAccess(role: string) {
  if (!['admin', 'hr'].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة إنهاء الخدمة" });
}

export const offboardingRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureOffboardingAccess(ctx.user.role);
    const [employees, overview] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyOffboardingOverview(ctx.user.companyId)]);
    return { employees, ...overview };
  }),
  start: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), lastWorkingAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureOffboardingAccess(ctx.user.role);
    const created = await createCompanyOffboarding({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, lastWorkingAt: input.lastWorkingAt, createdByUserId: ctx.user.id });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "offboarding_started", effectiveAt: new Date(), note: "بدء قائمة إنهاء خدمة داخلية", createdByUserId: ctx.user.id });
    return created;
  }),
  setTask: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), completed: z.boolean() })).mutation(async ({ ctx, input }) => {
    ensureOffboardingAccess(ctx.user.role);
    const result = await updateCompanyOffboardingTask({ companyId: ctx.user.companyId, taskId: input.taskId, completed: input.completed, updatedByUserId: ctx.user.id });
    if (result.becameCompleted) await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: result.offboarding.employeeUserId, eventType: "offboarding_completed", effectiveAt: new Date(), note: "اكتمال قائمة إنهاء خدمة داخلية", createdByUserId: ctx.user.id });
    return result;
  }),
  saveExitInterview: protectedProcedure.input(z.object({ offboardingId: z.number().int().positive(), employeeUserId: z.number().int().positive(), status: z.enum(["scheduled", "completed", "declined"]), scheduledAt: z.date().optional(), feedbackCategory: z.string().trim().max(80).optional(), summary: z.string().trim().max(1200).optional(), followUpRequired: z.boolean() }).superRefine((value, context) => {
    if (value.status === "completed" && (!value.summary || value.summary.trim().length < 3)) context.addIssue({ code: z.ZodIssueCode.custom, message: "أدخل ملخصاً موجزاً عند إكمال المقابلة" });
  })).mutation(async ({ ctx, input }) => {
    ensureOffboardingAccess(ctx.user.role);
    const result = await upsertCompanyExitInterview({ companyId: ctx.user.companyId, recordedByUserId: ctx.user.id, ...input });
    if (result.becameCompleted) await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "exit_interview_recorded", effectiveAt: new Date(), note: "تسجيل مقابلة خروج داخلية", createdByUserId: ctx.user.id });
    return result;
  }),
});
