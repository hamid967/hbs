import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getHrOperationsReport } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const reportsRouter = router({
  monthly: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(), category: z.enum(["annual", "sick", "emergency", "travel", "operating"]).optional(), region: z.string().trim().min(1).max(120).optional() }))
    .query(async ({ ctx, input }) => {
      if (!['admin', 'hr', 'manager'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'لا تملك صلاحية عرض تقارير الموارد البشرية' });
      }
      const filters = input.category || input.region ? { category: input.category, region: input.region } : undefined;
      return filters ? getHrOperationsReport(ctx.user.companyId, ctx.user.role, ctx.user.id, input.month, filters) : getHrOperationsReport(ctx.user.companyId, ctx.user.role, ctx.user.id, input.month);
    }),
});
