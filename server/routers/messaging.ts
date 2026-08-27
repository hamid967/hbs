import { z } from "zod";
import {
  archiveInternalMessagingChannel,
  createInternalMessagingChannel,
  getInternalMessagingChannelDetail,
  getInternalMessagingChannelDetailForAdmin,
  listCompanyEmployees,
  listInternalMessagingChannelsForAdmin,
  listInternalMessagingChannelsForUser,
  listInternalMessagingMessages,
  replaceInternalMessagingChannelMembers,
  sendInternalMessagingMessage,
} from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const channelId = z.number().int().positive();
const participantIds = z.array(z.number().int().positive()).max(300);

export const messagingRouter = router({
  myChannels: protectedProcedure.query(({ ctx }) => listInternalMessagingChannelsForUser({ companyId: ctx.user.companyId, userId: ctx.user.id })),
  channel: protectedProcedure.input(z.object({ channelId })).query(({ ctx, input }) => getInternalMessagingChannelDetail({ companyId: ctx.user.companyId, channelId: input.channelId, userId: ctx.user.id })),
  messages: protectedProcedure.input(z.object({ channelId })).query(({ ctx, input }) => listInternalMessagingMessages({ companyId: ctx.user.companyId, channelId: input.channelId, userId: ctx.user.id })),
  send: protectedProcedure.input(z.object({ channelId, body: z.string().trim().min(1, "اكتب رسالة قبل الإرسال").max(3000, "الرسالة طويلة جداً") })).mutation(({ ctx, input }) => sendInternalMessagingMessage({ companyId: ctx.user.companyId, channelId: input.channelId, senderUserId: ctx.user.id, body: input.body })),
  management: router({
    channels: adminProcedure.query(({ ctx }) => listInternalMessagingChannelsForAdmin(ctx.user.companyId)),
    channel: adminProcedure.input(z.object({ channelId })).query(({ ctx, input }) => getInternalMessagingChannelDetailForAdmin({ companyId: ctx.user.companyId, channelId: input.channelId })),
    employees: adminProcedure.query(({ ctx }) => listCompanyEmployees(ctx.user.companyId).then(employees => employees.map(employee => ({ id: employee.id, name: employee.name, role: employee.role, department: employee.department?.name ?? null })))),
    create: adminProcedure.input(z.object({ name: z.string().trim().min(2, "اسم القناة قصير جداً").max(120), description: z.string().trim().max(360).optional(), memberUserIds: participantIds })).mutation(({ ctx, input }) => createInternalMessagingChannel({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input })),
    replaceMembers: adminProcedure.input(z.object({ channelId, memberUserIds: participantIds })).mutation(({ ctx, input }) => replaceInternalMessagingChannelMembers({ companyId: ctx.user.companyId, channelId: input.channelId, actorUserId: ctx.user.id, memberUserIds: input.memberUserIds })),
    archive: adminProcedure.input(z.object({ channelId })).mutation(({ ctx, input }) => archiveInternalMessagingChannel({ companyId: ctx.user.companyId, channelId: input.channelId })),
  }),
});
