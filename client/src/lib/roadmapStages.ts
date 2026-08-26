export type RoadmapStatus = "completed" | "validation" | "partial" | "planned";

export type RoadmapStage = {
  number: number;
  title: string;
  detail: string;
  track: string;
  status: RoadmapStatus;
  dependency?: string;
};

export const roadmapStages: RoadmapStage[] = [
  { number: 1, title: "الحوكمة وفريق البرنامج", detail: "فريق واضح ومؤشرات نجاح وملاك قرار.", track: "الأساس", status: "completed" },
  { number: 2, title: "تحليل المرجع والتميّز", detail: "استخلاص مبادئ التحويل دون نسخ الهوية أو المحتوى.", track: "الأساس", status: "completed" },
  { number: 3, title: "شرائح المستخدمين", detail: "رحلات الموظف والمدير والعمليات.", track: "الأساس", status: "completed" },
  { number: 4, title: "تموضع المنتج", detail: "رسائل قيمة ومقاييس نمو قابلة للقياس.", track: "الأساس", status: "completed" },
  { number: 5, title: "بنية المعلومات", detail: "خريطة موحدة للموقع والمنتج.", track: "الأساس", status: "completed" },
  { number: 6, title: "نظام التصميم", detail: "مكونات عربية موحدة وقابلة لإعادة الاستخدام.", track: "التجربة", status: "completed" },
  { number: 7, title: "الموقع التسويقي", detail: "صفحة رئيسية ومسارات تعريف بالمنصة.", track: "التجربة", status: "completed" },
  { number: 8, title: "مسارات التحويل", detail: "طلب عرض والتقاط العملاء وإدارة المحتوى.", track: "التجربة", status: "completed" },
  { number: 9, title: "إدارة المؤسسة", detail: "الإعدادات الأساسية وهوية الإدارة الداخلية.", track: "المنصة", status: "completed" },
  { number: 10, title: "المصادقة والمؤسسات", detail: "تسجيل دخول آمن وعزل للمؤسسات.", track: "المنصة", status: "completed" },
  { number: 11, title: "الصلاحيات والتدقيق", detail: "أدوار دقيقة وسجل موحد لأحداث التوظيف والدوام والتدريب الجديدة.", track: "المنصة", status: "partial", dependency: "يتبقى توسيع السجل إلى الأحداث التاريخية ووحدات الإدارة الأخرى قبل الإطلاق النهائي." },
  { number: 12, title: "الهيكل والموظفون", detail: "هيكل تنظيمي وملفات موظفين وسجل دورة حياة داخلي غير وثائقي.", track: "HR Core", status: "completed" },
  { number: 13, title: "التوظيف والتهيئة", detail: "شواغر ومرشحون ومقابلات وعروض داخلية غير مالية وقوالب ومهام تهيئة منظمة داخل الشركة.", track: "HR Core", status: "partial", dependency: "تتبعها أتمتة تحويل المرشح المقبول إلى موظف بعد اعتماد نطاقها وسياسة المستندات." },
  { number: 14, title: "الخدمة الذاتية", detail: "كتالوج خدمات وطلبات موظفين متكامل.", track: "HR Core", status: "completed" },
  { number: 15, title: "الإجازات والدوامات", detail: "إجازات ودوام داخلي مرن وسياسات ساعات عمل وورديات وصفية داخل الشركة.", track: "HR Core", status: "partial", dependency: "أي تكامل خارجي للحضور أو أجهزة البصمة يتطلب قرار مزود وواجهة رسمية مستقلة." },
  { number: 16, title: "التعويضات والرواتب", detail: "بيانات استحقاقات وتجهيز للتكامل المالي.", track: "HR Core", status: "planned", dependency: "يتطلب قرار مزود الرواتب والنطاق المحاسبي." },
  { number: 17, title: "العلاقات الحكومية", detail: "معاملات ووثائق ومسارات متابعة.", track: "العمليات", status: "completed" },
  { number: 18, title: "الموافقات والتصعيد", detail: "محرك موافقات ومهام مشتركة.", track: "العمليات", status: "validation", dependency: "يلزم قبول حي بثلاث جلسات: موظف ومدير ووحدة مختصة." },
  { number: 19, title: "الوثائق والنماذج", detail: "مستندات ونماذج وتوقيع متدرج.", track: "العمليات", status: "planned", dependency: "يتطلب اعتماد سياسة المرفقات والتوقيع للإصدار التالي." },
  { number: 20, title: "صندوق العمل الموحد", detail: "صندوق موحد للإشعارات ومهام الموافقة وتعيينات التدريب الخاصة بالحساب.", track: "العمليات", status: "partial", dependency: "يتبقى توحيد الالتزامات التشغيلية الأخرى ضمن نموذج عمل مشترك." },
  { number: 21, title: "لوحات القياس", detail: "تحليلات تشغيلية وتجارية.", track: "البيانات", status: "completed" },
  { number: 22, title: "مساعد الذكاء", detail: "دعم للموظف وفريق العمليات.", track: "الذكاء", status: "completed" },
  { number: 23, title: "مولّد HR الذكي", detail: "خطط موارد بشرية وتوصيات مخصصة.", track: "الذكاء", status: "completed" },
  { number: 24, title: "المعرفة الذكية", detail: "بحث مؤسسي موجّه بالسياسات.", track: "الذكاء", status: "planned", dependency: "يتطلب مصادر معرفة مؤسسية مصنفة ومراجَعة." },
  { number: 25, title: "الأتمتة", detail: "تذكيرات وملخصات ومهام مقترحة.", track: "الذكاء", status: "planned", dependency: "يتطلب اعتماد أحداث التشغيل والسياسات الزمنية." },
  { number: 26, title: "التكاملات وAPI", detail: "ربط خدمات مؤسسية وإدارة المفاتيح.", track: "التوسع", status: "planned", dependency: "يتطلب تحديد الأنظمة الخارجية وبيانات الاعتماد." },
  { number: 27, title: "الهاتف والإتاحة", detail: "تجربة متجاوبة مع تركيز مرئي ودعم الحركة المختزلة.", track: "التوسع", status: "partial", dependency: "يتبقى تدقيق إتاحة شامل وتحديد نطاق PWA." },
  { number: 28, title: "الأمن والموثوقية", detail: "أداء وخصوصية وأمن واختبارات تحمّل.", track: "الاستعداد", status: "validation", dependency: "يتطلب فحوص قبول تشغيلية قبل الإطلاق النهائي." },
  { number: 29, title: "القبول والتدريب", detail: "اختبار قبول وتجهيز تدريب وإطلاق.", track: "الاستعداد", status: "validation", dependency: "يتطلب جلسات OAuth حية لأدوار القبول الثلاثة." },
  { number: 30, title: "الإطلاق والتحسين", detail: "قياس النتائج والتحسين المستمر.", track: "الاستعداد", status: "partial", dependency: "النشر متاح؛ الإغلاق يعتمد على اجتياز مراحل القبول السابقة." },
];

export const roadmapStatusMeta: Record<RoadmapStatus, { label: string; className: string }> = {
  completed: { label: "مكتملة", className: "bg-[#e6f4e8] text-[#347950]" },
  validation: { label: "بانتظار تحقق حي", className: "bg-[#fff1de] text-[#a46723]" },
  partial: { label: "منفذة جزئياً", className: "bg-[#e9eef8] text-[#446b98]" },
  planned: { label: "مخططة", className: "bg-[#f1f2f1] text-[#66736a]" },
};

export type OperationalBatch = {
  title: string;
  summary: string;
  checkpointId: string;
  verified: boolean;
  testCount: number;
  scope: string;
};

export const operationalBatches: OperationalBatch[] = [
  { title: "توسعة ATS", summary: "مقابلات وعروض داخلية وقوالب تهيئة.", checkpointId: "d7ea1e69", verified: true, testCount: 107, scope: "HR Core" },
  { title: "دورة حياة الموظف", summary: "سجل أحداث داخلي غير وثائقي.", checkpointId: "72ed9ce7", verified: true, testCount: 109, scope: "HR Core" },
  { title: "سياسات الدوام", summary: "ساعات وورديات وصفية وتعيينات مقيدة.", checkpointId: "b6673a12", verified: true, testCount: 111, scope: "HR Core" },
  { title: "التدريب الداخلي", summary: "مسارات تعلم وتعيينات داخل الشركة.", checkpointId: "57729040", verified: true, testCount: 112, scope: "HR Core" },
];

export function summarizeRoadmap(stages: readonly RoadmapStage[] = roadmapStages) {
  return stages.reduce<Record<RoadmapStatus, number>>((summary, stage) => {
    summary[stage.status] += 1;
    return summary;
  }, { completed: 0, validation: 0, partial: 0, planned: 0 });
}
