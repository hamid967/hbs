import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { canAccessResource, type AccountRole, type ResourceAction } from "../../shared/moduleAccess";
import { assertSameCompany } from "../_core/tenancy";
import { assignCompanyTrainingProgram, createCompanyDepartment, createCompanyEmployeeLifecycleEvent, createCompanyJobDesignation, createCompanyTrainingProgram, getCompanyEmployeeAccessRef, listCompanyDepartments, listCompanyEmployeeDependents, listCompanyEmployeeEmergencyContacts, listCompanyEmployeeLifecycleEvents, listCompanyEmployees, listCompanyJobDesignations, listCompanyTrainingAssignments, listCompanyTrainingPrograms, recordAuditEvent, saveCompanyDepartmentManager, saveCompanyEmployeeDependent, saveCompanyEmployeeEmergencyContact, saveEmployeeProfile } from "../db";
import { canReadEmployee, canUpdateEmployee, policyContextFromUser, projectEmployeeDirectoryRecord } from "../policies";
import { protectedProcedure, router } from "../_core/trpc";

const employeeStatus = z.enum(["active", "on_leave", "inactive"]);
const lifecycleEventType = z.enum(["joined", "profile_updated", "status_changed", "role_changed", "department_changed", "designation_changed", "manager_changed", "offboarding_started", "offboarding_completed"]);
type EmployeeActor = { id: number; companyId: number; role: AccountRole };

function ensureEmployeeResourceAccess(role: AccountRole, action: ResourceAction) {
  if (canAccessResource(role, action)) return;
  const message = action === "employee_directory" ? "لا تملك صلاحية إدارة دليل الموظفين" : "لا تملك صلاحية إدارة دورة حياة الموظفين";
  throw new TRPCError({ code: "FORBIDDEN", message });
}

async function ensureEmployeeMutationAccess(user: EmployeeActor, employeeUserId: number) {
  const employee = assertSameCompany(
    await getCompanyEmployeeAccessRef(user.companyId, employeeUserId),
    user.companyId,
  );
  if (canUpdateEmployee(policyContextFromUser(user), employee)) return employee;
  throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية تعديل سجل هذا الموظف" });
}

export const employeesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    ensureEmployeeResourceAccess(ctx.user.role, "employee_directory");
    const policyContext = policyContextFromUser(ctx.user);
    const employees = await listCompanyEmployees(ctx.user.companyId);
    return employees
      .filter(employee => canReadEmployee(policyContext, {
        companyId: ctx.user.companyId,
        userId: employee.id,
        managerUserId: employee.profile?.managerUserId,
      }))
      .map(employee => projectEmployeeDirectoryRecord(policyContext, {
        ...employee,
        companyId: ctx.user.companyId,
        userId: employee.id,
      }));
  }),
  departments: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); return listCompanyDepartments(ctx.user.companyId); }),
  designations: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); return listCompanyJobDesignations(ctx.user.companyId); }),
  lifecycle: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); const [employees, events] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyEmployeeLifecycleEvents(ctx.user.companyId)]); return { employees, events }; }),
  emergencyContacts: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); return listCompanyEmployeeEmergencyContacts(ctx.user.companyId); }),
  dependents: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); return listCompanyEmployeeDependents(ctx.user.companyId); }),
  training: protectedProcedure.query(async ({ ctx }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); const [employees, programs, assignments] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyTrainingPrograms(ctx.user.companyId), listCompanyTrainingAssignments(ctx.user.companyId)]); return { employees, programs, assignments }; }),
  createDepartment: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(120), code: z.string().trim().max(32).optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); return createCompanyDepartment({ companyId: ctx.user.companyId, ...input }); }),
  saveDepartmentManager: protectedProcedure.input(z.object({ departmentId: z.number().int().positive(), managerUserId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); return saveCompanyDepartmentManager({ companyId: ctx.user.companyId, ...input }); }),
  createDesignation: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), code: z.string().trim().max(32).optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); return createCompanyJobDesignation({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); }),
  saveProfile: protectedProcedure.input(z.object({ userId: z.number().int().positive(), employeeNumber: z.string().trim().max(40).optional(), jobTitle: z.string().trim().max(160).optional(), designationId: z.number().int().positive().optional(), departmentId: z.number().int().positive().optional(), region: z.string().trim().max(120).optional(), workLocation: z.string().trim().max(160).optional(), managerUserId: z.number().int().positive().optional(), employmentStatus: employeeStatus, joinedAt: z.date().optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_directory"); await ensureEmployeeMutationAccess(ctx.user, input.userId); return saveEmployeeProfile({ companyId: ctx.user.companyId, updatedByUserId: ctx.user.id, ...input }); }),
  saveEmergencyContact: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), contactName: z.string().trim().min(2).max(160), relationship: z.string().trim().min(2).max(80), phone: z.string().trim().min(7).max(48) })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); await ensureEmployeeMutationAccess(ctx.user, input.employeeUserId); const contact = await saveCompanyEmployeeEmergencyContact({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "تحديث بيانات ملف الموظف", createdByUserId: ctx.user.id }); return contact; }),
  saveDependent: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), fullName: z.string().trim().min(2).max(160), relationship: z.string().trim().min(2).max(80), birthYear: z.number().int().min(1900).max(2100).optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); await ensureEmployeeMutationAccess(ctx.user, input.employeeUserId); const dependent = await saveCompanyEmployeeDependent({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "تحديث بيانات ملف الموظف", createdByUserId: ctx.user.id }); return dependent; }),
  createLifecycleEvent: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), eventType: lifecycleEventType, effectiveAt: z.date(), note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); await ensureEmployeeMutationAccess(ctx.user, input.employeeUserId); return createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); }),
  createTrainingProgram: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(180), description: z.string().trim().max(800).optional(), durationMinutes: z.number().int().min(0).max(100000) })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); const program = await createCompanyTrainingProgram({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input }); try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "training", action: "training_program_created", entityType: "training_program", entityId: program.id, summary: "إنشاء مسار تدريب" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث التدريب", error); } return program; }),
  assignTrainingProgram: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), trainingProgramId: z.number().int().positive(), dueAt: z.date().optional() })).mutation(async ({ ctx, input }) => { ensureEmployeeResourceAccess(ctx.user.role, "employee_lifecycle"); await ensureEmployeeMutationAccess(ctx.user, input.employeeUserId); const assignment = await assignCompanyTrainingProgram({ companyId: ctx.user.companyId, assignedByUserId: ctx.user.id, ...input }); try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "training", action: "training_assigned", entityType: "employee_training_assignment", entityId: assignment.id, summary: "تعيين مسار تدريب" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث تعيين التدريب", error); } return assignment; }),
});
