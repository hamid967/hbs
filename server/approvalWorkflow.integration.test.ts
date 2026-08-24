import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ selectQueue: [] as unknown[][], inserts: [] as unknown[], updates: [] as unknown[] }));
function query(value: unknown[]) {
  const promise = Promise.resolve(value);
  return Object.assign(promise, { from: () => query(value), where: () => query(value), limit: async () => value });
}
const tx = {
  select: vi.fn(() => query(state.selectQueue.shift() ?? [])),
  insert: vi.fn(() => ({ values: (value: unknown) => { state.inserts.push(value); return Promise.resolve(); } })),
  update: vi.fn(() => ({ set: (value: unknown) => ({ where: () => { state.updates.push(value); return Promise.resolve(); } }) })),
};
const fakeDb = { transaction: async (callback: (transaction: typeof tx) => Promise<void>) => callback(tx), select: vi.fn(() => query(state.selectQueue.shift() ?? [])) };
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => fakeDb }));

import { createRequestWithHistory, decideApprovalTask } from "./db";

describe("approval workflow integration", () => {
  beforeEach(() => { state.selectQueue = []; state.inserts = []; state.updates = []; vi.clearAllMocks(); });

  it("creates the company-scoped unit task, unit notification, and in-review history after manager approval", async () => {
    state.selectQueue = [
      [{ id: 11, companyId: 4, requestId: 51, approverRole: "manager", status: "pending" }],
      [{ id: 51, reference: "HR-51", type: "hr", employeeId: 7, status: "submitted" }],
      [{ id: 19 }],
    ];
    await expect(decideApprovalTask({ id: 11, companyId: 4, actorId: 9, allowedRoles: ["manager"], decision: "approved" })).resolves.toEqual({ success: true });
    expect(state.inserts).toEqual(expect.arrayContaining([
      { companyId: 4, requestId: 51, approverRole: "hr" },
      expect.arrayContaining([expect.objectContaining({ companyId: 4, recipientUserId: 19, type: "approval_required", relatedRequestId: 51 })]),
      expect.objectContaining({ requestId: 51, actorId: 9, nextStatus: "in_review" }),
    ]));
    expect(state.updates).toEqual(expect.arrayContaining([expect.objectContaining({ status: "in_review" })]));
  });

  it("sends the final decision notification only to the request employee", async () => {
    state.selectQueue = [
      [{ id: 12, companyId: 4, requestId: 52, approverRole: "hr", status: "pending" }],
      [{ id: 52, reference: "HR-52", type: "hr", employeeId: 7, status: "in_review" }],
    ];
    await decideApprovalTask({ id: 12, companyId: 4, actorId: 19, allowedRoles: ["hr"], decision: "approved", note: "مكتمل" });
    expect(state.inserts).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestId: 52, actorId: 19, nextStatus: "approved" }),
      expect.objectContaining({ companyId: 4, recipientUserId: 7, type: "request_decision", relatedRequestId: 52 }),
    ]));
    expect(state.inserts).not.toEqual(expect.arrayContaining([expect.objectContaining({ recipientUserId: 19, type: "request_decision" })]));
  });

  it("runs the complete created-request path: assigned manager, matching unit, then employee", async () => {
    const request = { id: 61, reference: "HR-61", type: "hr" as const, employeeId: 7, status: "submitted" as const };
    state.selectQueue = [
      [request],
      [{ managerUserId: 9 }],
      [request],
      [{ id: 21, companyId: 4, requestId: 61, approverRole: "manager" as const, status: "pending" as const }],
      [request],
      [{ id: 19 }],
      [{ id: 22, companyId: 4, requestId: 61, approverRole: "hr" as const, status: "pending" as const }],
      [{ ...request, status: "in_review" as const }],
    ];
    await createRequestWithHistory({ reference: "HR-61", type: "hr", category: "إجازة", subject: "طلب إجازة", details: "تفاصيل كافية", priority: "normal", employeeId: 7, companyId: 4 });
    await decideApprovalTask({ id: 21, companyId: 4, actorId: 9, allowedRoles: ["manager"], decision: "approved" });
    await decideApprovalTask({ id: 22, companyId: 4, actorId: 19, allowedRoles: ["hr"], decision: "approved" });
    const notificationBatches = state.inserts.filter(value => Array.isArray(value)).flat() as Array<{ recipientUserId: number; type: string }>;
    expect(notificationBatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ recipientUserId: 9, type: "approval_required" }),
      expect.objectContaining({ recipientUserId: 19, type: "approval_required" }),
    ]));
    expect(state.inserts).toEqual(expect.arrayContaining([expect.objectContaining({ recipientUserId: 7, type: "request_decision", relatedRequestId: 61 })]));
  });
});
