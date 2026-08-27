import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyEmployeeContract, createCompanyEmployeeDocument, createCompanyEmployeeLifecycleEvent, getCompanyEmployeeDocumentAccessRef, getCompanyEmployeeAccessRef, listCompanyEmployeeContracts, listCompanyEmployeeDocuments, listCompanyEmployees, recordAuditEvent } from "../db";
import { assertSameCompany } from "../_core/tenancy";
import { canAccessDocument, canUploadDocument, policyContextFromUser } from "../policies";
import { storageGet, storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

const contractStatus = z.enum(["draft", "active", "ended", "archived"]);
const documentCategory = z.enum(["contract_attachment", "employee_document", "other"]);
const supportedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
const maxDocumentBytes = 5 * 1024 * 1024;

function ensureContractsAccess(role: string) {
  if (!['admin', 'hr'].includes(role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إدارة العقود والوثائق" });
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 160) || "document";
}

function decodeFile(input: { fileContentBase64: string; mimeType: string }) {
  if (!supportedMimeTypes.has(input.mimeType)) throw new TRPCError({ code: "BAD_REQUEST", message: "المعاينة تدعم PDF وPNG وJPEG فقط" });
  const encoded = input.fileContentBase64.replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length || bytes.length > maxDocumentBytes) throw new TRPCError({ code: "BAD_REQUEST", message: "يجب ألا يتجاوز حجم الملف 5 ميغابايت" });
  if (input.mimeType === "application/pdf" && bytes.subarray(0, 4).toString() !== "%PDF") throw new TRPCError({ code: "BAD_REQUEST", message: "ملف PDF غير صالح" });
  return bytes;
}

export const contractsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    ensureContractsAccess(ctx.user.role);
    const [employees, contracts, documents] = await Promise.all([listCompanyEmployees(ctx.user.companyId), listCompanyEmployeeContracts(ctx.user.companyId), listCompanyEmployeeDocuments(ctx.user.companyId)]);
    return { employees, contracts, documents, allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg"], maxDocumentBytes };
  }),
  createContract: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), contractReference: z.string().trim().min(2).max(80), title: z.string().trim().min(2).max(160), status: contractStatus, supersedesContractId: z.number().int().positive().optional(), startAt: z.date().optional(), endAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureContractsAccess(ctx.user.role);
    const contract = await createCompanyEmployeeContract({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: input.supersedesContractId ? "إضافة إصدار عقد تشغيلي" : "إضافة سجل عقد تشغيلي", createdByUserId: ctx.user.id });
    return contract;
  }),
  uploadDocument: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), contractId: z.number().int().positive().optional(), category: documentCategory, fileName: z.string().trim().min(1).max(240), mimeType: z.string().trim().max(100), fileContentBase64: z.string().min(1).max(7_200_000) })).mutation(async ({ ctx, input }) => {
    ensureContractsAccess(ctx.user.role);
    const employee = assertSameCompany(await getCompanyEmployeeAccessRef(ctx.user.companyId, input.employeeUserId), ctx.user.companyId);
    if (!canUploadDocument(policyContextFromUser(ctx.user), { companyId: employee.companyId, employeeUserId: employee.userId, managerUserId: employee.managerUserId })) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية رفع وثيقة لهذا الموظف" });
    const bytes = decodeFile(input);
    const stored = await storagePut(`companies/${ctx.user.companyId}/employee-documents/${input.employeeUserId}/${Date.now()}-${sanitizeFileName(input.fileName)}`, bytes, input.mimeType);
    const document = await createCompanyEmployeeDocument({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, contractId: input.contractId, category: input.category, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: bytes.length, storageKey: stored.key, uploadedByUserId: ctx.user.id });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "إضافة وثيقة إلى ملف الموظف", createdByUserId: ctx.user.id });
    return { ...document, url: stored.url };
  }),
  openDocument: protectedProcedure.input(z.object({ documentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    ensureContractsAccess(ctx.user.role);
    const document = assertSameCompany(await getCompanyEmployeeDocumentAccessRef(ctx.user.companyId, input.documentId), ctx.user.companyId);
    if (!canAccessDocument(policyContextFromUser(ctx.user), document)) throw new TRPCError({ code: "NOT_FOUND", message: "الوثيقة غير موجودة ضمن النطاق المصرح" });
    const stored = await storageGet(document.storageKey);
    try {
      await recordAuditEvent({ companyId: ctx.user.companyId, actorUserId: ctx.user.id, category: "document", action: "employee_document_opened", entityType: "employee_document", entityId: document.id, summary: "فتح وثيقة موظف" });
    } catch (error) {
      console.error("[Audit] تعذر حفظ حدث فتح الوثيقة", error);
    }
    return { documentId: document.id, mimeType: document.mimeType, url: stored.url };
  }),
});
