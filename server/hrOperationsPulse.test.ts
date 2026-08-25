import { describe, expect, it } from "vitest";
import { buildOperationsPulse } from "./db";

describe("buildOperationsPulse", () => {
  it("returns only safe aggregate request and approval states", () => {
    const pulse = buildOperationsPulse({
      requests: [{ status: "submitted" }, { status: "in_review" }, { status: "approved" }, { status: "completed" }, { status: "rejected" }],
      tasks: [{ status: "pending" }, { status: "pending" }, { status: "approved" }, { status: "rejected" }],
    });
    expect(pulse).toEqual({
      requests: { submitted: 1, inReview: 1, completed: 2 },
      approvals: { pending: 2, approved: 1, rejected: 1 },
    });
  });
});
