import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyDepartment, createCompanyEmployeeLifecycleEvent, listCompanyDepartments, listCompanyEmployeeLifecycleEvents, listCompanyEmployees, saveEmployeeProfile } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const directoryRoles = ["admin", "manager", "hr"] as const;
const employeeStatus = z.enum(["active", "on_leave", "inactive"]);
const lifecycleEventType = z.enum(["joined", "status_changed", "role_changed", "department_changed", "manager_changed", "offboarding_started", "offboarding_completed"]);

function ensureDirectoryAccess(role: string) {
  if (!directoryRoles.includes(role as typeof directoryRoles[number])) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة دليل الموظفين" });
}

function ensureLifecycleAccess(role: string) {
  if (!["admin", "hr"].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة دورة حياة الموظفين" });
}

export const employeesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { ensureDirectoryAccess(ctx.user.role); return listCompanyEmployees(ctx.user.companyId); }),
  departments: protectedProcedure.query(async ({ ctx }) => { ensureDirectoryAccess(ctx.user.role); return listCompanyDepartments(ctx.user.companyId); }),
  lifecycle: protectedProcedure.query(async ({ ctx }) => { ensureLifecycleAccess(ctx.user.role); const [employees, events] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyEmployeeLifecycleEvents(ctx.user.companyId)]); return { employees, events }; }),
  createDepartment: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(120), code: z.string().trim().max(32).optional() })).mutation(async ({ ctx, input }) => { ensureDirectoryAccess(ctx.user.role); return createCompanyDepartment({ companyId: ctx.user.companyId, ...input }); }),
  saveProfile: protectedProcedure.input(z.object({ userId: z.number().int().positive(), employeeNumber: z.string().trim().max(40).optional(), jobTitle: z.string().trim().max(160).optional(), departmentId: z.number().int().positive().optional(), region: z.string().trim().max(120).optional(), managerUserId: z.number().int().positive().optional(), employmentStatus: employeeStatus, joinedAt: z.date().optional() })).mutation(async ({ ctx, input }) => { ensureDirectoryAccess(ctx.user.role); return saveEmployeeProfile({ companyId: ctx.user.companyId, ...input }); }),
  createLifecycleEvent: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), eventType: lifecycleEventType, effectiveAt: z.date(), note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => { ensureLifecycleAccess(ctx.user.role); return createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); }),
});
