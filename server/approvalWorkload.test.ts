import { describe, expect, it } from "vitest";
import { buildApprovalWorkload } from "./db";

describe("approval workload", () => {
  it("counts only pending tasks and identifies overdue approvals", () => {
    const now = new Date("2026-08-25T12:00:00Z");
    const workload = buildApprovalWorkload({ tasks: [
      { status: "pending", approverRole: "manager", createdAt: new Date("2026-08-24T10:00:00Z") },
      { status: "pending", approverRole: "hr", createdAt: new Date("2026-08-25T09:00:00Z") },
      { status: "approved", approverRole: "government", createdAt: new Date("2026-08-20T09:00:00Z") },
    ] }, now);
    expect(workload).toEqual({ pending: 2, overdue: 1, oldestHours: 26, byRole: { manager: 1, hr: 1, government: 0, admin: 0 } });
  });
});
