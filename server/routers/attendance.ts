import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { assignCompanyAttendancePolicy, checkInAttendance, checkOutAttendance, createCompanyAttendancePolicy, getMyAttendanceEntry, listAttendanceForScope, listCompanyAttendancePolicies, listCompanyEmployees, listCompanyShiftAssignments, recordAuditEvent } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const workMode = z.enum(["onsite", "remote"]);
const workDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
const timeValue = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const weekday = z.enum(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
const dateValue = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function ensureSchedulingAccess(role: string) {
  if (!["admin", "hr"].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة سياسات الدوام والورديات" });
}

export const attendanceRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => getMyAttendanceEntry(ctx.user.companyId, ctx.user.id)),
  overview: protectedProcedure.input(z.object({ workDate })).query(async ({ ctx, input }) => listAttendanceForScope({ companyId: ctx.user.companyId, actorId: ctx.user.id, role: ctx.user.role, ...input })),
  schedules: protectedProcedure.query(async ({ ctx }) => { ensureSchedulingAccess(ctx.user.role); const [policies, assignments, employees] = await Promise.all([listCompanyAttendancePolicies(ctx.user.companyId), listCompanyShiftAssignments(ctx.user.companyId), listCompanyEmployees(ctx.user.companyId)]); return { policies, assignments, employees }; }),
  checkIn: protectedProcedure.input(z.object({ workMode, note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => {
    const entry = await checkInAttendance({ companyId: ctx.user.companyId, userId: ctx.user.id, ...input });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "attendance", action: "check_in", entityType: "attendance_entry", entityId: entry.id, summary: "تسجيل حضور" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث حضور", error); }
    return entry;
  }),
  checkOut: protectedProcedure.mutation(async ({ ctx }) => {
    const entry = await checkOutAttendance({ companyId: ctx.user.companyId, userId: ctx.user.id });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "attendance", action: "check_out", entityType: "attendance_entry", entityId: entry.id, summary: "تسجيل انصراف" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث انصراف", error); }
    return entry;
  }),
  createPolicy: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), startTime: timeValue, endTime: timeValue, workDays: z.array(weekday).min(1).max(7), graceMinutes: z.number().int().min(0).max(120) })).mutation(async ({ ctx, input }) => {
    ensureSchedulingAccess(ctx.user.role);
    const policy = await createCompanyAttendancePolicy({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input, workDays: input.workDays.join(",") });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "attendance", action: "attendance_policy_created", entityType: "attendance_policy", entityId: policy.id, summary: "إنشاء سياسة دوام" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث سياسة الدوام", error); }
    return policy;
  }),
  assignShift: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), attendancePolicyId: z.number().int().positive(), effectiveFrom: dateValue, effectiveTo: dateValue.optional() })).mutation(async ({ ctx, input }) => {
    ensureSchedulingAccess(ctx.user.role);
    const assignment = await assignCompanyAttendancePolicy({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    try { await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "attendance", action: "shift_assigned", entityType: "employee_shift_assignment", entityId: assignment.id, summary: "تعيين وردية موظف" }); } catch (error) { console.error("[Audit] تعذر حفظ حدث تعيين الوردية", error); }
    return assignment;
  }),
});
