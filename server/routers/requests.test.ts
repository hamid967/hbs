import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({
  addRequestNote: vi.fn(),
  createRequestWithHistory: vi.fn(),
  getEmployeeRequests: vi.fn(),
  getUserModulePermissions: vi.fn(),
  getOperationsRequests: vi.fn(),
  getRequestDetail: vi.fn(),
  updateRequestStatus: vi.fn(),
}));

vi.mock("../db", () => dbMocks);

import { requestsRouter } from "./requests";

function context(role: "user" | "hr" | "government" | "manager" | "admin"): TrpcContext {
  return {
    user: {
      id: 10,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      companyId: 1,
      role,
      accountStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("requests router authorization and review workflow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.getRequestDetail.mockResolvedValue({
      request: { id: 44, type: "hr", status: "submitted" },
      history: [],
      canManage: true,
    });
    dbMocks.updateRequestStatus.mockResolvedValue({ success: true });
    dbMocks.createRequestWithHistory.mockResolvedValue({ id: 52, reference: "HR-TEST", status: "submitted" });
    dbMocks.addRequestNote.mockResolvedValue({ success: true });
    dbMocks.getUserModulePermissions.mockImplementation((_userId: number, role: string) => {
      if (role === "hr") return [{ module: "hr", canView: true, canManage: true }, { module: "government", canView: false, canManage: false }];
      if (role === "government") return [{ module: "hr", canView: false, canManage: false }, { module: "government", canView: true, canManage: true }];
      if (role === "manager" || role === "admin") return [{ module: "hr", canView: true, canManage: true }, { module: "government", canView: true, canManage: true }];
      return [{ module: "hr", canView: false, canManage: false }, { module: "government", canView: false, canManage: false }];
    });
  });

  it("prevents an employee account from opening the operations queue", async () => {
    const caller = requestsRouter.createCaller(context("user"));
    await expect(caller.operations({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getOperationsRequests).not.toHaveBeenCalled();
  });

  it("creates a request inside the employee company for the approval workflow", async () => {
    const caller = requestsRouter.createCaller(context("user"));
    await expect(caller.create({ type: "hr", category: "إجازة", subject: "طلب إجازة سنوية", details: "أرغب في تقديم طلب إجازة سنوية مع تحديد المدة.", priority: "normal" })).resolves.toMatchObject({ id: 52 });
    expect(dbMocks.createRequestWithHistory).toHaveBeenCalledWith(expect.objectContaining({ type: "hr", employeeId: 10, companyId: 1 }));
  });

  it("allows HR staff to update an HR request status with an auditable note", async () => {
    const caller = requestsRouter.createCaller(context("hr"));
    await expect(caller.changeStatus({ id: 44, status: "approved", note: "اكتملت المراجعة." })).resolves.toEqual({ success: true });
    expect(dbMocks.updateRequestStatus).toHaveBeenCalledWith(44, 10, "submitted", "approved", "اكتملت المراجعة.");
  });

  it("prevents government-relations staff from changing an HR request", async () => {
    const caller = requestsRouter.createCaller(context("government"));
    await expect(caller.changeStatus({ id: 44, status: "rejected" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.updateRequestStatus).not.toHaveBeenCalled();
  });

  it("records an operational note with its employee-visibility setting", async () => {
    const caller = requestsRouter.createCaller(context("hr"));
    await expect(caller.addNote({ id: 44, note: "تم طلب مستند إضافي.", visibleToEmployee: false })).resolves.toEqual({ success: true });
    expect(dbMocks.addRequestNote).toHaveBeenCalledWith(44, 10, "تم طلب مستند إضافي.", false);
  });
});
