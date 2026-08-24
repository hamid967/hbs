import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ getHrOperationsReport: vi.fn() }));
vi.mock("../db", () => dbMocks);

import type { TrpcContext } from "../_core/context";
import { reportsRouter } from "./reports";

function context(role: "user" | "hr" | "government" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 9, openId: "report-user", name: "Report User", email: "report@example.com", loginMethod: "oauth", companyId: 3, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("reports router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getHrOperationsReport.mockResolvedValue({ scope: "company", selectedMonth: "2026-08", leaveDays: {}, expensesSar: {} }); });
  it("requests the company report for HR using the selected month", async () => {
    await expect(reportsRouter.createCaller(context("hr")).monthly({ month: "2026-08" })).resolves.toMatchObject({ scope: "company" });
    expect(dbMocks.getHrOperationsReport).toHaveBeenCalledWith(3, "hr", 9, "2026-08");
  });
  it("passes the signed-in manager identity so direct-team scoping remains server-side", async () => {
    await reportsRouter.createCaller(context("manager")).monthly({ month: "2026-07" });
    expect(dbMocks.getHrOperationsReport).toHaveBeenCalledWith(3, "manager", 9, "2026-07");
  });
  it("blocks users without report access", async () => {
    await expect(reportsRouter.createCaller(context("user")).monthly({ month: "2026-08" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("rejects an invalid month before querying data", async () => {
    await expect(reportsRouter.createCaller(context("admin")).monthly({ month: "2026-13" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.getHrOperationsReport).not.toHaveBeenCalled();
  });
});
