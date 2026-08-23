import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getUserModulePermissions, listUserAccounts, updateUserAccount } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const accountStatus = z.enum(["pending", "active", "suspended", "rejected"]);
const accountRole = z.enum(["user", "hr", "government", "manager", "admin"]);
const modulePermissions = z.array(z.object({ module: z.enum(["hr", "government"]), canView: z.boolean(), canManage: z.boolean() })).length(2).refine(items => new Set(items.map(item => item.module)).size === 2, "يجب تحديد كل وحدة مرة واحدة فقط");

export const accountsRouter = router({
  list: adminProcedure.input(z.object({ status: accountStatus.optional() })).query(({ input }) => listUserAccounts(input.status)),
  myModulePermissions: protectedProcedure.query(({ ctx }) => getUserModulePermissions(ctx.user.id, ctx.user.role)),
  update: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountStatus, role: accountRole, modulePermissions: modulePermissions.optional(), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.user.id && (input.accountStatus !== "active" || input.role !== "admin")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن للمسؤول خفض صلاحية حسابه أو تعطيله من هذه الواجهة" });
    return updateUserAccount({ ...input, actorId: ctx.user.id });
  }),
});
