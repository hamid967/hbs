export type SaudiComplianceItem = {
  id: string;
  title: string;
  focus: string;
  evidence: string;
  sourceId: "labor-law" | "national-platform" | "gosi";
};

export const saudiComplianceSources = {
  "labor-law": { label: "وزارة الموارد البشرية والتنمية الاجتماعية — نظام العمل", url: "https://www.hrsd.gov.sa/en/knowledge-centre/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84" },
  "national-platform": { label: "المنصة الوطنية — العمل والتوظيف", url: "https://my.gov.sa/en/content/employment" },
  "gosi": { label: "التأمينات الاجتماعية — نبذة عن النظام", url: "https://www.gosi.gov.sa/GOSIOnline/About_Portal&locale=en_US" },
} as const;

export const saudiComplianceChecklist: SaudiComplianceItem[] = [
  { id: "contracts", title: "عقود العمل وسجل الموظف", focus: "راجع أن العقود والبيانات الوظيفية والسياسات الداخلية توثق العلاقة الوظيفية بوضوح.", evidence: "نموذج عقد معتمد، سجل موظف مكتمل، وآلية مراجعة للتغييرات.", sourceId: "labor-law" },
  { id: "working-time", title: "ساعات العمل والراحة والإجازات", focus: "تحقق من أن سياسات الدوام والراحة والإجازات تتطلب مراجعة نظام العمل واللوائح المطبقة على المنشأة.", evidence: "سياسة دوام وإجازات، سجل حضور، ومسار موافقات موثق.", sourceId: "national-platform" },
  { id: "wages", title: "الأجور والاستحقاقات", focus: "تأكد من وجود مسؤولية واضحة لمراجعة آلية الأجور والاستحقاقات وأي خصومات قبل التشغيل.", evidence: "سياسة أجور، دورة اعتماد، وسجل مراجعة مالي مختص.", sourceId: "national-platform" },
  { id: "insurance", title: "التأمينات الاجتماعية", focus: "تأكد من أن الفريق المختص يراجع إجراءات التسجيل والتغطية والبيانات المرتبطة بالتأمينات الاجتماعية.", evidence: "مالك إجراء محدد، سجل مراجعة، وربط أو إجراء تشغيلي معتمد.", sourceId: "gosi" },
  { id: "safety", title: "السلامة والصحة المهنية", focus: "تحقق من وجود مسار لتقييم مخاطر العمل والإبلاغ عنها ومسؤولية تنفيذها بحسب طبيعة النشاط.", evidence: "سجل مخاطر، قناة إبلاغ، وخطة توعية أو تدريب عند الحاجة.", sourceId: "national-platform" },
  { id: "review", title: "المراجعة القانونية المحلية", focus: "لا تعتمد الخطة كمتوافقة نظامياً قبل مراجعة مستشار قانوني أو مختص امتثال محلي مؤهل.", evidence: "توثيق مراجعة المختص وتاريخها ونطاقها وأي استثناءات معتمدة.", sourceId: "labor-law" },
];

export function saudiComplianceReviewProgress(reviewedIds: string[]) {
  const reviewed = saudiComplianceChecklist.filter(item => reviewedIds.includes(item.id)).length;
  return { reviewed, total: saudiComplianceChecklist.length, remaining: saudiComplianceChecklist.length - reviewed, readyForHumanReview: reviewed === saudiComplianceChecklist.length };
}

export function resolveSaudiReviewedFromSearch(search: string) {
  const requested = new URLSearchParams(search).get("reviewed")?.split(",") ?? [];
  const permitted = new Set(saudiComplianceChecklist.map(item => item.id));
  return Array.from(new Set(requested.filter(id => permitted.has(id))));
}
