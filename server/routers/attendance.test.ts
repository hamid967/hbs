import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ checkInAttendance: vi.fn(), checkOutAttendance: vi.fn(), getMyAttendanceEntry: vi.fn(), listAttendanceForScope: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { attendanceRouter } from "./attendance";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "user"): TrpcContext {
  return { user: { id: 14, openId: "attendance-user", name: "Attendance User", email: "attendance@example.com", loginMethod: "oauth", companyId: 5, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("attendance router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getMyAttendanceEntry.mockResolvedValue(undefined); dbMocks.listAttendanceForScope.mockResolvedValue([]); dbMocks.checkInAttendance.mockResolvedValue({ id: 1 }); dbMocks.checkOutAttendance.mockResolvedValue({ id: 1, status: "completed" }); });

  it("loads the employee own entry from the authenticated company", async () => {
    await attendanceRouter.createCaller(context()).mine();
    expect(dbMocks.getMyAttendanceEntry).toHaveBeenCalledWith(5, 14);
  });

  it("records check-in only for the authenticated employee and company", async () => {
    await attendanceRouter.createCaller(context()).checkIn({ workMode: "remote", note: "عمل عن بُعد" });
    expect(dbMocks.checkInAttendance).toHaveBeenCalledWith({ companyId: 5, userId: 14, workMode: "remote", note: "عمل عن بُعد" });
  });

  it("passes manager scope to the server for direct-team attendance", async () => {
    await attendanceRouter.createCaller(context("manager")).overview({ workDate: "2026-08-25" });
    expect(dbMocks.listAttendanceForScope).toHaveBeenCalledWith({ companyId: 5, actorId: 14, role: "manager", workDate: "2026-08-25" });
  });

  it("records check-out only for the authenticated employee and company", async () => {
    await attendanceRouter.createCaller(context("hr")).checkOut();
    expect(dbMocks.checkOutAttendance).toHaveBeenCalledWith({ companyId: 5, userId: 14 });
  });
});
