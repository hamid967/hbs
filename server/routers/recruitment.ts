import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { completeCompanyOnboardingTask, createCompanyJobCandidate, createCompanyJobOpening, createCompanyOnboardingTask, listCompanyJobCandidates, listCompanyJobOpenings, listCompanyOnboardingTasks, updateCompanyJobCandidate } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const recruitmentRoles = ["admin", "hr"] as const;
const openingStatus = z.enum(["draft", "open", "closed"]);
const employmentType = z.enum(["full_time", "part_time", "contract"]);
const candidateStatus = z.enum(["applied", "screening", "interview", "offer", "accepted", "rejected", "withdrawn"]);

function ensureRecruitmentAccess(role: string) {
  if (!recruitmentRoles.includes(role as typeof recruitmentRoles[number])) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة التوظيف والتهيئة" });
}

export const recruitmentRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const [openings, candidates, onboardingTasks] = await Promise.all([listCompanyJobOpenings(ctx.user.companyId), listCompanyJobCandidates(ctx.user.companyId), listCompanyOnboardingTasks(ctx.user.companyId)]);
    return { openings, candidates, onboardingTasks };
  }),
  createOpening: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), departmentId: z.number().int().positive().optional(), hiringManagerUserId: z.number().int().positive().optional(), employmentType, headcount: z.number().int().min(1).max(100), description: z.string().trim().max(4000).optional(), status: openingStatus })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    return createCompanyJobOpening({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  createCandidate: protectedProcedure.input(z.object({ openingId: z.number().int().positive(), fullName: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320).optional(), internalNote: z.string().trim().max(4000).optional(), expectedStartAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    return createCompanyJobCandidate({ companyId: ctx.user.companyId, ...input });
  }),
  updateCandidate: protectedProcedure.input(z.object({ candidateId: z.number().int().positive(), status: candidateStatus, internalNote: z.string().trim().max(4000).optional(), expectedStartAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    return updateCompanyJobCandidate({ companyId: ctx.user.companyId, ...input });
  }),
  createOnboardingTask: protectedProcedure.input(z.object({ candidateId: z.number().int().positive(), ownerUserId: z.number().int().positive().optional(), title: z.string().trim().min(2).max(180), dueAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    return createCompanyOnboardingTask({ companyId: ctx.user.companyId, ...input });
  }),
  completeOnboardingTask: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    return completeCompanyOnboardingTask(ctx.user.companyId, input.taskId);
  }),
});
