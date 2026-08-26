import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ createCompanyEmployeeAsset: vi.fn(), listCompanyEmployeeAssets: vi.fn(), listCompanyEmployees: vi.fn(), updateCompanyEmployeeAsset: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { assetsRouter } from "./assets";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "assets-manager", name: "Assets Manager", email: "assets@example.com", loginMethod: "oauth", companyId: 1, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("assets router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyEmployeeAssets.mockResolvedValue([]); dbMocks.listCompanyEmployees.mockResolvedValue([]); dbMocks.createCompanyEmployeeAsset.mockResolvedValue({ id: 4, companyId: 1, assetTag: "LAP-021" }); dbMocks.updateCompanyEmployeeAsset.mockResolvedValue({ id: 4, companyId: 1, status: "assigned" }); });

  it("lists assets and eligible employees only for HR/Admin inside the active company", async () => {
    await expect(assetsRouter.createCaller(context("hr")).overview()).resolves.toEqual({ assets: [], employees: [] });
    expect(dbMocks.listCompanyEmployeeAssets).toHaveBeenCalledWith(1);
    expect(dbMocks.listCompanyEmployees).toHaveBeenCalledWith(1);
    await expect(assetsRouter.createCaller(context("manager")).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates an assigned asset using the active company and actor only", async () => {
    const caller = assetsRouter.createCaller(context("admin"));
    await expect(caller.create({ assetName: "حاسب محمول", assetTag: "LAP-021", assignedEmployeeUserId: 20 })).resolves.toMatchObject({ id: 4 });
    expect(dbMocks.createCompanyEmployeeAsset).toHaveBeenCalledWith({ companyId: 1, createdByUserId: 8, assetName: "حاسب محمول", assetTag: "LAP-021", assignedEmployeeUserId: 20 });
  });

  it("updates an asset status within the active company context", async () => {
    const caller = assetsRouter.createCaller(context("hr"));
    await caller.update({ assetId: 4, status: "assigned", assignedEmployeeUserId: 20 });
    expect(dbMocks.updateCompanyEmployeeAsset).toHaveBeenCalledWith({ companyId: 1, assetId: 4, status: "assigned", assignedEmployeeUserId: 20 });
  });
});
