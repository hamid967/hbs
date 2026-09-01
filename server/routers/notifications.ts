import { z } from "zod";
import { getSmartUrgentNotifications, listNotifications, markNotificationRead } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const notificationsRouter = router({
  list: protectedProcedure.query(({ ctx }) => listNotifications(ctx.user.companyId, ctx.user.id)),
  smartUrgent: protectedProcedure.query(({ ctx }) =>
    getSmartUrgentNotifications(ctx.user.companyId, ctx.user.id, ctx.user.role)
  ),
  markRead: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => markNotificationRead(input.id, ctx.user.companyId, ctx.user.id)),
});

