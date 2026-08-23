import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({ getMvpMetrics: vi.fn() }));
const llmMocks = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("../db", () => dbMocks);
vi.mock("../_core/llm", () => llmMocks);

import { mvpAnalyticsRouter } from "./mvpAnalytics";

const emptyMetrics = { requests: { total: 0, open: 0, urgent: 0, completed: 0, inReview: 0, submitted: 0, rejected: 0, last30Days: 0 }, demos: { total: 0, new: 0, contacted: 0, qualified: 0, closed: 0, last30Days: 0 }, hrPlans: { total: 0, last30Days: 0 } };
function context(role: "user" | "manager" | "admin" = "admin"): TrpcContext { return { user: { id: 7, openId: "analytics-user", name: "Analytics User", email: "analytics@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("mvp analytics router", () => {
  it("rejects users without analytics access", async () => {
    const caller = mvpAnalyticsRouter.createCaller(context("user"));
    await expect(caller.metrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns a safe fallback without invoking AI when there is no operational data", async () => {
    dbMocks.getMvpMetrics.mockResolvedValue(emptyMetrics);
    const result = await mvpAnalyticsRouter.createCaller(context()).analyze();
    expect(result.analysis.dataSufficiency).toBe("محدود");
    expect(llmMocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("turns real aggregate metrics into a validated structured analysis", async () => {
    const metrics = { requests: { total: 9, open: 4, urgent: 2, completed: 3, inReview: 2, submitted: 2, rejected: 0, last30Days: 6 }, demos: { total: 5, new: 2, contacted: 2, qualified: 1, closed: 0, last30Days: 4 }, hrPlans: { total: 3, last30Days: 2 } };
    dbMocks.getMvpMetrics.mockResolvedValue(metrics);
    llmMocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ summary: "الطابور تحت المتابعة مع وجود طلبات تحتاج إلى مالك.", positiveSignals: ["هناك خطط HR مولدة حديثاً"], attentionSignals: [{ level: "متوسط", title: "طلبات مفتوحة", detail: "أربع طلبات ما زالت مفتوحة" }], recommendations: [{ priority: "الآن", action: "تعيين مالك للطلبات المفتوحة", rationale: "لتقليل وقت المتابعة" }], dataSufficiency: "كافٍ" }) } }] });
    const result = await mvpAnalyticsRouter.createCaller(context()).analyze();
    expect(result.metrics).toEqual(metrics);
    expect(result.analysis.recommendations[0]?.priority).toBe("الآن");
    expect(llmMocks.invokeLLM).toHaveBeenCalledTimes(1);
  });
});
