import { describe, expect, it } from "vitest";
import { advanceSimulation, simulationStages } from "../shared/approvalSimulation";

describe("approval simulation", () => {
  it("keeps the direct manager ahead of the specialist", () => {
    expect(advanceSimulation("draft", "hr")).toBe("manager");
    expect(advanceSimulation("manager", "hr")).toBe("specialist");
    expect(advanceSimulation("specialist", "hr")).toBe("completed");
  });
  it("routes the simulated specialist label by request type", () => {
    expect(simulationStages("government", "specialist")[2].label).toContain("العلاقات الحكومية");
    expect(simulationStages("hr", "specialist")[2].label).toContain("الموارد البشرية");
  });
});
