import { z } from "zod";
import { checkInAttendance, checkOutAttendance, getMyAttendanceEntry, listAttendanceForScope } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const workMode = z.enum(["onsite", "remote"]);
const workDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();

export const attendanceRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => getMyAttendanceEntry(ctx.user.companyId, ctx.user.id)),
  overview: protectedProcedure.input(z.object({ workDate })).query(async ({ ctx, input }) => listAttendanceForScope({ companyId: ctx.user.companyId, actorId: ctx.user.id, role: ctx.user.role, ...input })),
  checkIn: protectedProcedure.input(z.object({ workMode, note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => checkInAttendance({ companyId: ctx.user.companyId, userId: ctx.user.id, ...input })),
  checkOut: protectedProcedure.mutation(async ({ ctx }) => checkOutAttendance({ companyId: ctx.user.companyId, userId: ctx.user.id })),
});
