import { describe, expect, it } from "vitest";
import { buildHrOperationsReport } from "./db";

describe("buildHrOperationsReport", () => {
  it("aggregates leave days and SAR expenses with safe monthly comparison", () => {
    const report = buildHrOperationsReport({
      leaves: [
        { leaveType: "annual", startDate: "2026-08-10", endDate: "2026-08-12" },
        { leaveType: "sick", startDate: "2026-07-20", endDate: "2026-07-20" },
      ],
      expenses: [
        { expenseType: "travel", amountSar: "250", createdAt: new Date("2026-08-18T00:00:00Z") },
        { expenseType: "operating", amountSar: "100", createdAt: new Date("2026-07-15T00:00:00Z") },
      ],
    }, new Date("2026-08-24T00:00:00Z"));

    expect(report.leaveDays.current).toBe(3);
    expect(report.leaveDays.previous).toBe(1);
    expect(report.leaveDays.byType).toEqual({ annual: 3 });
    expect(report.expensesSar.current).toBe(250);
    expect(report.expensesSar.previous).toBe(100);
    expect(report.expensesSar.percentChange).toBe(150);
  });
});
