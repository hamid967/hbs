import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { companyTemplatePermissions, createCompanyPermissionTemplate, deleteCompanyPermissionTemplate, getCompanyPermissionTemplate, getCompanyPermissionTemplates, getUserModulePermissions, listUserAccounts, updateCompanyPermissionTemplate, updateUserAccount } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getPermissionTemplate, permissionTemplates } from "../../shared/moduleAccess";

const accountStatus = z.enum(["pending", "active", "suspended", "rejected"]);
const accountRole = z.enum(["user", "hr", "government", "manager", "admin"]);
const modulePermissions = z.array(z.object({ module: z.enum(["hr", "government"]), canView: z.boolean(), canManage: z.boolean() })).length(2).refine(items => new Set(items.map(item => item.module)).size === 2, "يجب تحديد كل وحدة مرة واحدة فقط");
const companyTemplateInput = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().max(360).optional(), role: accountRole, modulePermissions });

export const accountsRouter = router({
  templates: adminProcedure.query(() => permissionTemplates),
  companyTemplates: adminProcedure.query(({ ctx }) => getCompanyPermissionTemplates(ctx.user.companyId)),
  createCompanyTemplate: adminProcedure.input(companyTemplateInput).mutation(({ ctx, input }) => createCompanyPermissionTemplate({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input })),
  updateCompanyTemplate: adminProcedure.input(companyTemplateInput.extend({ id: z.number().int().positive() })).mutation(({ ctx, input }) => updateCompanyPermissionTemplate({ companyId: ctx.user.companyId, ...input })),
  deleteCompanyTemplate: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteCompanyPermissionTemplate(input.id, ctx.user.companyId)),
  list: adminProcedure.input(z.object({ status: accountStatus.optional() })).query(({ ctx, input }) => listUserAccounts(input.status, ctx.user.companyId)),
  myModulePermissions: protectedProcedure.query(({ ctx }) => getUserModulePermissions(ctx.user.id, ctx.user.role)),
  applyTemplate: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountStatus, templateId: z.string().min(1).max(80), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const template = getPermissionTemplate(input.templateId);
    if (!template) throw new TRPCError({ code: "BAD_REQUEST", message: "قالب الصلاحيات غير موجود" });
    if (input.userId === ctx.user.id && (input.accountStatus !== "active" || template.role !== "admin")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن للمسؤول خفض صلاحية حسابه أو تعطيله من هذه الواجهة" });
    return updateUserAccount({ userId: input.userId, actorId: ctx.user.id, companyId: ctx.user.companyId, accountStatus: input.accountStatus, role: template.role, modulePermissions: template.modulePermissions, note: input.note });
  }),
  applyCompanyTemplate: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountStatus, templateId: z.number().int().positive(), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const template = await getCompanyPermissionTemplate(input.templateId, ctx.user.companyId);
    if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "قالب الشركة غير موجود أو لا يتبع لشركتك" });
    if (input.userId === ctx.user.id && (input.accountStatus !== "active" || template.role !== "admin")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن للمسؤول خفض صلاحية حسابه أو تعطيله من هذه الواجهة" });
    return updateUserAccount({ userId: input.userId, actorId: ctx.user.id, companyId: ctx.user.companyId, accountStatus: input.accountStatus, role: template.role, modulePermissions: companyTemplatePermissions(template), note: input.note });
  }),
  update: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountStatus, role: accountRole, modulePermissions: modulePermissions.optional(), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.user.id && (input.accountStatus !== "active" || input.role !== "admin")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن للمسؤول خفض صلاحية حسابه أو تعطيله من هذه الواجهة" });
    return updateUserAccount({ ...input, actorId: ctx.user.id, companyId: ctx.user.companyId });
  }),
});
