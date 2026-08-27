import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyCostCenter, createCompanyLegalEntity, createCompanyOrganizationAssignment, createCompanyOrganizationBranch, createCompanyOrganizationTeam, createCompanyWorkLocation, listCompanyOrganization } from "../db";
import { canManageOrganization, canReadOrganization, policyContextFromUser } from "../policies";
import { protectedProcedure, router } from "../_core/trpc";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalId = z.number().int().positive().optional();

function requireOrganizationView(user: { id: number; companyId: number; role: "user" | "hr" | "government" | "manager" | "admin" }) {
  if (canReadOrganization(policyContextFromUser(user))) return;
  throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية الاطلاع على البنية التنظيمية" });
}

function requireOrganizationManagement(user: { id: number; companyId: number; role: "user" | "hr" | "government" | "manager" | "admin" }) {
  if (canManageOrganization(policyContextFromUser(user))) return;
  throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة البنية التنظيمية" });
}

export const organizationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    requireOrganizationView(ctx.user);
    return listCompanyOrganization(ctx.user.companyId);
  }),
  createLegalEntity: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), code: optionalText(32), registrationLabel: optionalText(80), registrationNumber: optionalText(80) })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyLegalEntity({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  createBranch: protectedProcedure.input(z.object({ legalEntityId: optionalId, name: z.string().trim().min(2).max(160), code: optionalText(32), city: optionalText(120), region: optionalText(120), managerUserId: optionalId })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyOrganizationBranch({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  createTeam: protectedProcedure.input(z.object({ departmentId: optionalId, branchId: optionalId, name: z.string().trim().min(2).max(160), code: optionalText(32), managerUserId: optionalId })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyOrganizationTeam({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  createCostCenter: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), code: z.string().trim().min(2).max(32) })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyCostCenter({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  createWorkLocation: protectedProcedure.input(z.object({ branchId: optionalId, name: z.string().trim().min(2).max(160), code: optionalText(32), city: optionalText(120), region: optionalText(120) })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyWorkLocation({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  assignEmployee: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), legalEntityId: optionalId, branchId: optionalId, departmentId: optionalId, teamId: optionalId, costCenterId: optionalId, workLocationId: optionalId, effectiveFrom: z.date(), effectiveTo: z.date().optional() }).refine(input => Boolean(input.legalEntityId || input.branchId || input.departmentId || input.teamId || input.costCenterId || input.workLocationId), { message: "اختر مرجعاً تنظيمياً واحداً على الأقل" })).mutation(async ({ ctx, input }) => {
    requireOrganizationManagement(ctx.user);
    return createCompanyOrganizationAssignment({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
});
