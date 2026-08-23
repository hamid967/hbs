import { describe, expect, it } from "vitest";
import { formatMonthlyPercentChange, monthlyComparisonHint } from "./monthlyComparison";

describe("monthly comparison display helpers", () => {
  it("formats ordinary percentage changes with their direction", () => {
    expect(formatMonthlyPercentChange(25)).toBe("+25%");
    expect(formatMonthlyPercentChange(-50)).toBe("-50%");
  });

  it("uses a clear no-history message when a percentage is unavailable", () => {
    expect(formatMonthlyPercentChange(null)).toBe("لا تتوفر نسبة");
    expect(monthlyComparisonHint(null)).toContain("الشهر السابق");
  });
});
