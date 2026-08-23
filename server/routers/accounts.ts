import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listUserAccounts, updateUserAccount } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const accountStatus = z.enum(["pending", "active", "suspended", "rejected"]);
const accountRole = z.enum(["user", "hr", "government", "manager", "admin"]);

export const accountsRouter = router({
  list: adminProcedure.input(z.object({ status: accountStatus.optional() })).query(({ input }) => listUserAccounts(input.status)),
  update: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountStatus, role: accountRole, note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.user.id && (input.accountStatus !== "active" || input.role !== "admin")) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن للمسؤول خفض صلاحية حسابه أو تعطيله من هذه الواجهة" });
    return updateUserAccount({ ...input, actorId: ctx.user.id });
  }),
});
