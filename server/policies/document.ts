import type { PlatformRole } from "../../shared/permissions";
import { can, type PolicyContext } from "./context";

export type DocumentRef = {
  companyId: number;
  employeeUserId: number;
  managerUserId?: number | null;
};

const companyWideDocumentReaders: ReadonlySet<PlatformRole> = new Set<PlatformRole>([
  "super_admin",
  "company_admin",
  "hr_admin",
  "hr_manager",
  "government_relations_officer",
  "auditor",
]);

export function canAccessDocument(ctx: PolicyContext, document: DocumentRef): boolean {
  if (ctx.companyId !== document.companyId || !can(ctx, "document.read")) return false;
  if (document.employeeUserId === ctx.userId) return true;
  if (companyWideDocumentReaders.has(ctx.platformRole)) return true;
  return ctx.platformRole === "direct_manager" && document.managerUserId === ctx.userId;
}

export function canUploadDocument(ctx: PolicyContext, document: DocumentRef): boolean {
  if (ctx.companyId !== document.companyId || !can(ctx, "document.upload")) return false;
  return document.employeeUserId === ctx.userId || ctx.platformRole !== "employee";
}

export function canDeleteDocument(ctx: PolicyContext, document: DocumentRef): boolean {
  return ctx.companyId === document.companyId && can(ctx, "document.delete");
}
