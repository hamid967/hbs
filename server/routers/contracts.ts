import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCompanyEmployeeContract, createCompanyEmployeeDocument, createCompanyEmployeeLifecycleEvent, listCompanyEmployeeContracts, listCompanyEmployeeDocuments, listCompanyEmployees } from "../db";
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
    const documentsWithUrls = await Promise.all(documents.map(async document => ({ ...document, url: (await storageGet(document.storageKey)).url })));
    return { employees, contracts, documents: documentsWithUrls, allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg"], maxDocumentBytes };
  }),
  createContract: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), contractReference: z.string().trim().min(2).max(80), title: z.string().trim().min(2).max(160), status: contractStatus, startAt: z.date().optional(), endAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    ensureContractsAccess(ctx.user.role);
    const contract = await createCompanyEmployeeContract({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "إضافة سجل عقد تشغيلي", createdByUserId: ctx.user.id });
    return contract;
  }),
  uploadDocument: protectedProcedure.input(z.object({ employeeUserId: z.number().int().positive(), contractId: z.number().int().positive().optional(), category: documentCategory, fileName: z.string().trim().min(1).max(240), mimeType: z.string().trim().max(100), fileContentBase64: z.string().min(1).max(7_200_000) })).mutation(async ({ ctx, input }) => {
    ensureContractsAccess(ctx.user.role);
    const bytes = decodeFile(input);
    const stored = await storagePut(`companies/${ctx.user.companyId}/employee-documents/${input.employeeUserId}/${Date.now()}-${sanitizeFileName(input.fileName)}`, bytes, input.mimeType);
    const document = await createCompanyEmployeeDocument({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, contractId: input.contractId, category: input.category, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: bytes.length, storageKey: stored.key, uploadedByUserId: ctx.user.id });
    await createCompanyEmployeeLifecycleEvent({ companyId: ctx.user.companyId, employeeUserId: input.employeeUserId, eventType: "profile_updated", effectiveAt: new Date(), note: "إضافة وثيقة إلى ملف الموظف", createdByUserId: ctx.user.id });
    return { ...document, url: stored.url };
  }),
});
