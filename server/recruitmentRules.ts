export const candidateStatuses = ["applied", "screening", "interview", "offer", "accepted", "rejected", "withdrawn"] as const;
export type CandidateStatus = typeof candidateStatuses[number];

export const interviewStatuses = ["scheduled", "completed", "cancelled"] as const;
export type InterviewStatus = typeof interviewStatuses[number];

export const offerStatuses = ["draft", "issued", "accepted", "declined", "withdrawn"] as const;
export type OfferStatus = typeof offerStatuses[number];

const candidateTransitions: Record<CandidateStatus, readonly CandidateStatus[]> = {
  applied: ["screening", "interview", "rejected", "withdrawn"],
  screening: ["interview", "rejected", "withdrawn"],
  interview: ["offer", "rejected", "withdrawn"],
  offer: ["accepted", "rejected", "withdrawn"],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

const interviewTransitions: Record<InterviewStatus, readonly InterviewStatus[]> = {
  scheduled: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const offerTransitions: Record<OfferStatus, readonly OfferStatus[]> = {
  draft: ["issued", "withdrawn"],
  issued: ["accepted", "declined", "withdrawn"],
  accepted: [],
  declined: [],
  withdrawn: [],
};

export function isCandidateStatusTransitionAllowed(current: CandidateStatus, next: CandidateStatus) {
  return current === next || candidateTransitions[current].includes(next);
}

export function isInterviewStatusTransitionAllowed(current: InterviewStatus, next: InterviewStatus) {
  return current === next || interviewTransitions[current].includes(next);
}

export function isOfferStatusTransitionAllowed(current: OfferStatus, next: OfferStatus) {
  return current === next || offerTransitions[current].includes(next);
}
