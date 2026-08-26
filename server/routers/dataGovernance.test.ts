import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ getCompanyDataRetentionPolicies: vi.fn(), upsertCompanyDataRetentionPolicy: vi.fn() }));
vi.mock("../db", () => dbMocks);

import type { TrpcContext } from "../_core/context";
import { dataGovernanceRouter } from "./dataGovernance";

function context(role: "user" | "hr" | "admin" = "admin"): TrpcContext {
  return { user: { id: 11, openId: "data-admin", name: "Data Admin", email: "data@example.com", loginMethod: "oauth", companyId: 4, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("data governance router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getCompanyDataRetentionPolicies.mockResolvedValue([]); dbMocks.upsertCompanyDataRetentionPolicy.mockResolvedValue({ id: 3, companyId: 4 }); });

  it("limits the policy catalog to the active administrator company", async () => {
    await dataGovernanceRouter.createCaller(context()).listRetentionPolicies();
    await dataGovernanceRouter.createCaller(context()).saveRetentionPolicy({ dataDomain: "employees", ownerLabel: "الموارد البشرية", retentionDays: 365, reviewState: "reviewed", policyNote: "مسودة داخلية قابلة للمراجعة." });
    expect(dbMocks.getCompanyDataRetentionPolicies).toHaveBeenCalledWith(4);
    expect(dbMocks.upsertCompanyDataRetentionPolicy).toHaveBeenCalledWith(expect.objectContaining({ companyId: 4, createdByUserId: 11, dataDomain: "employees" }));
  });

  it("blocks HR and employees before reading or saving policy records", async () => {
    await expect(dataGovernanceRouter.createCaller(context("hr")).listRetentionPolicies()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(dataGovernanceRouter.createCaller(context("user")).saveRetentionPolicy({ dataDomain: "audit", ownerLabel: "المسؤول", reviewState: "draft", policyNote: "مسودة تشغيلية داخلية." })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.upsertCompanyDataRetentionPolicy).not.toHaveBeenCalled();
  });
});
