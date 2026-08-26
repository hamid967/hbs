import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addCompanyGoalProgressUpdate, createCompanyEmployeeGoal, createCompanyEmployeeLifecycleEvent, listCompanyEmployees, listCompanyGoalsOverview } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function ensureGoalsAccess(role: string) {
  if (!['admin', 'hr'].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة الأهداف والأداء" });
}

export const goalsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureGoalsAccess(ctx.user.role);
    const [employees, overview] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyGoalsOverview(ctx.user.companyId)]);
    return { employees, ...overview };
  }),
  create: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), title: z.string().trim().min(2).max(180), description: z.string().trim().max(600).optional(), targetAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureGoalsAccess(ctx.user.role);
    const goal = await createCompanyEmployeeGoal({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "إضافة هدف أداء داخلي", createdByUserId: ctx.user.id });
    return goal;
  }),
  addProgress: protectedProcedure.input(z.object({ goalId: z.number().int().positive(), progressPercent: z.number().int().min(0).max(100), note: z.string().trim().max(600).optional(), trainingProgramId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
    ensureGoalsAccess(ctx.user.role);
    const goal = await addCompanyGoalProgressUpdate({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: goal.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "تحديث تقدم هدف أداء داخلي", createdByUserId: ctx.user.id });
    return goal;
  }),
});
