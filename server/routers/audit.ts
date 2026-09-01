import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listCompanyAuditEvents, listCompanyEmployees, type AuditCategory } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const auditCategories = ["recruitment", "attendance", "training", "approval", "account", "permission", "leave", "document"] as const satisfies readonly AuditCategory[];

function ensureAuditAccess(role: string) {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية عرض سجل التدقيق" });
}

export const auditRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(200).optional(),
        category: z.enum(auditCategories).optional(),
        actorUserId: z.number().int().positive().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        searchQuery: z.string().trim().max(120).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      ensureAuditAccess(ctx.user.role);
      return listCompanyAuditEvents(ctx.user.companyId, input);
    }),

  actors: protectedProcedure.query(async ({ ctx }) => {
    ensureAuditAccess(ctx.user.role);
    const employees = await listCompanyEmployees(ctx.user.companyId);
    return employees.map(emp => ({ id: emp.id, name: emp.name, email: emp.email, role: emp.role }));
  }),
});
