import { describe, expect, it } from "vitest";
import { assertReportsAccess, reportDateFromMonth } from "./db";

describe("reports access policy", () => {
  it("uses company scope for admin and HR but direct-team scope for a manager", () => {
    expect(assertReportsAccess("admin")).toBe("company");
    expect(assertReportsAccess("hr")).toBe("company");
    expect(assertReportsAccess("manager")).toBe("team");
  });
  it("rejects roles that do not have report access", () => {
    expect(() => assertReportsAccess("user")).toThrow("لا تملك صلاحية");
    expect(() => assertReportsAccess("government")).toThrow("لا تملك صلاحية");
  });
  it("parses an explicit report month at UTC month start", () => {
    expect(reportDateFromMonth("2026-08").toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });
});
