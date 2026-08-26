import { getManagerTeamGoals } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const managerDashboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "manager") throw new TRPCError({ code: "FORBIDDEN", message: "لوحة المدير متاحة للمديرين فقط." });
    const { members, goals } = await getManagerTeamGoals(ctx.user.companyId, ctx.user.id);
    const completed = goals.filter(item => item.goal.status === "completed").length;
    const averageProgress = goals.length ? Math.round(goals.reduce((sum, item) => sum + item.goal.progressPercent, 0) / goals.length) : 0;
    return { members, goals, summary: { memberCount: members.length, goalCount: goals.length, completedCount: completed, averageProgress } };
  }),
});
