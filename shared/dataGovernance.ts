export const dataRetentionDomains = ["accounts", "employees", "dependents", "requests", "contracts", "leave", "assets", "offboarding", "recruitment", "goals", "audit"] as const;

export type DataRetentionDomain = (typeof dataRetentionDomains)[number];

export const dataRetentionDomainLabels: Record<DataRetentionDomain, string> = {
  accounts: "الحسابات والصلاحيات",
  employees: "ملفات الموظفين",
  dependents: "التابعون وجهات الطوارئ",
  requests: "الطلبات والموافقات",
  contracts: "العقود والوثائق",
  leave: "الإجازات والأرصدة",
  assets: "العهد والأجهزة",
  offboarding: "إنهاء الخدمة ومقابلات الخروج",
  recruitment: "التوظيف والتهيئة",
  goals: "الأهداف والتدريب",
  audit: "سجل التدقيق والصحة التشغيلية",
};
