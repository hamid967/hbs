import { describe, expect, it } from "vitest";
import { canAccessResource } from "../shared/moduleAccess";

describe("resource access policy", () => {
  it("allows directory access only to the existing directory roles", () => {
    expect(canAccessResource("admin", "employee_directory")).toBe(true);
    expect(canAccessResource("manager", "employee_directory")).toBe(true);
    expect(canAccessResource("hr", "employee_directory")).toBe(true);
    expect(canAccessResource("government", "employee_directory")).toBe(false);
    expect(canAccessResource("user", "employee_directory")).toBe(false);
  });

  it("keeps lifecycle access restricted to HR and platform administration", () => {
    expect(canAccessResource("admin", "employee_lifecycle")).toBe(true);
    expect(canAccessResource("hr", "employee_lifecycle")).toBe(true);
    expect(canAccessResource("manager", "employee_lifecycle")).toBe(false);
    expect(canAccessResource("government", "employee_lifecycle")).toBe(false);
  });
});
