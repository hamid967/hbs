import { describe, expect, it } from "vitest";
import { calculateLeaveBalance, countInclusiveLeaveDays, dateRangesOverlap, getLeaveRequestYear } from "./leavePolicy";

describe("leave policy rules", () => {
  it("counts calendar days inclusively", () => {
    expect(countInclusiveLeaveDays("2026-09-01", "2026-09-03")).toBe(3);
  });

  it("rejects an invalid date order and cross-year request", () => {
    expect(() => countInclusiveLeaveDays("2026-09-03", "2026-09-01")).toThrow("نطاق تاريخ الإجازة غير صالح");
    expect(() => getLeaveRequestYear("2026-12-31", "2027-01-01")).toThrow("سنة تقويمية واحدة");
  });

  it("identifies touching date ranges as overlapping", () => {
    expect(dateRangesOverlap("2026-09-03", "2026-09-05", "2026-09-05", "2026-09-07")).toBe(true);
    expect(dateRangesOverlap("2026-09-03", "2026-09-04", "2026-09-05", "2026-09-07")).toBe(false);
  });

  it("subtracts approved and pending days without exposing a negative remainder", () => {
    expect(calculateLeaveBalance({ allocatedDays: 10, approvedDays: 3, pendingDays: 2 })).toEqual({ allocatedDays: 10, approvedDays: 3, pendingDays: 2, remainingDays: 5 });
    expect(calculateLeaveBalance({ allocatedDays: 2, approvedDays: 3, pendingDays: 1 }).remainingDays).toBe(0);
  });
});
