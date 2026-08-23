import { describe, expect, it } from "vitest";
import { buildMvpMetrics, calculateMonthlyMetric } from "./db";

describe("calculateMonthlyMetric", () => {
  it("calculates the delta and percentage change against a nonzero previous month", () => {
    expect(calculateMonthlyMetric(15, 10)).toEqual({ current: 15, previous: 10, delta: 5, percentChange: 50 });
    expect(calculateMonthlyMetric(6, 12)).toEqual({ current: 6, previous: 12, delta: -6, percentChange: -50 });
  });

  it("does not manufacture a percentage when the previous month had no data", () => {
    expect(calculateMonthlyMetric(4, 0)).toEqual({ current: 4, previous: 0, delta: 4, percentChange: null });
  });

  it("builds the correct current-versus-previous calendar-month totals from source records", () => {
    const now = new Date("2026-08-23T12:00:00.000Z");
    const metrics = buildMvpMetrics({
      requests: [{ status: "submitted", priority: "normal", createdAt: new Date("2026-08-04T08:00:00.000Z") }, { status: "completed", priority: "normal", createdAt: new Date("2026-08-10T08:00:00.000Z") }, { status: "submitted", priority: "urgent", createdAt: new Date("2026-07-18T08:00:00.000Z") }],
      demos: [{ status: "new", createdAt: new Date("2026-08-11T08:00:00.000Z") }, { status: "new", createdAt: new Date("2026-07-05T08:00:00.000Z") }, { status: "qualified", createdAt: new Date("2026-07-20T08:00:00.000Z") }],
      plans: [{ createdAt: new Date("2026-08-09T08:00:00.000Z") }, { createdAt: new Date("2026-08-15T08:00:00.000Z") }],
    }, now);

    expect(metrics.monthly).toMatchObject({
      currentMonth: "2026-08", previousMonth: "2026-07",
      requests: { current: 2, previous: 1, delta: 1, percentChange: 100 },
      demos: { current: 1, previous: 2, delta: -1, percentChange: -50 },
      hrPlans: { current: 2, previous: 0, delta: 2, percentChange: null },
    });
  });
});
