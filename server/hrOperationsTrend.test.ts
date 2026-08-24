import { describe, expect, it } from "vitest";
import { buildHrOperationsTrend } from "./db";
describe("HR operations trend", () => { it("builds a bounded monthly series from authorized data", () => { const trend = buildHrOperationsTrend({ leaves: [{ startDate: "2026-07-10", endDate: "2026-07-11" }], expenses: [{ amountSar: "1250", createdAt: new Date("2026-08-02T00:00:00Z") }] }, new Date("2026-08-20T00:00:00Z"), 2); expect(trend).toEqual([{ month: "2026-07", leaveDays: 2, expensesSar: 0 }, { month: "2026-08", leaveDays: 0, expensesSar: 1250 }]); }); });
