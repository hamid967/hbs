export type DataInventoryCategory = "identity" | "employment" | "workflow" | "document" | "operational";

export type DataInventoryDomain = {
  id: string;
  title: string;
  category: DataInventoryCategory;
  owner: string;
  accessSummary: string;
  retentionState: "policy_pending";
  scope: string;
};

const inventory: DataInventoryDomain[] = [
  { id: "accounts", title: "الحسابات والصلاحيات", category: "identity", owner: "مسؤول المنصة", accessSummary: "المسؤول فقط لإدارة الحسابات؛ المستخدم يرى حسابه", retentionState: "policy_pending", scope: "هوية الدخول، الحالة، الدور، والوحدات المخولة" },
  { id: "employees", title: "ملفات الموظفين", category: "employment", owner: "الموارد البشرية", accessSummary: "HR والمسؤول؛ المدير ضمن مرؤوسيه المباشرين عند الحاجة", retentionState: "policy_pending", scope: "ملف الموظف، المدير، القسم، والمسمى المنظم" },
  { id: "dependents", title: "التابعون وجهات الطوارئ", category: "identity", owner: "الموارد البشرية", accessSummary: "HR والمسؤول فقط", retentionState: "policy_pending", scope: "سجلات عائلية وتشغيلية داخلية محدودة" },
  { id: "requests", title: "الطلبات والموافقات", category: "workflow", owner: "مالك الوحدة المختصة", accessSummary: "الموظف ومالكه المباشر والوحدة المطابقة وفق المرحلة", retentionState: "policy_pending", scope: "الطلبات، المراحل، القرارات، والإشعارات المرتبطة" },
  { id: "contracts", title: "العقود والوثائق", category: "document", owner: "الموارد البشرية", accessSummary: "HR والمسؤول فقط", retentionState: "policy_pending", scope: "بيانات وصفية وإصدارات تشغيلية وروابط ملفات محكومة" },
  { id: "leave", title: "سياسات الإجازة والأرصدة", category: "employment", owner: "الموارد البشرية", accessSummary: "HR والمسؤول؛ الموظف يرى رصيده فقط", retentionState: "policy_pending", scope: "السياسات والتخصيصات وطلبات الإجازة" },
  { id: "assets", title: "العهد والأجهزة", category: "employment", owner: "الموارد البشرية", accessSummary: "HR والمسؤول فقط", retentionState: "policy_pending", scope: "سجل العهدة والحالة والتعيين التشغيلي" },
  { id: "offboarding", title: "إنهاء الخدمة ومقابلات الخروج", category: "employment", owner: "الموارد البشرية", accessSummary: "HR والمسؤول فقط", retentionState: "policy_pending", scope: "قائمة الإنهاء وملاحظات مقابلة خروج داخلية" },
  { id: "recruitment", title: "التوظيف والتهيئة", category: "workflow", owner: "الموارد البشرية", accessSummary: "HR والمسؤول", retentionState: "policy_pending", scope: "المرشحون والمقابلات والعروض وقوائم التهيئة" },
  { id: "goals", title: "الأهداف والتدريب", category: "employment", owner: "الموارد البشرية", accessSummary: "HR والمسؤول؛ المدير ضمن تقاريره المباشرة", retentionState: "policy_pending", scope: "الأهداف والتقدم ومسارات التدريب" },
  { id: "audit", title: "سجل التدقيق والصحة التشغيلية", category: "operational", owner: "مسؤول المنصة", accessSummary: "المسؤول فقط", retentionState: "policy_pending", scope: "أحداث تشغيلية موجزة ومصدر البناء وإشارات الصحة" },
];

export function buildDataInventorySnapshot() {
  return {
    generatedAt: new Date(),
    policyNotice: "هذا جرد تقني داخلي وليس سياسة احتفاظ معتمدة أو إعلان امتثال.",
    domains: inventory,
  };
}
