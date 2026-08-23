export type CompanySize = "small" | "medium" | "large";
export type TeamStructure = "central" | "distributed";
export type HrChallenge = "growth" | "visibility" | "consistency";
export type HrToolId = "readiness" | "guide" | "plan";

export function resolveHrToolFromSearch(search: string): HrToolId | null {
  const tool = new URLSearchParams(search).get("tool");
  return tool === "readiness" || tool === "guide" || tool === "plan" ? tool : null;
}

export function buildReadinessPriorities(input: { size: CompanySize; structure: TeamStructure; challenge: HrChallenge }) {
  const priorities = [
    input.size === "small" ? "ابدأ بكتالوج خدمات مبسط وسجل طلبات موحّد قبل إضافة عمليات متقدمة." : "أنشئ مالكي عمليات وصلاحيات مراجعة واضحة لكل خدمة رئيسية.",
    input.structure === "distributed" ? "وحّد قواعد التواصل والتوثيق لأن الفريق يعمل في أكثر من موقع أو نمط عمل." : "ثبّت مساراً واضحاً بين الموظف والمدير والفريق التشغيلي لكل طلب.",
  ];
  priorities.push(input.challenge === "growth" ? "اجعل التهيئة وتخطيط القوى العاملة أولوية أولى مع نمو الفريق." : input.challenge === "visibility" ? "ابدأ بلوحة مؤشرات لحالة الطلبات ووقت المتابعة قبل توسيع التقارير." : "استخدم مصمم نظام HR لتحويل السياق إلى خطة تنفيذ خلال 90 يوماً.");
  return priorities;
}

export const serviceGuideRoutes = {
  employee: { title: "طلب موارد بشرية", desc: "أنسب بداية هي تقديم طلب منظم أو استخدام مساعد الطلبات لصياغته.", path: "/assistant" },
  government: { title: "معاملة علاقات حكومية", desc: "يمكنك بدء الطلب من المسار المنظم وتحديد العلاقات الحكومية في النموذج.", path: "/requests/new" },
  manager: { title: "مراجعة أو متابعة", desc: "انتقل إلى مركز العمليات للاطلاع على الطلبات المصرح بها ومتابعتها.", path: "/operations" },
  planning: { title: "خطة موارد بشرية", desc: "استخدم مصمم نظام HR لإنشاء خطة مرتبطة بنشاط الشركة وحجمها.", path: "/hr-system" },
} as const;
