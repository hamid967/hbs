import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyDepartment, listCompanyDepartments, listCompanyEmployees, saveEmployeeProfile } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const directoryRoles = ["admin", "manager", "hr"] as const;
const employeeStatus = z.enum(["active", "on_leave", "inactive"]);

function ensureDirectoryAccess(role: string) {
  if (!directoryRoles.includes(role as typeof directoryRoles[number])) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة دليل الموظفين" });
}

export const employeesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { ensureDirectoryAccess(ctx.user.role); return listCompanyEmployees(ctx.user.companyId); }),
  departments: protectedProcedure.query(async ({ ctx }) => { ensureDirectoryAccess(ctx.user.role); return listCompanyDepartments(ctx.user.companyId); }),
  createDepartment: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(120), code: z.string().trim().max(32).optional() })).mutation(async ({ ctx, input }) => { ensureDirectoryAccess(ctx.user.role); return createCompanyDepartment({ companyId: ctx.user.companyId, ...input }); }),
  saveProfile: protectedProcedure.input(z.object({ userId: z.number().int().positive(), employeeNumber: z.string().trim().max(40).optional(), jobTitle: z.string().trim().max(160).optional(), departmentId: z.number().int().positive().optional(), managerUserId: z.number().int().positive().optional(), employmentStatus: employeeStatus, joinedAt: z.date().optional() })).mutation(async ({ ctx, input }) => { ensureDirectoryAccess(ctx.user.role); return saveEmployeeProfile({ companyId: ctx.user.companyId, ...input }); }),
});
