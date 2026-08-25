import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ completeCompanyOnboardingTask: vi.fn(), createCompanyJobCandidate: vi.fn(), createCompanyJobOpening: vi.fn(), createCompanyOnboardingTask: vi.fn(), listCompanyJobCandidates: vi.fn(), listCompanyJobOpenings: vi.fn(), listCompanyOnboardingTasks: vi.fn(), updateCompanyJobCandidate: vi.fn() }));
vi.mock("../db", () => dbMocks);

import { recruitmentRouter } from "./recruitment";
import type { TrpcContext } from "../_core/context";

function context(role: "user" | "hr" | "manager" | "admin" = "hr"): TrpcContext {
  return { user: { id: 8, openId: "recruitment-user", name: "Recruitment User", email: "hr@example.com", loginMethod: "oauth", companyId: 9, role, accountStatus: "active", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("recruitment router", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.listCompanyJobOpenings.mockResolvedValue([]); dbMocks.listCompanyJobCandidates.mockResolvedValue([]); dbMocks.listCompanyOnboardingTasks.mockResolvedValue([]); dbMocks.createCompanyJobOpening.mockResolvedValue({ id: 1, companyId: 9 }); dbMocks.createCompanyJobCandidate.mockResolvedValue({ id: 2, companyId: 9 }); dbMocks.createCompanyOnboardingTask.mockResolvedValue({ id: 3, companyId: 9 }); dbMocks.updateCompanyJobCandidate.mockResolvedValue({ id: 2, companyId: 9 }); dbMocks.completeCompanyOnboardingTask.mockResolvedValue({ id: 3, companyId: 9, status: "completed" }); });

  it("loads recruitment data only for the active company", async () => {
    const result = await recruitmentRouter.createCaller(context("hr")).overview();
    expect(result).toEqual({ openings: [], candidates: [], onboardingTasks: [] });
    expect(dbMocks.listCompanyJobOpenings).toHaveBeenCalledWith(9);
    expect(dbMocks.listCompanyJobCandidates).toHaveBeenCalledWith(9);
    expect(dbMocks.listCompanyOnboardingTasks).toHaveBeenCalledWith(9);
  });

  it("creates openings with the authenticated company and actor", async () => {
    await recruitmentRouter.createCaller(context("admin")).createOpening({ title: "أخصائي موارد بشرية", employmentType: "full_time", headcount: 1, status: "open" });
    expect(dbMocks.createCompanyJobOpening).toHaveBeenCalledWith(expect.objectContaining({ companyId: 9, createdByUserId: 8, title: "أخصائي موارد بشرية", status: "open" }));
  });

  it("prevents users and managers from accessing recruitment records", async () => {
    await expect(recruitmentRouter.createCaller(context("user")).overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(recruitmentRouter.createCaller(context("manager")).createCandidate({ openingId: 1, fullName: "مرشح تجريبي" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("routes onboarding completion through the authenticated company", async () => {
    await recruitmentRouter.createCaller(context("hr")).completeOnboardingTask({ taskId: 3 });
    expect(dbMocks.completeCompanyOnboardingTask).toHaveBeenCalledWith(9, 3);
  });
});
