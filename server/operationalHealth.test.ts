import { describe, expect, it } from "vitest";

import { buildOperationalHealthSnapshot } from "./operationalHealth";

describe("operational health snapshot", () => {
  it("marks the system available when the database probe succeeds", () => {
    const snapshot = buildOperationalHealthSnapshot({ databaseReachable: true, checkedAt: new Date("2026-08-26T00:00:00.000Z") });
    expect(snapshot.overall).toBe("available");
    expect(snapshot.signals.find(signal => signal.id === "database")).toMatchObject({ state: "available" });
  });

  it("surfaces database probe failure without disclosing business data", () => {
    const snapshot = buildOperationalHealthSnapshot({ databaseReachable: false });
    expect(snapshot.overall).toBe("attention");
    expect(snapshot.signals.find(signal => signal.id === "database")?.detail).not.toMatch(/شركة|موظف|طلب/);
  });
});
