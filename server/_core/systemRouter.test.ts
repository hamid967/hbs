import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ probeDatabaseConnection: vi.fn(), getOAuthAcceptanceReadiness: vi.fn() }));
vi.mock("../db", () => dbMocks);

import type { TrpcContext } from "./context";
import { systemRouter } from "./systemRouter";

function context(role: "user" | "hr" | "admin" = "admin"): TrpcContext {
  return {
    user: { id: 7, openId: "system-user", name: "System User", email: "system@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system operational status", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.probeDatabaseConnection.mockResolvedValue(true); dbMocks.getOAuthAcceptanceReadiness.mockResolvedValue({ overall: "ready", counts: { activeEmployees: 1, activeManagers: 1, activeSpecialists: 1, linkedEmployeeManagers: 1 }, checks: [], checkedAt: "2026-08-27T00:00:00.000Z" }); });

  it("returns a limited operational snapshot to an active administrator", async () => {
    const result = await systemRouter.createCaller(context()).operationalStatus();
    expect(result).toMatchObject({ overall: "available", signals: expect.arrayContaining([expect.objectContaining({ id: "database", state: "available" })]) });
    expect(dbMocks.probeDatabaseConnection).toHaveBeenCalledOnce();
  });

  it("blocks non-administrators before probing the database", async () => {
    await expect(systemRouter.createCaller(context("hr")).operationalStatus()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.probeDatabaseConnection).not.toHaveBeenCalled();
  });
});

describe("system data inventory", () => {
  it("returns only the catalog metadata to an administrator", async () => {
    const result = await systemRouter.createCaller(context()).dataInventory();
    expect(result.domains).toEqual(expect.arrayContaining([expect.objectContaining({ id: "employees", retentionState: "policy_pending" })]));
    expect(JSON.stringify(result)).not.toContain("employeeId");
  });

  it("blocks non-administrators from the catalog", async () => {
    await expect(systemRouter.createCaller(context("hr")).dataInventory()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("OAuth acceptance readiness", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getOAuthAcceptanceReadiness.mockResolvedValue({ overall: "ready", counts: { activeEmployees: 1, activeManagers: 1, activeSpecialists: 1, linkedEmployeeManagers: 1 }, checks: [], checkedAt: "2026-08-27T00:00:00.000Z" }); });

  it("returns aggregate readiness only to an administrator", async () => {
    const result = await systemRouter.createCaller(context()).oauthAcceptanceReadiness();
    expect(result).toMatchObject({ overall: "ready", counts: { activeEmployees: 1 } });
    expect(JSON.stringify(result)).not.toContain("userId");
    expect(dbMocks.getOAuthAcceptanceReadiness).toHaveBeenCalledWith(1);
  });

  it("blocks non-administrators before querying readiness", async () => {
    await expect(systemRouter.createCaller(context("hr")).oauthAcceptanceReadiness()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getOAuthAcceptanceReadiness).not.toHaveBeenCalled();
  });
});
