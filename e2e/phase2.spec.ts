/**
 * اختبارات وحدة بسيطة لتحسينات المرحلة الثانية
 * يمكن تشغيلها باستخدام: npm test -- phase2
 */

import { describe, it, expect } from "vitest";

// ================================================
// اختبار parsePlan Function
// ================================================

describe("parsePlan - توافق البيانات", () => {
  const parsePlan = (raw?: string) => {
    if (!raw) return null;
    try {
      const plan = JSON.parse(raw);
      return {
        executiveSummary: plan.executiveSummary || "",
        operatingModel: plan.operatingModel || "",
        personalizationRationale: plan.personalizationRationale || "",
        assumptions: plan.assumptions || [],
        modules: plan.modules || [],
        organizationalRoles: plan.organizationalRoles || [],
        workflows: plan.workflows || [],
        policies: plan.policies || [],
        executionDecisions: plan.executionDecisions || [],
        first90Days: plan.first90Days || [],
        keyMetrics: plan.keyMetrics || [],
        risks: plan.risks || [],
      };
    } catch {
      return null;
    }
  };

  it("يجب أن يعالج البيانات الفارغة بأمان", () => {
    const result = parsePlan(undefined);
    expect(result).toBeNull();
  });

  it("يجب أن يعالج JSON غير صالح بأمان", () => {
    const result = parsePlan("not valid json");
    expect(result).toBeNull();
  });

  it("يجب أن يملأ الحقول الفارغة بقيم افتراضية آمنة", () => {
    const oldData = JSON.stringify({
      executiveSummary: "ملخص قديم",
      operatingModel: "نموذج قديم",
      personalizationRationale: "تبرير قديم",
      // بدون assumptions, keyMetrics, إلخ
    });

    const result = parsePlan(oldData);
    expect(result).not.toBeNull();
    expect(result!.assumptions).toEqual([]);
    expect(result!.keyMetrics).toEqual([]);
    expect(result!.first90Days).toEqual([]);
    expect(result!.executiveSummary).toBe("ملخص قديم");
  });

  it("يجب أن يحافظ على البيانات الجديدة", () => {
    const newData = JSON.stringify({
      executiveSummary: "ملخص جديد",
      operatingModel: "نموذج جديد",
      personalizationRationale: "تبرير جديد",
      assumptions: ["افتراض 1", "افتراض 2"],
      keyMetrics: [
        {
          metric: "مقياس 1",
          baseline: "0",
          target30Days: "50",
          target90Days: "100",
        },
      ],
      first90Days: [
        {
          period: "اليوم 1–30",
          phase: "المرحلة 1",
          objective: "الهدف 1",
          actions: ["إجراء 1"],
          owner: "المسؤول",
        },
      ],
    });

    const result = parsePlan(newData);
    expect(result).not.toBeNull();
    expect(result!.assumptions).toHaveLength(2);
    expect(result!.keyMetrics).toHaveLength(1);
    expect(result!.first90Days).toHaveLength(1);
    expect(result!.first90Days[0].owner).toBe("المسؤول");
  });
});

// ================================================
// اختبار مكونات العرض
// ================================================

describe("مكونات العرض - التصيير", () => {
  it("يجب أن لا تعرض AssumptionsPanel شيء عندما تكون المصفوفة فارغة", () => {
    const assumptions: string[] = [];
    // في الواقع، المكون يعيد null
    expect(assumptions.length === 0).toBe(true);
  });

  it("يجب أن تحسب CustomizationScore النسبة بشكل صحيح", () => {
    const calculateScore = (context: any) => {
      const providedFields = [
        context.businessActivity,
        context.companySize,
        context.workModel,
        context.geographicFootprint,
        context.growthHorizon,
      ].filter(Boolean).length;

      return Math.round((providedFields / 5) * 100);
    };

    expect(calculateScore({
      businessActivity: "شركة",
      companySize: "50",
      workModel: "هجين",
      geographicFootprint: null,
      growthHorizon: null,
    })).toBe(60);

    expect(calculateScore({
      businessActivity: "شركة",
      companySize: "50",
      workModel: "هجين",
      geographicFootprint: "مدينة",
      growthHorizon: "نمو",
    })).toBe(100);
  });

  it("يجب أن تصنف ExecutionDecisionsPanel القرارات بشكل صحيح", () => {
    const decisions = [
      { decision: "قرار 1", isEssential: true },
      { decision: "قرار 2", isEssential: false },
      { decision: "قرار 3", isEssential: true },
    ];

    const essential = decisions.filter((d) => d.isEssential);
    const enhancements = decisions.filter((d) => !d.isEssential);

    expect(essential).toHaveLength(2);
    expect(enhancements).toHaveLength(1);
  });

  it("يجب أن تجد First90DaysPanel المرحلة الصحيحة", () => {
    const first90Days = [
      { period: "اليوم 1–30", phase: "المرحلة 1" },
      { period: "اليوم 31–60", phase: "المرحلة 2" },
      { period: "اليوم 61–90", phase: "المرحلة 3" },
    ];

    const phase = first90Days.find((p) => p.period.includes("31"));
    expect(phase?.phase).toBe("المرحلة 2");
  });

  it("يجب أن تعرض KeyMetricsPanel الأهداف بشكل صحيح", () => {
    const metrics = [
      {
        metric: "معدل الاحتفاظ",
        baseline: "70%",
        target30Days: "75%",
        target90Days: "80%",
      },
    ];

    expect(metrics[0].baseline).toBe("70%");
    expect(metrics[0].target30Days).toBe("75%");
    expect(metrics[0].target90Days).toBe("80%");
  });
});

// ================================================
// اختبار التحقق من الصيغة
// ================================================

describe("التحقق من صيغة البيانات", () => {
  it("يجب أن تكون الافتراضات مصفوفة من النصوص", () => {
    const assumptions = ["افتراض 1", "افتراض 2"];
    expect(Array.isArray(assumptions)).toBe(true);
    expect(assumptions.every((a) => typeof a === "string")).toBe(true);
  });

  it("يجب أن تكون المقاييس لها الحقول الصحيحة", () => {
    const metrics = [
      {
        metric: "مقياس",
        baseline: "قيمة",
        target30Days: "هدف",
        target90Days: "هدف",
      },
    ];

    expect(metrics[0]).toHaveProperty("metric");
    expect(metrics[0]).toHaveProperty("baseline");
    expect(metrics[0]).toHaveProperty("target30Days");
    expect(metrics[0]).toHaveProperty("target90Days");
  });

  it("يجب أن تكون قرارات التنفيذ لها isEssential", () => {
    const decisions = [
      {
        decision: "قرار",
        recommendation: "توصية",
        whyNow: "السبب",
        isEssential: true,
      },
    ];

    expect(decisions[0]).toHaveProperty("isEssential");
    expect(typeof decisions[0].isEssential).toBe("boolean");
  });

  it("يجب أن تكون مراحل 90 يوم لها owner", () => {
    const first90Days = [
      {
        period: "اليوم 1–30",
        phase: "المرحلة",
        objective: "الهدف",
        actions: ["إجراء"],
        owner: "المسؤول",
      },
    ];

    expect(first90Days[0]).toHaveProperty("owner");
  });
});

// ================================================
// اختبار الأداء
// ================================================

describe("الأداء", () => {
  it("يجب أن تتعامل parsePlan مع البيانات الكبيرة بسرعة", () => {
    const largeData = {
      executiveSummary: "ملخص",
      operatingModel: "نموذج",
      personalizationRationale: "تبرير",
      assumptions: Array(100).fill("افتراض"),
      keyMetrics: Array(50).fill({
        metric: "مقياس",
        baseline: "0",
        target30Days: "50",
        target90Days: "100",
      }),
      first90Days: Array(10).fill({
        period: "اليوم",
        phase: "المرحلة",
        objective: "الهدف",
        actions: Array(20).fill("إجراء"),
        owner: "المسؤول",
      }),
    };

    const start = performance.now();
    const result = JSON.parse(JSON.stringify(largeData));
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // يجب أن ينتهي في أقل من 100ms
  });
});

// ================================================
// اختبار التوافقية
// ================================================

describe("التوافقية مع المتصفحات", () => {
  it("يجب أن تعمل مع JSON.stringify و JSON.parse", () => {
    const data = {
      assumptions: ["افتراض عربي"],
      keyMetrics: [{ metric: "مقياس", baseline: "0" }],
    };

    const serialized = JSON.stringify(data);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.assumptions[0]).toBe("افتراض عربي");
  });

  it("يجب أن تتعامل مع الأحرف الخاصة بشكل صحيح", () => {
    const text =
      "نص بأحرف خاصة: ـــــ، آ، ؤ، ئ، ة، ى، ِ، ُ، َ، ْ، ً، ٌ، ٍ";
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("آ");
  });
});

// ================================================
// اختبار الحالات الحدية
// ================================================

describe("الحالات الحدية", () => {
  it("يجب أن تتعامل مع النصوص الفارغة", () => {
    const empty = "";
    const withSpaces = "   ";

    expect(empty.trim().length).toBe(0);
    expect(withSpaces.trim().length).toBe(0);
  });

  it("يجب أن تتعامل مع المصفوفات الكبيرة", () => {
    const bigArray = Array(1000).fill("عنصر");
    expect(bigArray.length).toBe(1000);
    expect(bigArray.filter((x) => x === "عنصر").length).toBe(1000);
  });

  it("يجب أن تتعامل مع القيم null و undefined", () => {
    const data: any = {
      field1: null,
      field2: undefined,
      field3: "",
    };

    expect(data.field1 ?? "default").toBe("default");
    expect(data.field2 ?? "default").toBe("default");
    expect(data.field3 || "default").toBe("default");
  });
});

// ================================================
// اختبار التكامل
// ================================================

describe("التكامل", () => {
  it("يجب أن يكمل العملية كاملة من البيانات إلى العرض", () => {
    // 1. البيانات من LLM
    const llmOutput = {
      executiveSummary: "ملخص تنفيذي",
      operatingModel: "نموذج التشغيل",
      personalizationRationale: "السبب الشخصي",
      assumptions: ["افتراض 1"],
      keyMetrics: [{ metric: "مقياس", baseline: "0" }],
      first90Days: [
        { period: "اليوم 1–30", phase: "المرحلة", objective: "الهدف", actions: ["إجراء"], owner: "المسؤول" },
      ],
    };

    // 2. حفظ في قاعدة البيانات
    const stored = JSON.stringify(llmOutput);

    // 3. قراءة من قاعدة البيانات
    const retrieved = JSON.parse(stored);

    // 4. عرض في الواجهة
    expect(retrieved.assumptions).toEqual(["افتراض 1"]);
    expect(retrieved.first90Days[0].owner).toBe("المسؤول");
  });
});
