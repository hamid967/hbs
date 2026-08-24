import { describe, expect, it } from "vitest";
import { approvalNotificationAudience, approvalTransitionPlan, nextApprovalRoleForRequest } from "./db";

describe("approval routing", () => {
  it("routes an approved direct-manager HR request to the HR unit", () => {
    expect(nextApprovalRoleForRequest("hr")).toBe("hr");
  });

  it("routes an approved direct-manager government request to the government unit", () => {
    expect(nextApprovalRoleForRequest("government")).toBe("government");
  });

  it("notifies only the matching unit after a direct-manager approval", () => {
    expect(approvalNotificationAudience({ stageRole: "manager", decision: "approved", requestType: "hr" })).toEqual({ recipient: "unit", role: "hr", type: "approval_required" });
    expect(approvalNotificationAudience({ stageRole: "manager", decision: "approved", requestType: "government" })).toEqual({ recipient: "unit", role: "government", type: "approval_required" });
  });

  it("notifies the employee after a final unit decision or a manager rejection", () => {
    expect(approvalNotificationAudience({ stageRole: "hr", decision: "approved", requestType: "hr" })).toEqual({ recipient: "employee", type: "request_decision" });
    expect(approvalNotificationAudience({ stageRole: "manager", decision: "rejected", requestType: "government" })).toEqual({ recipient: "employee", type: "request_decision" });
  });

  it("plans the manager-to-unit transition with a company-scoped task, status, history, and notification", () => {
    expect(approvalTransitionPlan({ stageRole: "manager", decision: "approved", requestType: "hr", companyId: 8, requestId: 41, employeeId: 6 })).toEqual({ nextTask: { companyId: 8, requestId: 41, approverRole: "hr" }, requestStatus: "in_review", historyStatus: "in_review", notification: { recipient: "unit", role: "hr", type: "approval_required" } });
  });

  it("plans the final unit decision with an employee-only notification", () => {
    expect(approvalTransitionPlan({ stageRole: "hr", decision: "approved", requestType: "hr", companyId: 8, requestId: 41, employeeId: 6 })).toEqual({ nextTask: null, requestStatus: "approved", historyStatus: "approved", notification: { recipient: "employee", employeeId: 6, type: "request_decision" } });
  });
});
