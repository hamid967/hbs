import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ getApprovalInbox: vi.fn(), listMyTrainingAssignments: vi.fn(), listNotifications: vi.fn() }));
vi.mock("../db", () => db);
import { workboardRouter } from "./workboard";
import type { TrpcContext } from "../_core/context";
const ctx = (role: "user" | "manager" = "user") => ({ user: { id: 4, openId: "x", name: "مستخدم", email: "x@y.com", loginMethod: "oauth", companyId: 7, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] }) as TrpcContext;
describe("workboard router", () => { beforeEach(() => { vi.clearAllMocks(); db.listNotifications.mockResolvedValue([]); db.listMyTrainingAssignments.mockResolvedValue([]); db.getApprovalInbox.mockResolvedValue([]); }); it("limits a user to their own notifications and training", async () => { await workboardRouter.createCaller(ctx()).overview(); expect(db.listNotifications).toHaveBeenCalledWith(7, 4); expect(db.listMyTrainingAssignments).toHaveBeenCalledWith(7, 4); expect(db.getApprovalInbox).not.toHaveBeenCalled(); }); it("uses the direct manager inbox only", async () => { await workboardRouter.createCaller(ctx("manager")).overview(); expect(db.getApprovalInbox).toHaveBeenCalledWith(7, 4, ["manager"]); }); });
