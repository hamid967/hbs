import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addCompanyGoalProgressUpdate, createCompanyEmployeeGoal, createCompanyEmployeeLifecycleEvent, listCompanyEmployees, listCompanyGoalsOverview } from "../db";
import { invokeLLM } from "../_core/llm";
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
  summarize: protectedProcedure.input(z.object({ departmentId: z.number().int().positive().optional(), dateFrom: z.date().optional(), dateTo: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureGoalsAccess(ctx.user.role);
    const [employees, overview] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyGoalsOverview(ctx.user.companyId)]);
    const goals = overview.goals.filter(goal => {
      const employee = employees.find(item => item.id === goal.employeeUserId);
      if (input.departmentId && employee?.department?.id !== input.departmentId) return false;
      const target = goal.targetAt ? new Date(goal.targetAt) : null;
      if (input.dateFrom && (!target || target < input.dateFrom)) return false;
      if (input.dateTo && (!target || target > input.dateTo)) return false;
      return true;
    }).slice(0, 150);
    const compact = goals.map(goal => ({ progress: goal.progressPercent, status: goal.status, target: goal.targetAt ? new Date(goal.targetAt).toISOString().slice(0, 10) : null }));
    const response = await invokeLLM({ model: "gpt-5-mini", maxTokens: 320, messages: [{ role: "system", content: "اكتب ملخصاً عربياً موجزاً من فقرتين كحد أقصى لبيانات أهداف داخلية. استخدم الأرقام المقدمة فقط ولا تخترع معلومات أو توصيات قانونية أو مالية أو تقييمات للموظفين. اذكر اتجاه التقدم والحاجة إلى متابعة الأهداف المتأخرة أو القريبة إن ظهرت. لا تذكر أسماء أفراد." }, { role: "user", content: `بيانات الأهداف المفلترة: ${JSON.stringify(compact)}` }] });
    const content = response.choices[0]?.message.content;
    const summary = typeof content === "string" ? content.trim() : "تعذر إنشاء الملخص، حاول مرة أخرى.";
    return { summary, count: goals.length };
  }),
});
