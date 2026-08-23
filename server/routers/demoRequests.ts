import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDemoRequest, getDemoRequests, updateDemoRequest } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const demoStatus = z.enum(["new", "contacted", "qualified", "closed"]);
const demoInput = z.object({
  fullName: z.string().trim().min(3, "أدخل الاسم الكامل").max(160),
  workEmail: z.string().trim().email("أدخل بريداً إلكترونياً صالحاً").max(320),
  phone: z.string().trim().min(7, "أدخل رقم هاتف صالحاً").max(48).optional(),
  companyName: z.string().trim().min(2, "أدخل اسم الشركة").max(180),
  companySize: z.string().trim().min(2, "اختر حجم الشركة").max(80),
  businessActivity: z.string().trim().max(240).optional(),
  interest: z.string().trim().min(2, "اختر المجال الذي يهمك").max(120),
  notes: z.string().trim().max(2000).optional(),
  consent: z.literal(true, { error: "يلزم الموافقة على تواصل فريق حلول الغد" }),
});

function assertCommercialAccess(role: string) {
  if (role !== "admin" && role !== "manager") throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة طلبات العروض" });
}

export const demoRequestsRouter = router({
  submit: publicProcedure.input(demoInput).mutation(({ input }) => createDemoRequest({
    fullName: input.fullName,
    workEmail: input.workEmail,
    ...(input.phone ? { phone: input.phone } : {}),
    companyName: input.companyName,
    companySize: input.companySize,
    ...(input.businessActivity ? { businessActivity: input.businessActivity } : {}),
    interest: input.interest,
    ...(input.notes ? { notes: input.notes } : {}),
  })),
  list: protectedProcedure.input(z.object({ status: demoStatus.optional() })).query(({ ctx, input }) => {
    assertCommercialAccess(ctx.user.role);
    return getDemoRequests(input);
  }),
  update: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: demoStatus, internalNote: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => {
    assertCommercialAccess(ctx.user.role);
    return updateDemoRequest({ ...input, ownerId: ctx.user.id });
  }),
});
