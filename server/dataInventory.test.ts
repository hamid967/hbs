import { describe, expect, it } from "vitest";
import { buildDataInventorySnapshot } from "./dataInventory";

describe("data inventory snapshot", () => {
  it("returns metadata only with no employee or request values", () => {
    const snapshot = buildDataInventorySnapshot();
    expect(snapshot.domains.length).toBeGreaterThan(8);
    expect(snapshot.domains.every(domain => domain.retentionState === "policy_pending")).toBe(true);
    expect(JSON.stringify(snapshot)).not.toContain("employeeId");
    expect(JSON.stringify(snapshot)).not.toContain("requestId");
  });
});
