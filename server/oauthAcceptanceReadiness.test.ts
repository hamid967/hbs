import { describe, expect, it } from "vitest";
import { buildOAuthAcceptanceReadinessSnapshot } from "./oauthAcceptanceReadiness";

describe("OAuth acceptance readiness snapshot", () => {
  it("marks the workflow ready only when all aggregate prerequisites exist", () => {
    const snapshot = buildOAuthAcceptanceReadinessSnapshot({ activeEmployees: 1, activeManagers: 1, activeSpecialists: 2, linkedEmployeeManagers: 1 });
    expect(snapshot.overall).toBe("ready");
    expect(snapshot.checks.every(check => check.ready)).toBe(true);
  });

  it("identifies the missing prerequisite without exposing user identities", () => {
    const snapshot = buildOAuthAcceptanceReadinessSnapshot({ activeEmployees: 1, activeManagers: 1, activeSpecialists: 1, linkedEmployeeManagers: 0 });
    expect(snapshot.overall).toBe("waiting");
    expect(snapshot.checks.find(check => check.id === "relationship")).toMatchObject({ ready: false });
    expect(JSON.stringify(snapshot)).not.toContain("userId");
  });
});
