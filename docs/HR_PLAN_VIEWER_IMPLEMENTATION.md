/**
 * دليل دمج مكونات عرض خطة الموارد البشرية المحسّنة
 * 
 * يجب إضافة المكونات التالية إلى ملف HrSystemDesigner.tsx:
 */

// 1. استيراد المكونات الجديدة:
import {
  AssumptionsPanel,
  ExecutionDecisionsPanel,
  First90DaysPanel,
  KeyMetricsPanel,
  RisksPanel,
  CustomizationScore,
} from "@/components/HrPlanViewer";

// 2. في دالة PlanDisplay، استبدل الجزء الذي يعرض metrics و risks بما يلي:

/* OLD CODE:
<div className="grid gap-4 md:grid-cols-2">
  <ListPanel icon={Target} title="مقاييس المتابعة" items={content.metrics} tone="green" />
  <ListPanel icon={AlertTriangle} title="مخاطر ونقاط انتباه" items={content.risks} tone="amber" />
</div>
*/

/* NEW CODE (جزء من عرض PlanDisplay): */
<div className="space-y-7 p-6">
  {/* عرض درجة التخصيص */}
  <CustomizationScore
    context={{
      businessActivity: plan.businessActivity,
      companySize: plan.companySize,
      workModel: plan.workModel || undefined,
      geographicFootprint: plan.geographicFootprint || undefined,
      growthHorizon: plan.growthHorizon || undefined,
    }}
  />

  {/* الأقسام الأساسية الموجودة بالفعل */}
  <InfoSection icon={Lightbulb} title="لماذا هذه التوصيات؟" text={content.personalizationRationale} />
  <InfoSection icon={Target} title="نموذج التشغيل" text={content.operatingModel} />

  {/* NEW: عرض الافتراضات المستنبطة */}
  <AssumptionsPanel assumptions={content.assumptions} />

  {/* الأدوار والمسؤوليات (موجود بالفعل) */}
  <section>
    <SectionTitle icon={UsersRound} title="الأدوار والمسؤوليات المقترحة" />
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      {/* ... محتوى الأدوار الموجود بالفعل ... */}
    </div>
  </section>

  {/* NEW: قرارات التنفيذ مع تمييز الأساسية */}
  <ExecutionDecisionsPanel decisions={content.executionDecisions} />

  {/* NEW: خطة 90 يوم المحسّنة */}
  <First90DaysPanel first90Days={content.first90Days} />

  {/* NEW: مقاييس الأداء مع الأهداف */}
  <KeyMetricsPanel keyMetrics={content.keyMetrics} />

  {/* NEW: المخاطر والنقاط المهمة */}
  <RisksPanel risks={content.risks} />
</div>

/**
 * ملاحظات تطبيق مهمة:
 * 
 * 1. المكونات الجديدة تتعامل بأمان مع المصفوفات الفارغة
 *    - لن تعرض شيء إذا كانت البيانات فارغة
 * 
 * 2. أنماط التصميم:
 *    - استخدام classes من design-system (ds-* tokens)
 *    - ألوان متسقة مع العلامة التجارية
 *    - responsive grids لـ mobile و desktop
 * 
 * 3. الأيقونات:
 *    - مستوردة من lucide-react
 *    - متسقة مع الأسلوب الموجود
 * 
 * 4. ترتيب العرض الموصى به:
 *    ✓ درجة التخصيص (في الأعلى - يوضح جودة التحليل)
 *    ✓ الملخص التنفيذي والنموذج التشغيلي
 *    ✓ الافتراضات (توضح التفكير وراء التوصيات)
 *    ✓ الأدوار والمسؤوليات
 *    ✓ قرارات التنفيذ (مع فصل الأساسية والإضافية)
 *    ✓ خطة 90 يوم (التسلسل الزمني)
 *    ✓ مقاييس الأداء (قياس النجاح)
 *    ✓ المخاطر (المراقبة المستمرة)
 * 
 * 5. التوافق مع البيانات القديمة:
 *    - parsePlan() يحافظ على التوافقية العكسية
 *    - البيانات القديمة تُعامَل مع قيم افتراضية آمنة
 *    - المكونات لن تتعطل إذا كانت البيانات ناقصة
 */
