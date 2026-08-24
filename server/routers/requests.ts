import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createRequestWithHistory,
  getEmployeeRequests,
  getOperationsRequests,
  getRequestDetail,
  getUserModulePermissions,
  saveExpenseRequestDetails,
  saveLeaveRequestDetails,
  updateRequestStatus,
  addRequestNote,
} from "../db";
import { canManageRequest, createRequestReference, permittedRequestTypes } from "../requestPolicy";
import { protectedProcedure, router } from "../_core/trpc";

const requestType = z.enum(["hr", "government"]);
const requestStatus = z.enum(["submitted", "in_review", "approved", "rejected", "completed"]);

export const createRequestInput = z.object({
  type: requestType,
  category: z.string().trim().min(2, "اختر الخدمة المطلوبة").max(120),
  subject: z.string().trim().min(5, "اكتب عنواناً أوضح للطلب").max(240),
  details: z.string().trim().min(10, "أضف تفاصيل كافية لمعالجة الطلب").max(5000),
  priority: z.enum(["normal", "urgent"]).default("normal"),
});

const requestFilters = z.object({
  type: requestType.optional(),
  status: requestStatus.optional(),
});

export const requestsRouter = router({
  create: protectedProcedure.input(createRequestInput).mutation(async ({ ctx, input }) => {
    const request = await createRequestWithHistory({
      ...input,
      reference: createRequestReference(input.type),
      employeeId: ctx.user.id,
      companyId: ctx.user.companyId,
    });
    return request;
  }),

  createLeave: protectedProcedure.input(z.object({ leaveType: z.enum(["annual", "sick", "emergency"]), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), details: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (input.endDate < input.startDate) throw new TRPCError({ code: "BAD_REQUEST", message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" });
    const label = { annual: "إجازة سنوية", sick: "إجازة مرضية", emergency: "إجازة طارئة" }[input.leaveType];
    const request = await createRequestWithHistory({ type: "hr", category: label, subject: `${label} من ${input.startDate} إلى ${input.endDate}`, details: input.details || `طلب ${label}`, priority: "normal", reference: createRequestReference("hr"), employeeId: ctx.user.id, companyId: ctx.user.companyId });
    await saveLeaveRequestDetails({ requestId: request.id, companyId: ctx.user.companyId, ...input });
    return request;
  }),

  createExpense: protectedProcedure.input(z.object({ expenseType: z.enum(["travel", "operating"]), amountSar: z.string().regex(/^\d+(\.\d{1,2})?$/), reason: z.string().trim().min(3).max(1000) })).mutation(async ({ ctx, input }) => {
    const amount = Number(input.amountSar); if (!Number.isFinite(amount) || amount <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "المبلغ غير صالح" });
    const label = input.expenseType === "travel" ? "مصروف سفر" : "مصروف تشغيل";
    const request = await createRequestWithHistory({ type: "hr", category: label, subject: `${label} بقيمة ${amount.toFixed(2)} ر.س`, details: input.reason, priority: "normal", reference: createRequestReference("hr"), employeeId: ctx.user.id, companyId: ctx.user.companyId });
    await saveExpenseRequestDetails({ requestId: request.id, companyId: ctx.user.companyId, ...input });
    return request;
  }),

  mine: protectedProcedure.input(requestFilters).query(({ ctx, input }) =>
    getEmployeeRequests(ctx.user.id, input)
  ),

  detail: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const permissions = await getUserModulePermissions(ctx.user.id, ctx.user.role);
    const detail = await getRequestDetail(input.id, ctx.user.id, ctx.user.role, permissions, ctx.user.companyId);
    if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود أو لا تملك صلاحية الوصول إليه" });
    return detail;
  }),

  operations: protectedProcedure.input(requestFilters).query(async ({ ctx, input }) => {
    const permissions = await getUserModulePermissions(ctx.user.id, ctx.user.role);
    const permittedTypes = permittedRequestTypes(ctx.user.role, permissions);
    if (!permittedTypes.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية الوصول إلى مركز العمليات" });
    if (input.type && !permittedTypes.includes(input.type)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية هذا النوع من الطلبات" });
    return getOperationsRequests(input, permittedTypes);
  }),

  changeStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: requestStatus, note: z.string().trim().max(2500).optional() })).mutation(async ({ ctx, input }) => {
    const permissions = await getUserModulePermissions(ctx.user.id, ctx.user.role);
    const detail = await getRequestDetail(input.id, ctx.user.id, ctx.user.role, permissions, ctx.user.companyId);
    if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
    if (!canManageRequest(ctx.user.role, detail.request.type, permissions)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية مراجعة هذا الطلب" });
    return updateRequestStatus(input.id, ctx.user.id, detail.request.status, input.status, input.note);
  }),

  addNote: protectedProcedure.input(z.object({ id: z.number().int().positive(), note: z.string().trim().min(2).max(2500), visibleToEmployee: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
    const permissions = await getUserModulePermissions(ctx.user.id, ctx.user.role);
    const detail = await getRequestDetail(input.id, ctx.user.id, ctx.user.role, permissions, ctx.user.companyId);
    if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
    if (!canManageRequest(ctx.user.role, detail.request.type, permissions)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إضافة ملاحظة لهذا الطلب" });
    return addRequestNote(input.id, ctx.user.id, input.note, input.visibleToEmployee);
  }),
});
