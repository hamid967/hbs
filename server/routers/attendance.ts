import { z } from "zod";
import { checkInAttendance, checkOutAttendance, getMyAttendanceEntry, listAttendanceForScope, recordAuditEvent } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const workMode = z.enum(["onsite", "remote"]);
const workDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();

export const attendanceRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => getMyAttendanceEntry(ctx.user.companyId, ctx.user.id)),
  overview: protectedProcedure.input(z.object({ workDate })).query(async ({ ctx, input }) => listAttendanceForScope({ companyId: ctx.user.companyId, actorId: ctx.user.id, role: ctx.user.role, ...input })),
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
});
