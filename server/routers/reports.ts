import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getHrOperationsReport } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const reportsRouter = router({
  monthly: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional() }))
    .query(async ({ ctx, input }) => {
      if (!['admin', 'hr', 'manager'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'لا تملك صلاحية عرض تقارير الموارد البشرية' });
      }
      return getHrOperationsReport(ctx.user.companyId, ctx.user.role, ctx.user.id, input.month);
    }),
});
