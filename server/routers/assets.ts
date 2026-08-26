import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyEmployeeAsset, listCompanyEmployeeAssets, listCompanyEmployees, updateCompanyEmployeeAsset } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const assetStatus = z.enum(["available", "assigned", "returned", "retired"]);

function ensureAssetsAccess(role: string) {
  if (!['admin', 'hr'].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة العهد والأجهزة" });
}

export const assetsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureAssetsAccess(ctx.user.role);
    const [assets, employees] = await Promise.all([listCompanyEmployeeAssets(ctx.user.companyId), listCompanyEmployees(ctx.user.companyId)]);
    return { assets, employees };
  }),
  create: protectedProcedure.input(z.object({ assetName: z.string().trim().min(2).max(160), assetTag: z.string().trim().min(2).max(80), assetType: z.string().trim().max(80).optional(), assignedEmployeeUserId: z.number().int().positive().optional(), notes: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => {
    ensureAssetsAccess(ctx.user.role);
    return createCompanyEmployeeAsset({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
  }),
  update: protectedProcedure.input(z.object({ assetId: z.number().int().positive(), status: assetStatus, assignedEmployeeUserId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
    ensureAssetsAccess(ctx.user.role);
    return updateCompanyEmployeeAsset({ companyId: ctx.user.companyId, ...input });
  }),
});
