import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ listCompanyExecutionDependencyReviews: vi.fn(), requestExecutionDependencyReview: vi.fn(), requestExecutionRetry: vi.fn(), resolveExecutionDependency: vi.fn() }));
vi.mock("../db", () => db);
import { executionControlRouter } from "./executionControl";
import type { TrpcContext } from "../_core/context";

const ctx = (role: "admin" | "hr" = "admin", companyId = 7) => ({ user: { id: 4, openId: "x", name: "مستخدم", email: "x@y.com", loginMethod: "oauth", companyId, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] }) as TrpcContext;

describe("execution control router", () => {
  beforeEach(() => { vi.clearAllMocks(); db.listCompanyExecutionDependencyReviews.mockResolvedValue([]); db.requestExecutionDependencyReview.mockResolvedValue({ id: 1, companyId: 7, stageNumber: 7, status: "review_requested" }); db.resolveExecutionDependency.mockResolvedValue({ id: 1, companyId: 7, stageNumber: 7, status: "dependency_resolved" }); db.requestExecutionRetry.mockResolvedValue({ id: 1, companyId: 7, stageNumber: 7, status: "retry_requested" }); });
  it("lists only the current company review records", async () => { await expect(executionControlRouter.createCaller(ctx("hr", 9)).list()).resolves.toEqual([]); expect(db.listCompanyExecutionDependencyReviews).toHaveBeenCalledWith(9); });
  it("allows only admins to create and advance review controls", async () => { const caller = executionControlRouter.createCaller(ctx()); await caller.requestReview({ stageNumber: 7 }); await caller.resolveDependency({ stageNumber: 7 }); await caller.requestRetry({ stageNumber: 7 }); expect(db.requestExecutionDependencyReview).toHaveBeenCalledWith({ companyId: 7, stageNumber: 7, requestedByUserId: 4 }); expect(db.resolveExecutionDependency).toHaveBeenCalledWith({ companyId: 7, stageNumber: 7, reviewedByUserId: 4 }); expect(db.requestExecutionRetry).toHaveBeenCalledWith({ companyId: 7, stageNumber: 7 }); });
  it("rejects non-admin mutation attempts", async () => { await expect(executionControlRouter.createCaller(ctx("hr")).requestReview({ stageNumber: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" }); });
});
