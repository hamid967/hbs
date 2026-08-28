import DashboardLayout from "@/components/DashboardLayout";
import { directExecutionStages, operationalBatches, roadmapStages, roadmapStatusMeta, summarizeRoadmap } from "@/lib/roadmapStages";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, Bot, BrainCircuit, CheckCircle2, CircleDashed, Clock3, Code2, Compass, Database, Gauge, History, Layers3, LockKeyhole, Palette, Play, Rocket, RotateCcw, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const team = [
  { icon: Compass, role: "قيادة البرنامج والمنتج", focus: "الاتجاه، الأولويات، المؤشرات، وإدارة المخاطر." },
  { icon: UsersRound, role: "أبحاث وتجربة المستخدم", focus: "الشرائح والرحلات واختبارات قابلية الاستخدام." },
  { icon: Palette, role: "التصميم والهوية", focus: "النظام البصري والمكونات وتجربة اللغة العربية." },
  { icon: Code2, role: "هندسة المنصة", focus: "Full-Stack، قاعدة البيانات، والعقود البرمجية." },
  { icon: BrainCircuit, role: "هندسة الذكاء الاصطناعي", focus: "المساعد والتوصيات والمعرفة الذكية." },
  { icon: Database, role: "هندسة التكاملات", focus: "API، الملفات، التنبيهات والخدمات المؤسسية." },
  { icon: ShieldCheck, role: "الجودة والأمن", focus: "الاختبارات والأداء والخصوصية وسجل التدقيق." },
  { icon: Gauge, role: "النمو ونجاح العميل", focus: "التحويل والتبنّي والتدريب والتحسين المستمر." },
];

const trackColors: Record<string, string> = {
  "الأساس": "bg-ds-success-soft text-ds-brand-600", "التجربة": "bg-ds-warning-soft text-ds-warning", "المنصة": "bg-ds-info-soft text-ds-info", "HR Core": "bg-ds-info-soft text-ds-violet", "العمليات": "bg-ds-brand-50 text-ds-teal-700", "البيانات": "bg-ds-info-soft text-ds-violet", "الذكاء": "bg-ds-success-soft text-ds-brand-600", "التوسع": "bg-ds-danger-soft text-ds-danger", "الاستعداد": "bg-ds-neutral-100 text-ds-neutral-700",
};

function StatusIcon({ status }: { status: keyof typeof roadmapStatusMeta }) {
  if (status === "completed") return <CheckCircle2 className="size-4" />;
  if (status === "validation") return <Clock3 className="size-4" />;
  return <CircleDashed className="size-4" />;
}

export default function DeliveryRoadmap() {
  const summary = summarizeRoadmap();
  const progress = Math.round(((summary.completed + summary.partial) / roadmapStages.length) * 100);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<number | null>(null);
  const [resolveTarget, setResolveTarget] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const { data: dependencyReviews = [] } = trpc.executionControl.list.useQuery();
  const requestReviewMutation = trpc.executionControl.requestReview.useMutation({ onSuccess: async () => { await utils.executionControl.list.invalidate(); toast.success("تم حفظ طلب مراجعة الاعتمادية"); setRetryTarget(null); } });
  const resolveDependencyMutation = trpc.executionControl.resolveDependency.useMutation({ onSuccess: async () => { await utils.executionControl.list.invalidate(); toast.success("تم إقرار حل الاعتمادية"); setResolveTarget(null); } });
  const requestRetryMutation = trpc.executionControl.requestRetry.useMutation({ onSuccess: async () => { await utils.executionControl.list.invalidate(); toast.success("تم حفظ طلب إعادة المحاولة"); setRetryTarget(null); } });
  const selectedBatch = operationalBatches.find(batch => batch.checkpointId === restoreTarget);
  const selectedStage = directExecutionStages.find(stage => stage.number === retryTarget);
  const selectedResolveStage = directExecutionStages.find(stage => stage.number === resolveTarget);
  const reviewByStage = new Map(dependencyReviews.map(review => [review.stageNumber, review]));
  const requestRestore = () => { if (!selectedBatch) return; toast.info("تم تسجيل طلب التراجع", { description: `نقطة الاستعادة ${selectedBatch.checkpointId} تحتاج تنفيذاً صريحاً من إدارة الإصدارات؛ لم تُغيّر هذه الشاشة البيانات أو النشر.` }); setRestoreTarget(null); };
  const requestRetry = () => { if (!selectedStage) return; const review = reviewByStage.get(selectedStage.number); if (review?.status === "dependency_resolved") requestRetryMutation.mutate({ stageNumber: selectedStage.number }); else requestReviewMutation.mutate({ stageNumber: selectedStage.number }); };
  const resolveDependency = () => { if (resolveTarget === null) return; resolveDependencyMutation.mutate({ stageNumber: resolveTarget }); };

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-7xl">
        <p className="sr-only" aria-live="polite">{`حالة خارطة التنفيذ: ${summary.completed} مرحلة مكتملة، ${summary.partial} مرحلة منفذة جزئياً، و${summary.validation} مراحل بانتظار تحقق حي. توجد ${dependencyReviews.length} مراجعات اعتماديات مسجلة للشركة الحالية.`}</p>
        <section className="relative overflow-hidden rounded-[2rem] bg-ds-brand-1000 px-6 py-8 text-white md:px-9">
          <div className="absolute -left-12 -top-14 size-52 rounded-full border-[24px] border-ds-gold-soft/15" />
          <div className="relative max-w-4xl">
            <p className="flex items-center gap-2 text-xs font-bold text-ds-gold-soft"><Bot className="size-4" />برنامج حلول الغد الشامل</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">خارطة تنفيذ كاملة عبر 30 مرحلة.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ds-brand-200">تعرض الخارطة الآن الحالة الواقعية لكل مرحلة: ما اكتمل، وما يحتاج تحققاً حياً، وما يُنفذ جزئياً، وما ينتظر قرار نطاقه أو اعتماديته.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProgressCard label="مكتملة" value={summary.completed} detail="مراحل ذات مخرج مثبت" tone="bg-ds-brand-100 text-ds-brand-600" />
          <ProgressCard label="بانتظار تحقق حي" value={summary.validation} detail="تحتاج جلسات أو قبولاً تشغيلياً" tone="bg-ds-warning-soft text-ds-warning" />
          <ProgressCard label="منفذة جزئياً" value={summary.partial} detail="تحتاج توسيع نطاق محدداً" tone="bg-ds-info-soft text-ds-info" />
          <ProgressCard label="تقدم البرنامج" value={`${progress}%`} detail="منجزة أو منفذة جزئياً" tone="bg-ds-brand-50 text-ds-teal-700" />
        </section>

        <section className="mt-8 rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-[0_8px_22px_rgba(21,50,35,.035)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold text-ds-brand-400"><History className="size-4" />دفعات تشغيلية محفوظة</p><h2 className="mt-2 text-2xl font-bold text-ds-brand-950">حالة التنفيذ ونقطة الاستعادة</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-ds-neutral-600">كل بطاقة تمثل دفعة منشورة مع معرف نقطة استعادة مرجعي ونتيجة تحقق مسجلة، دون عرض أسرار أو بيانات تشغيلية حساسة.</p></div><span className="rounded-full bg-ds-brand-100 px-3 py-1.5 text-xs font-bold text-ds-brand-600">{operationalBatches.length} دفعات متحققة</span></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{operationalBatches.map((batch, index) => <article key={batch.checkpointId} className="relative overflow-hidden rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50 p-4"><div className="absolute inset-y-0 right-0 w-1 bg-ds-brand-500" /><div className="flex items-start justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-ds-brand-100 text-ds-brand-600"><CheckCircle2 className="size-5" /></span><span className="rounded-full bg-ds-brand-50 px-2 py-1 text-[10px] font-bold text-ds-teal-700">دفعة {index + 1}</span></div><h3 className="mt-4 font-bold text-ds-neutral-950">{batch.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-ds-neutral-600">{batch.summary}</p><div className="mt-4 grid grid-cols-2 gap-2 border-t border-ds-neutral-200 pt-3 text-[11px]"><div><p className="text-ds-neutral-500">التحقق</p><p className="mt-1 flex items-center gap-1 font-bold text-ds-brand-600"><CheckCircle2 className="size-3" />{batch.verified ? "مكتمل" : "قيد المراجعة"}</p></div><div><p className="text-ds-neutral-500">الاختبارات</p><p className="mt-1 font-bold text-ds-brand-900">{batch.testCount}</p></div></div><div className="mt-3 rounded-xl bg-white px-3 py-2 text-[10px] text-ds-neutral-700"><span className="font-bold text-ds-brand-700">نقطة الاستعادة: </span>{batch.checkpointId}</div><Button variant="outline" size="sm" onClick={() => setRestoreTarget(batch.checkpointId)} className="mt-3 h-8 w-full rounded-lg border-ds-brand-200 text-xs text-ds-brand-700"><RotateCcw className="ml-1 size-3.5" />طلب التراجع</Button></article>)}</div>
        </section>

        <section className="mt-8 rounded-3xl border border-ds-neutral-200 bg-ds-neutral-50 p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold text-ds-brand-400"><Gauge className="size-4" />برنامج التنفيذ المباشر</p><h2 className="mt-2 text-2xl font-bold text-ds-brand-950">لوحة تقدم المراحل العشر</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-ds-neutral-600">تعرض الحالة الفعلية لكل محور، وتربط إعادة المراجعة بسجل دائم داخل الشركة. لا تبدأ أي عملية رواتب أو وثائق أو تكامل خارجي تلقائياً.</p></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ds-brand-700">{directExecutionStages.filter(stage => stage.status === "completed").length} مكتملة · {directExecutionStages.filter(stage => stage.status === "blocked").length} محجوبة</span></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{directExecutionStages.map(stage => { const review = reviewByStage.get(stage.number); const tone = stage.status === "completed" ? "border-ds-success-border bg-white" : stage.status === "partial" ? "border-ds-info-border bg-ds-white" : "border-ds-warning-border bg-ds-neutral-50"; const label = stage.status === "completed" ? "مكتملة داخلياً" : stage.status === "partial" ? "تنفيذ جزئي" : review?.status === "retry_requested" ? "إعادة محاولة مسجلة" : review?.status === "dependency_resolved" ? "الاعتمادية محلولة" : review?.status === "review_requested" ? "قيد مراجعة الاعتمادية" : "محجوبة"; return <article key={stage.number} className={`rounded-2xl border p-4 ${tone}`}><div className="flex items-center justify-between gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-ds-brand-50 text-xs font-bold text-ds-brand-600">{stage.number}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${stage.status === "blocked" ? "bg-ds-warning-soft text-ds-warning" : stage.status === "partial" ? "bg-ds-info-soft text-ds-info" : "bg-ds-brand-100 text-ds-brand-600"}`}>{label}</span></div><h3 className="mt-3 font-bold text-ds-neutral-950">{stage.title}</h3><p className="mt-2 min-h-12 text-xs leading-5 text-ds-neutral-600">{stage.detail}</p>{stage.dependency && <p className="mt-3 rounded-xl bg-white/80 px-2.5 py-2 text-[10px] leading-5 text-ds-warning-strong"><LockKeyhole className="ml-1 inline size-3" />{stage.dependency}</p>}{stage.status === "blocked" && !review && <Button variant="outline" size="sm" onClick={() => setRetryTarget(stage.number)} className="mt-3 h-8 w-full rounded-lg border-ds-gold-soft text-xs text-ds-warning"><Play className="ml-1 size-3.5" />{stage.retryLabel || "إعادة التحقق"}</Button>}{stage.status === "blocked" && review?.status === "review_requested" && <Button variant="outline" size="sm" onClick={() => setResolveTarget(stage.number)} className="mt-3 h-8 w-full rounded-lg border-ds-info-border text-xs text-ds-info"><CheckCircle2 className="ml-1 size-3.5" />إقرار حل الاعتمادية</Button>}{stage.status === "blocked" && review?.status === "dependency_resolved" && <Button variant="outline" size="sm" onClick={() => setRetryTarget(stage.number)} className="mt-3 h-8 w-full rounded-lg border-ds-brand-200 text-xs text-ds-brand-600"><Play className="ml-1 size-3.5" />بدء إعادة المحاولة</Button>}</article>; })}</div></section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold text-ds-brand-400">فريق افتراضي متعدد التخصصات</p><h2 className="mt-2 text-2xl font-bold text-ds-brand-950">8 أدوار تعمل ضمن برنامج واحد</h2></div>
            <span className="rounded-full bg-ds-brand-100 px-3 py-1.5 text-xs font-bold text-ds-brand-600">تنفيذ متدرج ومراجع</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {team.map(member => <article key={member.role} className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-[0_8px_22px_rgba(21,50,35,.035)]"><div className="flex size-10 items-center justify-center rounded-2xl bg-ds-brand-100 text-ds-brand-600"><member.icon className="size-5" /></div><h3 className="mt-5 text-sm font-bold text-ds-neutral-950">{member.role}</h3><p className="mt-2 text-xs leading-6 text-ds-neutral-600">{member.focus}</p></article>)}
          </div>
        </section>

        <section className="mt-10">
          <div><p className="text-xs font-bold text-ds-brand-400">خارطة الإصدار الشاملة</p><h2 className="mt-2 text-2xl font-bold text-ds-brand-950">المراحل الثلاثون</h2><p className="mt-2 text-sm text-ds-neutral-600">المراحل 18 و28 و29 لا تُعرض كمكتملة قبل تحقق حي موثق، حتى مع اكتمال ضماناتها الآلية.</p></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roadmapStages.map(stage => {
              const status = roadmapStatusMeta[stage.status];
              const isValidation = stage.status === "validation";
              return <article key={stage.number} className={`relative overflow-hidden rounded-3xl border p-5 ${isValidation ? "border-ds-warning-border bg-ds-ivory" : stage.status === "completed" ? "border-ds-neutral-200 bg-white" : "border-ds-neutral-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-4"><span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${isValidation ? "bg-ds-warning text-white" : "bg-ds-brand-50 text-ds-brand-600"}`}>{stage.number}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${trackColors[stage.track]}`}>{stage.track}</span></div>
                <div className="mt-5 flex items-center gap-2"><Layers3 className="size-4 text-ds-brand-400" /><h3 className="font-bold text-ds-neutral-950">{stage.title}</h3></div>
                <p className="mt-2 text-xs leading-6 text-ds-neutral-600">{stage.detail}</p>
                {stage.dependency && <p className="mt-3 rounded-2xl bg-ds-neutral-50 px-3 py-2 text-[11px] leading-5 text-ds-neutral-700">{stage.dependency}</p>}
                <p className={`mt-4 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}><StatusIcon status={stage.status} />{status.label}</p>
              </article>;
            })}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-ds-warning-border bg-ds-ivory p-6"><div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 size-5 text-ds-warning" /><div><h2 className="font-bold text-ds-warning-strong">أولوية الإغلاق الحالية</h2><p className="mt-2 text-sm leading-7 text-ds-warning-tan">إكمال قبول مسار الموافقات الحي بثلاثة أدوار مفعلة، ثم توثيق الأمن والقبول والتدريب. لا تُغلق هذه المراحل بمؤشرات أو اختبارات آلية وحدها.</p></div></div></section>
        <section className="mt-6 grid gap-4 md:grid-cols-3"><Milestone icon={Target} title="أقرب اعتماد" text="جلسات OAuth مستقلة للموظف والمدير والوحدة المختصة." /><Milestone icon={Sparkles} title="محور التوسع التالي" text="التوظيف والتهيئة، ثم الدوام والرواتب بعد اعتماد نطاقهما." /><Milestone icon={Rocket} title="بوابة الإطلاق" text="القبول الحي والأمن والتدريب قبل اعتبار الإطلاق التشغيلي مغلقاً." /></section>
        <Dialog open={Boolean(restoreTarget)} onOpenChange={open => !open && setRestoreTarget(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تأكيد طلب التراجع</DialogTitle><DialogDescription>سيُطلب استخدام نقطة الاستعادة المرجعية المحددة. لا تنفذ هذه الواجهة التراجع تلقائياً ولا تغيّر البيانات أو النشر.</DialogDescription></DialogHeader><div className="rounded-2xl bg-ds-ivory p-4 text-sm text-ds-warning-strong"><p className="font-bold">{selectedBatch?.title || "دفعة تشغيلية"}</p><p className="mt-1 text-xs">نقطة الاستعادة: {selectedBatch?.checkpointId || "—"}</p></div><DialogFooter><Button variant="outline" onClick={() => setRestoreTarget(null)}>إلغاء</Button><Button onClick={requestRestore} className="bg-ds-warning-strong"><RotateCcw className="ml-2 size-4" />تأكيد طلب التراجع</Button></DialogFooter></DialogContent></Dialog>
        <Dialog open={Boolean(retryTarget)} onOpenChange={open => !open && setRetryTarget(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{reviewByStage.get(retryTarget ?? 0)?.status === "dependency_resolved" ? "تأكيد بدء إعادة المحاولة" : "تأكيد مراجعة الاعتمادية"}</DialogTitle><DialogDescription>{reviewByStage.get(retryTarget ?? 0)?.status === "dependency_resolved" ? "سيُسجل طلب إعادة المحاولة بعد إقرار حل الاعتمادية. لا ينشئ السجل اتصالاً خارجياً تلقائياً." : "سيُسجل طلب مراجعة الاعتمادية في سجل الشركة. لن تبدأ عملية رواتب أو توقيع أو تكامل أو مصدر معرفة تلقائياً."}</DialogDescription></DialogHeader><div className="rounded-2xl bg-ds-ivory p-4 text-sm text-ds-warning-strong"><p className="font-bold">{selectedStage?.title || "بند محجوب"}</p><p className="mt-1 text-xs">الاعتمادية: {selectedStage?.dependency || "—"}</p></div><DialogFooter><Button variant="outline" onClick={() => setRetryTarget(null)}>إلغاء</Button><Button onClick={requestRetry} disabled={requestReviewMutation.isPending || requestRetryMutation.isPending} className="bg-ds-brand-800"><Play className="ml-2 size-4" />{reviewByStage.get(retryTarget ?? 0)?.status === "dependency_resolved" ? "تأكيد إعادة المحاولة" : "تسجيل طلب المراجعة"}</Button></DialogFooter></DialogContent></Dialog>
        <Dialog open={Boolean(resolveTarget)} onOpenChange={open => !open && setResolveTarget(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>إقرار حل الاعتمادية</DialogTitle><DialogDescription>هذا إقرار إداري بأن الاعتمادية المحددة حُلّت. لا يثبت اتصالاً خارجياً ولا يشغّل أي مزود تلقائياً.</DialogDescription></DialogHeader><div className="rounded-2xl bg-ds-info-soft p-4 text-sm text-ds-info"><p className="font-bold">{selectedResolveStage?.title || "بند محجوب"}</p><p className="mt-1 text-xs">الاعتمادية: {selectedResolveStage?.dependency || "—"}</p></div><DialogFooter><Button variant="outline" onClick={() => setResolveTarget(null)}>إلغاء</Button><Button onClick={resolveDependency} disabled={resolveDependencyMutation.isPending} className="bg-ds-info"><CheckCircle2 className="ml-2 size-4" />تأكيد الإقرار</Button></DialogFooter></DialogContent></Dialog>
      </div>
    </DashboardLayout>
  );
}

function ProgressCard({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: string }) {
  return <article className="rounded-3xl border border-ds-neutral-200 bg-white p-5"><p className="text-xs font-bold text-ds-neutral-600">{label}</p><p className={`mt-3 w-fit rounded-2xl px-3 py-1 text-2xl font-bold ${tone}`}>{value}</p><p className="mt-3 text-xs text-ds-neutral-600">{detail}</p></article>;
}

function Milestone({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return <article className="rounded-3xl border border-ds-neutral-200 bg-white p-5"><Icon className="size-5 text-ds-brand-400" /><h3 className="mt-4 font-bold text-ds-neutral-950">{title}</h3><p className="mt-2 text-xs leading-6 text-ds-neutral-600">{text}</p></article>;
}
