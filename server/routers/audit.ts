import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listCompanyAuditEvents } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

function ensureAuditAccess(role: string) {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية عرض سجل التدقيق" });
}

export const auditRouter = router({
  list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(200).optional() })).query(async ({ ctx, input }) => {
    ensureAuditAccess(ctx.user.role);
    return listCompanyAuditEvents(ctx.user.companyId, input.limit);
  }),
});
