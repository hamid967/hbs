import { describe, expect, it } from "vitest";
import { nextApprovalRoleForRequest } from "./db";

describe("approval routing", () => {
  it("routes an approved direct-manager HR request to the HR unit", () => {
    expect(nextApprovalRoleForRequest("hr")).toBe("hr");
  });

  it("routes an approved direct-manager government request to the government unit", () => {
    expect(nextApprovalRoleForRequest("government")).toBe("government");
  });
});
