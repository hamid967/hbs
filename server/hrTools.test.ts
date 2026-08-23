import { describe, expect, it } from "vitest";
import { buildReadinessPriorities, resolveHrToolFromSearch, serviceGuideRoutes } from "../shared/hrTools";

describe("HR tools", () => {
  it("creates priorities based on company size, team structure, and operating challenge", () => {
    const priorities = buildReadinessPriorities({ size: "small", structure: "distributed", challenge: "growth" });
    expect(priorities).toHaveLength(3);
    expect(priorities.join(" ")).toContain("كتالوج خدمات");
    expect(priorities.join(" ")).toContain("أكثر من موقع");
    expect(priorities.join(" ")).toContain("تخطيط القوى العاملة");
  });

  it("routes every service need to a valid in-product destination", () => {
    expect(serviceGuideRoutes.employee.path).toBe("/assistant");
    expect(serviceGuideRoutes.government.path).toBe("/requests/new");
    expect(serviceGuideRoutes.manager.path).toBe("/operations");
    expect(serviceGuideRoutes.planning.path).toBe("/hr-system");
  });

  it("opens only known tools from an explicit deep-link query", () => {
    expect(resolveHrToolFromSearch("?tool=readiness")).toBe("readiness");
    expect(resolveHrToolFromSearch("?tool=unknown")).toBeNull();
  });
});
