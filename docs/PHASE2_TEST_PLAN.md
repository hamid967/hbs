/**
 * خطة اختبار مولّد HR الذكي - المرحلة الثانية
 * 
 * يغطي هذا الملف جميع السيناريوهات الضرورية لاختبار التحسينات المطبقة
 */

export const testCases = {
  // ================================================
  // المجموعة 1: اختبار Backend (LLM & Schema)
  // ================================================
  
  "1.1 - اختبار استخراج الافتراضات": {
    description: "التحقق من استخراج LLM للافتراضات الصحيحة من سياق الشركة",
    input: {
      businessActivity: "شركة تقنية ناشئة توفر حلولاً برمجية للمتاجر الإلكترونية",
      companySize: "11–50 موظفاً",
      workModel: "هجين",
      geographicFootprint: "مدينة واحدة",
      growthHorizon: "نمو معتدل خلال 12 شهراً",
      peopleChallenges: "نقص الكفاءات التقنية، بدء الحوكمة",
    },
    expectedOutput: {
      assumptions: [
        "يوجد هيكل تنظيمي أولي محدود",
        "الفريق الحالي ملتزم ويمكن تطويره",
        "المرونة سمة إيجابية في المرحلة الحالية",
        // ... افتراضات إضافية محددة من السياق
      ],
    },
    assertion: "assumptions.length >= 2 && all(assumptions).length > 15",
  },

  "1.2 - اختبار قرارات التنفيذ المحددة": {
    description: "التحقق من أن القرارات ملموسة وليست عامة",
    input: {
      businessActivity: "شركة خدمات استشارية",
      companySize: "51–200 موظف",
      peopleChallenges: "عدم وضوح المسارات الوظيفية",
    },
    expectedOutput: {
      executionDecisions: [
        {
          decision: "تعريف نموذج المسارات الوظيفية",
          recommendation: "إنشاء 3 مسارات: تقني، قيادي، متخصص",
          whyNow: "توضيح الآفاق سيقلل الرغبة في الترك",
          isEssential: true,
        },
        // ... قرارات إضافية
      ],
    },
    assertion: "all(decisions).recommendation.length > 20 && all(decisions).whyNow.length > 15",
  },

  "1.3 - اختبار خطة 90 يوم المحسّنة": {
    description: "التحقق من هيكلة الأيام الـ 90 مع phase و owner",
    input: {
      businessActivity: "شركة تصنيع",
      companySize: "201–500 موظف",
    },
    expectedOutput: {
      first90Days: [
        {
          period: "اليوم 1–30",
          phase: "التشخيص والتخطيط",
          objective: "فهم الوضع الحالي ووضع استراتيجية",
          actions: ["مقابلة المدراء", "مراجعة السياسات الحالية", "تحديد الفجوات"],
          owner: "مدير HR",
        },
        {
          period: "اليوم 31–60",
          phase: "البناء والتطبيق",
          objective: "تطبيق التحسينات الأولى",
          actions: ["تطوير السياسات", "تدريب المدراء"],
          owner: "فريق HR + مدراء الأقسام",
        },
        {
          period: "اليوم 61–90",
          phase: "المراقبة والتحسين",
          objective: "التقييم والتحسينات النهائية",
          actions: ["قياس الأثر", "تعديل العمليات"],
          owner: "مدير HR + الإدارة",
        },
      ],
    },
    assertion: "first90Days.length === 3 && all(phases).owner && all(phases).phase",
  },

  "1.4 - اختبار مقاييس الأداء المقترحة": {
    description: "التحقق من أن المقاييس لها baseline و targets محددة",
    input: {
      businessActivity: "شركة تسويق رقمي",
      companySize: "11–50 موظفاً",
    },
    expectedOutput: {
      keyMetrics: [
        {
          metric: "معدل الاحتفاظ بالموظفين",
          baseline: "معدل ترك حالي غير محدد",
          target30Days: "تحديد المعدل الحالي",
          target90Days: "زيادة بـ 5% على الأقل",
        },
        {
          metric: "درجة التزام الموظفين",
          baseline: "غير معروف حالياً",
          target30Days: "إجراء مسح ضد",
          target90Days: "تحسن بـ 20% على الأقل",
        },
        // ... مقاييس إضافية
      ],
    },
    assertion: "all(metrics).baseline && (metrics.target30Days OR metrics.target90Days)",
  },

  // ================================================
  // المجموعة 2: اختبار Frontend (Components)
  // ================================================

  "2.1 - اختبار CustomizationScore": {
    description: "حساب درجة التخصيص بناءً على عدد الحقول المملوءة",
    input: {
      businessActivity: "شركة موجودة",
      companySize: "موجود",
      workModel: "موجود",
      geographicFootprint: null,
      growthHorizon: null,
    },
    expectedOutput: {
      score: 60, // 3 من 5 = 60%
      color: "ds-brand-600",
      message: "أضف تفاصيل أكثر للحصول على توصيات أدق",
    },
    assertion: "score === Math.round((3/5)*100) && score >= 60 && score < 80",
  },

  "2.2 - اختبار AssumptionsPanel": {
    description: "عرض الافتراضات المستنبطة بشكل صحيح",
    input: {
      assumptions: [
        "الفريق الحالي ملتزم",
        "الشركة لديها ميزانية معقولة",
      ],
    },
    expectedRender: {
      elements: ["✓ الفريق الحالي ملتزم", "✓ الشركة لديها ميزانية معقولة"],
      icon: "Lightbulb",
      title: "الافتراضات المستنبطة من السياق",
    },
    assertion: "component renders all assumptions with checkmarks",
  },

  "2.3 - اختبار ExecutionDecisionsPanel": {
    description: "فصل القرارات الأساسية عن التحسينات",
    input: {
      decisions: [
        {
          decision: "إنشاء سياسة الموارد البشرية",
          recommendation: "توثيق شاملة",
          whyNow: "تحسين الوضوح",
          isEssential: true,
        },
        {
          decision: "برنامج تطوير الموظفين",
          recommendation: "تدريب سنوي",
          whyNow: "تحسين المهارات",
          isEssential: false,
        },
      ],
    },
    expectedRender: {
      sections: ["قرارات أساسية (يجب البدء بها الآن)", "تحسينات لاحقة (بعد أول 90 يوم)"],
      essential_count: 1,
      enhancement_count: 1,
    },
    assertion: "essential decisions have red border, enhancements have yellow",
  },

  "2.4 - اختبار First90DaysPanel": {
    description: "عرض خطة 90 يوم في ثلاث مراحل",
    input: {
      first90Days: [
        {
          period: "اليوم 1–30",
          phase: "التشخيص",
          objective: "فهم الوضع",
          actions: ["مقابلات", "تحليل"],
          owner: "مدير HR",
        },
        // ... مراحل إضافية
      ],
    },
    expectedRender: {
      gridCols: 3,
      cards: [
        { title: "اليوم 1–30", owner: "مدير HR" },
        { title: "اليوم 31–60" },
        { title: "اليوم 61–90" },
      ],
    },
    assertion: "component renders 3 cards in md:grid-cols-3 layout",
  },

  "2.5 - اختبار KeyMetricsPanel": {
    description: "عرض مقاييس مع baseline و targets",
    input: {
      keyMetrics: [
        {
          metric: "معدل الاحتفاظ",
          baseline: "70%",
          target30Days: "75%",
          target90Days: "80%",
        },
      ],
    },
    expectedRender: {
      sections: [
        { label: "الوضع الحالي", value: "70%" },
        { label: "هدف 30 يوم", value: "75%" },
        { label: "هدف 90 يوم", value: "80%" },
      ],
    },
    assertion: "metrics display 3-column grid with baseline and targets",
  },

  // ================================================
  // المجموعة 3: اختبار التوافقية (Compatibility)
  // ================================================

  "3.1 - اختبار البيانات القديمة": {
    description: "التحقق من أن البيانات القديمة تُعامل بأمان",
    input: {
      generatedContent: JSON.stringify({
        executiveSummary: "خطة قديمة",
        operatingModel: "موجود",
        personalizationRationale: "موجود",
        // بدون assumptions, keyMetrics, إلخ
      }),
    },
    expectedOutput: {
      assumptions: [], // قيمة افتراضية آمنة
      keyMetrics: [], // قيمة افتراضية آمنة
      first90Days: [], // قيمة افتراضية آمنة
    },
    assertion: "parsePlan() doesn't crash and returns safe defaults",
  },

  "3.2 - اختبار التكامل": {
    description: "التحقق من أن جميع المكونات تعمل معاً",
    input: {
      planData: "خطة كاملة من LLM",
      businessActivity: "شركة تقنية",
      companySize: "50 موظف",
    },
    expectedBehavior: {
      flow: [
        "عرض درجة التخصيص",
        "عرض الافتراضات",
        "عرض القرارات (أساسي + تحسينات)",
        "عرض خطة 90 يوم",
        "عرض المقاييس",
        "عرض المخاطر",
      ],
    },
    assertion: "all components render in correct order without errors",
  },

  // ================================================
  // المجموعة 4: اختبار السيناريوهات الطرفية
  // ================================================

  "4.1 - اختبار البيانات الفارغة": {
    description: "التحقق من معالجة الحقول الفارغة بأمان",
    input: {
      assumptions: [],
      keyMetrics: [],
      executionDecisions: [],
    },
    expectedBehavior: "components render nothing (return null) when data is empty",
    assertion: "AssumptionsPanel renders null when assumptions.length === 0",
  },

  "4.2 - اختبار النصوص الطويلة": {
    description: "التحقق من التعامل مع النصوص الطويلة بدون كسر التصميم",
    input: {
      assumptions: [
        "افتراض طويل جداً جداً جداً ... " + "x".repeat(200),
      ],
    },
    expectedBehavior: "text wraps correctly without breaking layout",
    assertion: "component uses text-wrapping classes correctly",
  },

  "4.3 - اختبار الأحرف العربية": {
    description: "التحقق من صحة عرض النصوص العربية (RTL)",
    input: {
      assumptions: ["افتراض عربي مع أحرف خاصة: ـــــ", "رسائل نصية عربية"],
    },
    expectedRender: "text appears correctly with proper RTL direction",
    assertion: "text renders with dir='rtl' correctly",
  },

  // ================================================
  // المجموعة 5: اختبار الأداء (Performance)
  // ================================================

  "5.1 - اختبار عدد العناصر الكبير": {
    description: "اختبار الأداء مع 100+ عنصر",
    input: {
      assumptions: Array(100).fill("افتراض تكراري"),
      actions: Array(100).fill("إجراء تكراري"),
    },
    expectedBehavior: "components still render smoothly",
    assertion: "render time < 1 second",
  },

  // ================================================
  // المجموعة 6: اختبار التصميم (Design)
  // ================================================

  "6.1 - اختبار على Desktop": {
    description: "التحقق من عرض صحيح على شاشات 1920x1080",
    viewport: { width: 1920, height: 1080 },
    expectedLayout: {
      First90DaysPanel: "3 columns grid (md:grid-cols-3)",
      KeyMetricsPanel: "responsive grid",
      ExecutionDecisionsPanel: "2 sections side by side",
    },
    assertion: "all elements render correctly on desktop",
  },

  "6.2 - اختبار على Mobile": {
    description: "التحقق من عرض صحيح على شاشات 375x667",
    viewport: { width: 375, height: 667 },
    expectedLayout: {
      First90DaysPanel: "1 column stack",
      KeyMetricsPanel: "responsive grid",
      ExecutionDecisionsPanel: "stacked sections",
    },
    assertion: "all elements render correctly on mobile",
  },

  "6.3 - اختبار الألوان": {
    description: "التحقق من صحة استخدام ألوان الـ design-system",
    assertions: {
      "CustomizationScore": "uses ds-success/ds-brand/ds-warning correctly",
      "AssumptionsPanel": "uses ds-brand-50/ds-brand-600",
      "ExecutionDecisionsPanel": "uses ds-danger for essential, ds-warning for enhancements",
      "First90DaysPanel": "uses ds-brand-200/ds-brand-50",
      "KeyMetricsPanel": "uses ds-success-soft",
    },
  },

  // ================================================
  // المجموعة 7: اختبار التفاعلات (Interactions)
  // ================================================

  "7.1 - اختبار Hover States": {
    description: "التحقق من تأثيرات hover على البطاقات",
    expectedBehavior: {
      metric_cards: "border color changes on hover",
      decision_cards: "shadow increases on hover",
    },
  },

  "7.2 - اختبار Copy to Clipboard": {
    description: "اختبار نسخ المحتوى إلى الحافظة (إن أمكن)",
    expectedBehavior: "clicking copy button copies metric value",
  },
};

// ================================================
// سيناريوهات الاختبار النهائية (E2E)
// ================================================

export const e2eScenarios = [
  {
    name: "سيناريو 1: شركة ناشئة صغيرة",
    steps: [
      "ملء نموذج مع: 10 موظفين، تقنية، عن بُعد، مدينة واحدة",
      "اضغط 'إنشاء خطة'",
      "انتظر النتائج",
      "تحقق من وجود 6 افتراضات على الأقل",
      "تحقق من وجود 5+ قرارات تنفيذية",
      "تحقق من وجود خطة 90 يوم مفصلة",
      "تحقق من وجود 5+ مقاييس",
    ],
  },
  {
    name: "سيناريو 2: شركة متوسطة نامية",
    steps: [
      "ملء نموذج مع: 100 موظف، خدمات، هجين، عدة مدن",
      "اضغط 'إنشاء خطة'",
      "تحقق من توازن بين القرارات الأساسية والتحسينات",
      "تحقق من وجود مسؤول واضح لكل مرحلة",
      "تحقق من أن المقاييس ملموسة وليست عامة",
    ],
  },
  {
    name: "سيناريو 3: اختبار Mobile",
    steps: [
      "افتح الموقع على iPhone (375px width)",
      "ملء النموذج",
      "تحقق من أن جميع الأقسام تظهر بشكل صحيح",
      "تحقق من أن الجداول تُعاد ترتيبها للشاشات الضيقة",
      "تحقق من قابلية القراءة",
    ],
  },
];

// ================================================
// أمثلة على التوقعات
// ================================================

export const expectedLLMOutputExample = {
  assumptions: [
    "الشركة لديها بنية تنظيمية أساسية لكن بحاجة توثيق",
    "فريق التطوير هو المحرك الرئيسي للشركة",
    "الموارد البشرية حالياً لا تتمتع بسلطة استراتيجية",
    "هناك مقاومة محتملة للتغيير من الإدارة القديمة",
  ],
  executionDecisions: [
    {
      decision: "إنشاء إطار عمل سياسات الموارد البشرية",
      recommendation: "وثّق 10 سياسات أساسية: التوظيف، الأداء، الإجازات، إلخ",
      whyNow: "بدون سياسات واضحة، لن تستطيع تطبيق تحسينات لاحقة",
      isEssential: true,
    },
  ],
  first90Days: [
    {
      period: "اليوم 1–30",
      phase: "التشخيص والتخطيط",
      objective: "فهم الوضع الحالي ووضع خطة العمل",
      actions: [
        "مقابلات مع الإدارة والقيادات",
        "مراجعة السياسات الحالية والعقود",
        "تقييم رضا الموظفين (مسح سريع)",
      ],
      owner: "مدير HR (بالتعاون مع المدير العام)",
    },
  ],
  keyMetrics: [
    {
      metric: "سياسات موثقة وموافق عليها",
      baseline: "0 سياسة موثقة حالياً",
      target30Days: "5 سياسات نهائية",
      target90Days: "10 سياسات كاملة ومطبقة",
    },
  ],
};
