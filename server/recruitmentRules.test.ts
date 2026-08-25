import { describe, expect, it } from "vitest";
import { isCandidateStatusTransitionAllowed, isInterviewStatusTransitionAllowed, isOfferStatusTransitionAllowed } from "./recruitmentRules";

describe("قواعد انتقالات ATS", () => {
  it("يسمح بتدرج المرشح ويرفض القفز أو الرجوع من الحالة النهائية", () => {
    expect(isCandidateStatusTransitionAllowed("applied", "screening")).toBe(true);
    expect(isCandidateStatusTransitionAllowed("screening", "interview")).toBe(true);
    expect(isCandidateStatusTransitionAllowed("interview", "offer")).toBe(true);
    expect(isCandidateStatusTransitionAllowed("offer", "accepted")).toBe(true);
    expect(isCandidateStatusTransitionAllowed("applied", "accepted")).toBe(false);
    expect(isCandidateStatusTransitionAllowed("accepted", "offer")).toBe(false);
  });

  it("يمنع إعادة فتح مقابلة أو عرض انتهت حالتهما", () => {
    expect(isInterviewStatusTransitionAllowed("scheduled", "completed")).toBe(true);
    expect(isInterviewStatusTransitionAllowed("completed", "scheduled")).toBe(false);
    expect(isOfferStatusTransitionAllowed("draft", "issued")).toBe(true);
    expect(isOfferStatusTransitionAllowed("issued", "accepted")).toBe(true);
    expect(isOfferStatusTransitionAllowed("draft", "accepted")).toBe(false);
    expect(isOfferStatusTransitionAllowed("accepted", "issued")).toBe(false);
  });
});
