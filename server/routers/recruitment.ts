import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { completeCompanyOnboardingTask, createCompanyJobCandidate, createCompanyJobOpening, createCompanyOnboardingTask, listCompanyJobCandidates, listCompanyJobOpenings, listCompanyOnboardingTasks, recordAuditEvent, updateCompanyJobCandidate } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const recruitmentRoles = ["admin", "hr"] as const;
const openingStatus = z.enum(["draft", "open", "closed"]);
const employmentType = z.enum(["full_time", "part_time", "contract"]);
const candidateStatus = z.enum(["applied", "screening", "interview", "offer", "accepted", "rejected", "withdrawn"]);

function ensureRecruitmentAccess(role: string) {
  if (!recruitmentRoles.includes(role as typeof recruitmentRoles[number])) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة التوظيف والتهيئة" });
}

async function audit(input: Parameters<typeof recordAuditEvent>[0]) {
  try { await recordAuditEvent(input); } catch (error) { console.error("[Audit] تعذر حفظ حدث تدقيق التوظيف", error); }
}

export const recruitmentRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const [openings, candidates, onboardingTasks] = await Promise.all([listCompanyJobOpenings(ctx.user.companyId), listCompanyJobCandidates(ctx.user.companyId), listCompanyOnboardingTasks(ctx.user.companyId)]);
    return { openings, candidates, onboardingTasks };
  }),
  createOpening: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), departmentId: z.number().int().positive().optional(), hiringManagerUserId: z.number().int().positive().optional(), employmentType, headcount: z.number().int().min(1).max(100), description: z.string().trim().max(4000).optional(), status: openingStatus })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const opening = await createCompanyJobOpening({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    await audit({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "recruitment", action: "opening_created", entityType: "job_opening", entityId: opening.id, summary: "إنشاء شاغر وظيفي" });
    return opening;
  }),
  createCandidate: protectedProcedure.input(z.object({ openingId: z.number().int().positive(), fullName: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320).optional(), internalNote: z.string().trim().max(4000).optional(), expectedStartAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const candidate = await createCompanyJobCandidate({ companyId: ctx.user.companyId, ...input });
    await audit({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "recruitment", action: "candidate_created", entityType: "job_candidate", entityId: candidate.id, summary: "إضافة مرشح إلى شاغر" });
    return candidate;
  }),
  updateCandidate: protectedProcedure.input(z.object({ candidateId: z.number().int().positive(), status: candidateStatus, internalNote: z.string().trim().max(4000).optional(), expectedStartAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const candidate = await updateCompanyJobCandidate({ companyId: ctx.user.companyId, ...input });
    await audit({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "recruitment", action: "candidate_status_changed", entityType: "job_candidate", entityId: candidate.id, summary: "تحديث مرحلة مرشح" });
    return candidate;
  }),
  createOnboardingTask: protectedProcedure.input(z.object({ candidateId: z.number().int().positive(), ownerUserId: z.number().int().positive().optional(), title: z.string().trim().min(2).max(180), dueAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const task = await createCompanyOnboardingTask({ companyId: ctx.user.companyId, ...input });
    await audit({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "recruitment", action: "onboarding_task_created", entityType: "onboarding_task", entityId: task.id, summary: "إنشاء مهمة تهيئة" });
    return task;
  }),
  completeOnboardingTask: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    ensureRecruitmentAccess(ctx.user.role);
    const task = await completeCompanyOnboardingTask(ctx.user.companyId, input.taskId);
    await audit({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "recruitment", action: "onboarding_task_completed", entityType: "onboarding_task", entityId: task.id, summary: "إكمال مهمة تهيئة" });
    return task;
  }),
});
