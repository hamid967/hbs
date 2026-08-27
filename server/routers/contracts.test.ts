import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ createCompanyEmployeeContract: vi.fn(), createCompanyEmployeeDocument: vi.fn(), createCompanyEmployeeLifecycleEvent: vi.fn(), getCompanyEmployeeAccessRef: vi.fn(), getCompanyEmployeeDocumentAccessRef: vi.fn(), listCompanyEmployeeContracts: vi.fn(), listCompanyEmployeeDocuments: vi.fn(), listCompanyEmployees: vi.fn(), recordAuditEvent: vi.fn() }));
const storageMocks = vi.hoisted(() => ({ storageGet: vi.fn(), storagePut: vi.fn() }));
vi.mock("../db", () => dbMocks);
vi.mock("../storage", () => storageMocks);

import { contractsRouter } from "./contracts";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "contracts-admin", name: "Contracts Admin", email: "contracts@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("contracts router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listCompanyEmployees.mockResolvedValue([]);
    dbMocks.listCompanyEmployeeContracts.mockResolvedValue([]);
    dbMocks.listCompanyEmployeeDocuments.mockResolvedValue([]);
    dbMocks.createCompanyEmployeeContract.mockResolvedValue({ id: 4, companyId: 1, employeeUserId: 20, contractReference: "CTR-001" });
    dbMocks.createCompanyEmployeeDocument.mockResolvedValue({ id: 6, companyId: 1, employeeUserId: 20, storageKey: "companies/1/employee-documents/20/file.pdf" });
    dbMocks.getCompanyEmployeeAccessRef.mockResolvedValue({ companyId: 1, userId: 20, managerUserId: 8 });
    dbMocks.getCompanyEmployeeDocumentAccessRef.mockResolvedValue({ id: 6, companyId: 1, employeeUserId: 20, managerUserId: 8, storageKey: "companies/1/employee-documents/20/file.pdf", mimeType: "application/pdf", fileName: "document.pdf" });
    dbMocks.createCompanyEmployeeLifecycleEvent.mockResolvedValue({ id: 7 });
    dbMocks.recordAuditEvent.mockResolvedValue(undefined);
    storageMocks.storageGet.mockResolvedValue({ key: "stored-key", url: "/manus-storage/stored-key" });
    storageMocks.storagePut.mockResolvedValue({ key: "companies/1/employee-documents/20/file.pdf", url: "/manus-storage/file.pdf" });
  });

  it("limits contract and document data to HR and admins", async () => {
    await expect(contractsRouter.createCaller(context("manager")).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(contractsRouter.createCaller(context("user")).createContract({ employeeUserId: 20, contractReference: "CTR-001", title: "سجل عقد", status: "draft" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("uses only current-company data in contract overview", async () => {
    await expect(contractsRouter.createCaller(context("hr")).overview()).resolves.toMatchObject({ employees: [], contracts: [], documents: [] });
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(1);
    expect(dbMocks.listCompanyEmployeeContracts).toHaveBeenCalledWith(1);
    expect(dbMocks.listCompanyEmployeeDocuments).toHaveBeenCalledWith(1);
  });

  it("creates a contract and a generic lifecycle event inside the company", async () => {
    const caller = contractsRouter.createCaller(context("admin"));
    await caller.createContract({ employeeUserId: 20, contractReference: "CTR-001", title: "سجل عقد تشغيل", status: "draft", startAt: new Date("2026-01-01T00:00:00Z") });
    expect(dbMocks.createCompanyEmployeeContract).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8, employeeUserId: 20, contractReference: "CTR-001" }));
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, eventType: "profile_updated", note: "إضافة سجل عقد تشغيلي" }));
  });

  it("links an operational contract version only through the active company context", async () => {
    const caller = contractsRouter.createCaller(context("hr"));
    await caller.createContract({ employeeUserId: 20, contractReference: "CTR-002", title: "إصدار محدث", status: "draft", supersedesContractId: 4 });
    expect(dbMocks.createCompanyEmployeeContract).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, createdByUserId: 8, employeeUserId: 20, contractReference: "CTR-002", supersedesContractId: 4 }));
    expect(dbMocks.createCompanyEmployeeLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, note: "إضافة إصدار عقد تشغيلي" }));
  });

  it("stores only approved previewable documents with metadata outside the database blob", async () => {
    const caller = contractsRouter.createCaller(context("hr"));
    await caller.uploadDocument({ employeeUserId: 20, category: "employee_document", fileName: "document.pdf", mimeType: "application/pdf", fileContentBase64: Buffer.from("%PDF-1.7\n").toString("base64") });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("companies/1/employee-documents/20/"), expect.any(Buffer), "application/pdf");
    expect(dbMocks.createCompanyEmployeeDocument).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, employeeUserId: 20, uploadedByUserId: 8, mimeType: "application/pdf", sizeBytes: 9 }));
    await expect(caller.uploadDocument({ employeeUserId: 20, category: "employee_document", fileName: "notes.txt", mimeType: "text/plain", fileContentBase64: "dGVzdA==" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates a storage URL only after document authorization and records the access", async () => {
    const caller = contractsRouter.createCaller(context("hr"));
    await expect(caller.openDocument({ documentId: 6 })).resolves.toMatchObject({ documentId: 6, url: "/manus-storage/stored-key" });
    expect(dbMocks.getCompanyEmployeeDocumentAccessRef).toHaveBeenCalledWith(1, 6);
    expect(storageMocks.storageGet).toHaveBeenCalledWith("companies/1/employee-documents/20/file.pdf");
    expect(dbMocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1, actorUserId: 8, action: "employee_document_opened", entityId: 6 }));
  });

  it("does not issue a storage URL for a missing or foreign document reference", async () => {
    dbMocks.getCompanyEmployeeDocumentAccessRef.mockResolvedValue(undefined);
    await expect(contractsRouter.createCaller(context("hr")).openDocument({ documentId: 999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(storageMocks.storageGet).not.toHaveBeenCalled();
  });
});
