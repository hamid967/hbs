import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({ createDemoRequest: vi.fn(), getDemoRequests: vi.fn(), updateDemoRequest: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { demoRequestsRouter } from "./demoRequests";

function context(role: "user" | "hr" | "government" | "manager" | "admin"): TrpcContext {
  return { user: { id: 12, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const publicInput = { fullName: "أحمد محمد", workEmail: "ahmed@company.com", phone: "0500000000", companyName: "شركة الغد", companySize: "11–50 موظفاً", businessActivity: "تقنية", interest: "الموارد البشرية", notes: "نرغب في عرض مخصص", consent: true as const };

describe("demo requests router", () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it("accepts a valid public demo request and persists its business details", async () => {
    dbMocks.createDemoRequest.mockResolvedValue({ id: 1, ...publicInput });
    const result = await demoRequestsRouter.createCaller(context("user")).submit(publicInput);
    expect(result).toMatchObject({ id: 1 });
    expect(dbMocks.createDemoRequest).toHaveBeenCalledWith(expect.objectContaining({ fullName: "أحمد محمد", companyName: "شركة الغد", interest: "الموارد البشرية" }));
  });

  it("prevents ordinary employees from seeing commercial leads", async () => {
    await expect(demoRequestsRouter.createCaller(context("user")).list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getDemoRequests).not.toHaveBeenCalled();
  });

  it("allows managers to save status and internal follow-up notes", async () => {
    dbMocks.updateDemoRequest.mockResolvedValue({ success: true });
    await expect(demoRequestsRouter.createCaller(context("manager")).update({ id: 1, status: "qualified", internalNote: "تم تحديد اجتماع الأسبوع القادم" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateDemoRequest).toHaveBeenCalledWith({ id: 1, status: "qualified", internalNote: "تم تحديد اجتماع الأسبوع القادم", ownerId: 12 });
  });
});
