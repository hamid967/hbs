import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ probeDatabaseConnection: vi.fn() }));
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
  beforeEach(() => { vi.clearAllMocks(); dbMocks.probeDatabaseConnection.mockResolvedValue(true); });

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
