import { describe, expect, it } from "vitest";
import { resolveSaudiReviewedFromSearch, saudiComplianceChecklist, saudiComplianceReviewProgress, saudiComplianceSources } from "../shared/saudiCompliance";

describe("Saudi compliance guidance", () => {
  it("provides a unique, source-backed checklist for human review", () => {
    const ids = saudiComplianceChecklist.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    saudiComplianceChecklist.forEach(item => expect(saudiComplianceSources[item.sourceId].url).toMatch(/^https:\/\//));
  });

  it("reports progress without declaring legal compliance", () => {
    expect(saudiComplianceReviewProgress(["contracts", "wages"])).toMatchObject({ reviewed: 2, total: 6, remaining: 4, readyForHumanReview: false });
    expect(saudiComplianceReviewProgress(saudiComplianceChecklist.map(item => item.id))).toMatchObject({ readyForHumanReview: true });
  });

  it("accepts only known review items from a linked review state", () => {
    expect(resolveSaudiReviewedFromSearch("?reviewed=contracts,wages,unknown,contracts")).toEqual(["contracts", "wages"]);
  });
});
