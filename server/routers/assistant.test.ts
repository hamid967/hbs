import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({
  appendChatMessage: vi.fn(),
  createChatSession: vi.fn(),
  createHrSystemPlan: vi.fn(),
  createRequestWithHistory: vi.fn(),
  getChatMessages: vi.fn(),
  getChatSessionForUser: vi.fn(),
  getHrSystemPlan: vi.fn(),
  getHrSystemPlans: vi.fn(),
  getOpenChatSession: vi.fn(),
  markChatConverted: vi.fn(),
  updateChatDraft: vi.fn(),
}));
const llmMocks = vi.hoisted(() => ({ invokeLLM: vi.fn() }));

vi.mock("../db", () => dbMocks);
vi.mock("../_core/llm", () => llmMocks);

import { assistantRouter } from "./assistant";

function context(): TrpcContext {
  return {
    user: { id: 10, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validPlan = {
  executiveSummary: "مخطط عملي مبني على حجم الشركة ونشاطها.",
  operatingModel: "مسؤول موارد بشرية داخلي مع دعم تشغيلي من المدراء.",
  personalizationRationale: "تم تقديم الأولويات لأن الشركة التقنية في مرحلة نمو وتحتاج إلى توحيد الأساسيات أولاً.",
  modules: [{ name: "ملفات الموظفين", purpose: "توحيد البيانات", priority: "أساسي" }, { name: "الإجازات", purpose: "إدارة الاستحقاقات", priority: "مهم" }, { name: "التطوير", purpose: "رفع المهارات", priority: "متقدم" }],
  organizationalRoles: [{ role: "مسؤول الموارد البشرية", responsibility: "إدارة البيانات والسياسات", timing: "فوراً" }, { role: "المدير المباشر", responsibility: "اعتماد الطلبات والتغذية الراجعة", timing: "خلال 30 يوماً" }, { role: "القيادة التنفيذية", responsibility: "اعتماد المقاييس", timing: "خلال 60 يوماً" }],
  workflows: [{ name: "التوظيف", outcome: "تعيين منظم", owner: "الموارد البشرية" }, { name: "التهيئة", outcome: "اندماج الموظف", owner: "المدير المباشر" }, { name: "مراجعة الأداء", outcome: "تغذية راجعة", owner: "الإدارة" }],
  policies: [{ name: "الإجازات", intent: "توضيح الاستحقاقات" }, { name: "السلوك المهني", intent: "تنظيم بيئة العمل" }, { name: "البيانات", intent: "حماية المعلومات" }],
  executionDecisions: [{ decision: "توحيد ملفات الموظفين", recommendation: "ابدأ بقاعدة بيانات موحدة", whyNow: "لدعم النمو" }, { decision: "إطلاق التهيئة", recommendation: "اعتماد قائمة تهيئة", whyNow: "لتقليل وقت الاندماج" }, { decision: "تحديد مقاييس الموارد البشرية", recommendation: "مراجعة شهرية", whyNow: "لإتاحة القرار المبني على بيانات" }],
  first90Days: [{ period: "الأيام 1–30", objective: "تجميع الأساسيات", actions: ["توحيد ملفات الموظفين"] }, { period: "الأيام 31–60", objective: "تشغيل التدفقات", actions: ["إطلاق طلبات الإجازة"] }, { period: "الأيام 61–90", objective: "قياس التحسن", actions: ["مراجعة مؤشرات الأداء"] }],
  implementationPhases: [{ phase: "التأسيس", timeline: "0–30 يوماً", actions: ["جمع البيانات"] }, { phase: "التشغيل", timeline: "31–90 يوماً", actions: ["إطلاق العمليات"] }],
  metrics: ["اكتمال الملفات", "زمن التوظيف", "رضا الموظفين"],
  risks: ["مراجعة المتطلبات المحلية", "تحديد الملاك التشغيليين"],
};

describe("assistant router", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.getOpenChatSession.mockResolvedValue({ id: 7, employeeId: 10, status: "open" });
    dbMocks.getChatSessionForUser.mockResolvedValue({ id: 7, employeeId: 10, status: "open", draftType: "hr", draftCategory: "إجازة", draftSubject: "طلب إجازة", draftDetails: "إجازة سنوية لمدة خمسة أيام.", draftPriority: "normal" });
    dbMocks.getChatMessages.mockResolvedValue([]);
  });

  it("organizes a chat message into a saved request draft", async () => {
    llmMocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ reply: "أحتاج تاريخ بداية الإجازة.", draft: { type: "hr", category: "إجازة", subject: "طلب إجازة", details: "يرغب الموظف في إجازة سنوية.", priority: "normal" } }) } }] });
    const caller = assistantRouter.createCaller(context());
    const result = await caller.chat({ message: "أرغب في تقديم طلب إجازة سنوية" });
    expect(result.reply).toContain("تاريخ");
    expect(dbMocks.updateChatDraft).toHaveBeenCalledWith(7, expect.objectContaining({ type: "hr", category: "إجازة" }));
  });

  it("does not convert a conversation before its draft is complete", async () => {
    dbMocks.getChatSessionForUser.mockResolvedValue({ id: 7, employeeId: 10, status: "open", draftType: "hr", draftCategory: null, draftSubject: null, draftDetails: null, draftPriority: null });
    const caller = assistantRouter.createCaller(context());
    await expect(caller.convertToRequest({ sessionId: 7 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.createRequestWithHistory).not.toHaveBeenCalled();
  });

  it("generates and stores a structured HR system plan", async () => {
    llmMocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify(validPlan) } }] });
    dbMocks.createHrSystemPlan.mockResolvedValue({ id: 30, businessActivity: "تقنية", companySize: "11–50 موظفاً" });
    const caller = assistantRouter.createCaller(context());
    await expect(caller.hrSystem.generate({ businessActivity: "شركة تقنية", companySize: "11–50 موظفاً", workModel: "هجين", geographicFootprint: "عدة مدن داخل الدولة", growthHorizon: "نمو معتدل خلال 12 شهراً", peopleChallenges: "توحيد العمليات" })).resolves.toMatchObject({ id: 30 });
    expect(dbMocks.createHrSystemPlan).toHaveBeenCalledWith(expect.objectContaining({ employeeId: 10, businessActivity: "شركة تقنية", companySize: "11–50 موظفاً", workModel: "هجين", geographicFootprint: "عدة مدن داخل الدولة", growthHorizon: "نمو معتدل خلال 12 شهراً", peopleChallenges: "توحيد العمليات" }));
    const savedPayload = dbMocks.createHrSystemPlan.mock.calls[0]?.[0] as { generatedContent: string };
    expect(JSON.parse(savedPayload.generatedContent)).toMatchObject({ personalizationRationale: expect.any(String), organizationalRoles: expect.any(Array), executionDecisions: expect.any(Array), first90Days: expect.any(Array) });
  });

  it("lists and retrieves saved plans only through the current employee context", async () => {
    const savedPlan = { id: 44, employeeId: 10, businessActivity: "شركة تقنية", companySize: "11–50 موظفاً", workModel: "هجين", geographicFootprint: "عدة مدن", growthHorizon: "نمو معتدل", peopleChallenges: "توحيد العمليات", generatedContent: JSON.stringify(validPlan) };
    dbMocks.getHrSystemPlans.mockResolvedValue([savedPlan]);
    dbMocks.getHrSystemPlan.mockResolvedValue(savedPlan);
    const caller = assistantRouter.createCaller(context());
    await expect(caller.hrSystem.list()).resolves.toEqual([savedPlan]);
    await expect(caller.hrSystem.get({ id: 44 })).resolves.toEqual(savedPlan);
    expect(dbMocks.getHrSystemPlans).toHaveBeenCalledWith(10);
    expect(dbMocks.getHrSystemPlan).toHaveBeenCalledWith(44, 10);
  });
});
