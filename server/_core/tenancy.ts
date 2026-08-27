import { TRPCError } from "@trpc/server";

export type CompanyScoped = { companyId: number };

/**
 * Returns the resource only when it belongs to the caller's company. A missing
 * or foreign resource is deliberately reported as NOT_FOUND to avoid revealing
 * whether another tenant's record exists.
 */
export function assertSameCompany<T extends CompanyScoped>(
  resource: T | null | undefined,
  companyId: number,
): T {
  if (!resource || resource.companyId !== companyId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "العنصر غير موجود ضمن نطاق شركتك" });
  }
  return resource;
}

export function isSameCompany(
  resource: CompanyScoped | null | undefined,
  companyId: number,
): boolean {
  return Boolean(resource && resource.companyId === companyId);
}

export function assertAllSameCompany(
  resources: readonly CompanyScoped[],
  companyId: number,
): void {
  for (const resource of resources) assertSameCompany(resource, companyId);
}
