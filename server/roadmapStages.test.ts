import { describe, expect, it } from "vitest";
import { roadmapStages, summarizeRoadmap } from "../client/src/lib/roadmapStages";

describe("خارطة المراحل الثلاثين", () => {
  it("تعرض ثلاثين مرحلة بحالة قابلة للمراجعة لكل مرحلة", () => {
    expect(roadmapStages).toHaveLength(30);
    expect(roadmapStages.map(stage => stage.number)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    expect(roadmapStages.every(stage => Boolean(stage.title) && Boolean(stage.status))).toBe(true);
  });

  it("تميز مراحل القبول الحي عن المراحل المكتملة", () => {
    const summary = summarizeRoadmap();
    expect(summary).toEqual({ completed: 16, validation: 3, partial: 6, planned: 5 });
    expect(roadmapStages.find(stage => stage.number === 18)?.status).toBe("validation");
    expect(roadmapStages.find(stage => stage.number === 29)?.dependency).toContain("OAuth");
  });
});
