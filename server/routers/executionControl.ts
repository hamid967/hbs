import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listCompanyExecutionDependencyReviews, requestExecutionDependencyReview, requestExecutionRetry, resolveExecutionDependency } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const blockedStage = z.number().int().refine(value => [2, 7, 8, 9, 10].includes(value), "هذه المرحلة ليست ضمن البنود المحجوبة القابلة للمراجعة");
function ensureAdmin(role: string) { if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "لا يملك هذا الحساب صلاحية إدارة اعتماديات التنفيذ" }); }

export const executionControlRouter = router({
  list: protectedProcedure.query(({ ctx }) => listCompanyExecutionDependencyReviews(ctx.user.companyId)),
  requestReview: protectedProcedure.input(z.object({ stageNumber: blockedStage })).mutation(async ({ ctx, input }) => { ensureAdmin(ctx.user.role); return requestExecutionDependencyReview({ companyId: ctx.user.companyId, stageNumber: input.stageNumber, requestedByUserId: ctx.user.id }); }),
  resolveDependency: protectedProcedure.input(z.object({ stageNumber: blockedStage })).mutation(async ({ ctx, input }) => { ensureAdmin(ctx.user.role); return resolveExecutionDependency({ companyId: ctx.user.companyId, stageNumber: input.stageNumber, reviewedByUserId: ctx.user.id }); }),
  requestRetry: protectedProcedure.input(z.object({ stageNumber: blockedStage })).mutation(async ({ ctx, input }) => { ensureAdmin(ctx.user.role); return requestExecutionRetry({ companyId: ctx.user.companyId, stageNumber: input.stageNumber }); }),
});
