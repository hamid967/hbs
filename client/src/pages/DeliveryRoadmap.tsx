import DashboardLayout from "@/components/DashboardLayout";
import { directExecutionStages, operationalBatches, roadmapStages, roadmapStatusMeta, summarizeRoadmap } from "@/lib/roadmapStages";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  "الأساس": "bg-[#e9f4eb] text-[#347950]", "التجربة": "bg-[#fff1de] text-[#a46723]", "المنصة": "bg-[#e9eef8] text-[#446b98]", "HR Core": "bg-[#eef0fa] text-[#5a5ba4]", "العمليات": "bg-[#edf5f3] text-[#27705e]", "البيانات": "bg-[#f3eefa] text-[#7551a0]", "الذكاء": "bg-[#e8f4ef] text-[#1e7650]", "التوسع": "bg-[#f9eeee] text-[#a24646]", "الاستعداد": "bg-[#f1f2f1] text-[#66736a]",
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
  const [retryRequested, setRetryRequested] = useState<number[]>([]);
  const selectedBatch = operationalBatches.find(batch => batch.checkpointId === restoreTarget);
  const selectedStage = directExecutionStages.find(stage => stage.number === retryTarget);
  const requestRestore = () => { if (!selectedBatch) return; toast.info("تم تسجيل طلب التراجع", { description: `نقطة الاستعادة ${selectedBatch.checkpointId} تحتاج تنفيذاً صريحاً من إدارة الإصدارات؛ لم تُغيّر هذه الشاشة البيانات أو النشر.` }); setRestoreTarget(null); };
  const requestRetry = () => { if (!selectedStage) return; setRetryRequested(current => current.includes(selectedStage.number) ? current : [...current, selectedStage.number]); toast.success("تم تسجيل طلب مراجعة الاعتمادية", { description: "تبدأ إعادة المحاولة فقط بعد اعتماد الاعتمادية المحددة؛ لم يُنشأ اتصال أو تنفيذ خارجي." }); setRetryTarget(null); };

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#183f31] px-6 py-8 text-white md:px-9">
          <div className="absolute -left-12 -top-14 size-52 rounded-full border-[24px] border-[#e7c89c]/15" />
          <div className="relative max-w-4xl">
            <p className="flex items-center gap-2 text-xs font-bold text-[#e7c89c]"><Bot className="size-4" />برنامج حلول الغد الشامل</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">خارطة تنفيذ كاملة عبر 30 مرحلة.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d4e4d7]">تعرض الخارطة الآن الحالة الواقعية لكل مرحلة: ما اكتمل، وما يحتاج تحققاً حياً، وما يُنفذ جزئياً، وما ينتظر قرار نطاقه أو اعتماديته.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProgressCard label="مكتملة" value={summary.completed} detail="مراحل ذات مخرج مثبت" tone="bg-[#e6f4e8] text-[#347950]" />
          <ProgressCard label="بانتظار تحقق حي" value={summary.validation} detail="تحتاج جلسات أو قبولاً تشغيلياً" tone="bg-[#fff1de] text-[#a46723]" />
          <ProgressCard label="منفذة جزئياً" value={summary.partial} detail="تحتاج توسيع نطاق محدداً" tone="bg-[#e9eef8] text-[#446b98]" />
          <ProgressCard label="تقدم البرنامج" value={`${progress}%`} detail="منجزة أو منفذة جزئياً" tone="bg-[#edf5f3] text-[#27705e]" />
        </section>

        <section className="mt-8 rounded-3xl border border-[#dce9df] bg-white p-5 shadow-[0_8px_22px_rgba(21,50,35,.035)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold text-[#5d8d70]"><History className="size-4" />دفعات تشغيلية محفوظة</p><h2 className="mt-2 text-2xl font-bold text-[#1d4532]">حالة التنفيذ ونقطة الاستعادة</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-[#758278]">كل بطاقة تمثل دفعة منشورة مع معرف نقطة استعادة مرجعي ونتيجة تحقق مسجلة، دون عرض أسرار أو بيانات تشغيلية حساسة.</p></div><span className="rounded-full bg-[#e7f4ea] px-3 py-1.5 text-xs font-bold text-[#30774e]">{operationalBatches.length} دفعات متحققة</span></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{operationalBatches.map((batch, index) => <article key={batch.checkpointId} className="relative overflow-hidden rounded-2xl border border-[#e1e9e2] bg-[#fbfdfb] p-4"><div className="absolute inset-y-0 right-0 w-1 bg-[#4f8a63]" /><div className="flex items-start justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e7f4ea] text-[#347950]"><CheckCircle2 className="size-5" /></span><span className="rounded-full bg-[#edf5f3] px-2 py-1 text-[10px] font-bold text-[#27705e]">دفعة {index + 1}</span></div><h3 className="mt-4 font-bold text-[#294535]">{batch.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-[#718075]">{batch.summary}</p><div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#e5ece6] pt-3 text-[11px]"><div><p className="text-[#8a968e]">التحقق</p><p className="mt-1 flex items-center gap-1 font-bold text-[#347950]"><CheckCircle2 className="size-3" />{batch.verified ? "مكتمل" : "قيد المراجعة"}</p></div><div><p className="text-[#8a968e]">الاختبارات</p><p className="mt-1 font-bold text-[#375648]">{batch.testCount}</p></div></div><div className="mt-3 rounded-xl bg-white px-3 py-2 text-[10px] text-[#66766c]"><span className="font-bold text-[#4d7a5d]">نقطة الاستعادة: </span>{batch.checkpointId}</div><Button variant="outline" size="sm" onClick={() => setRestoreTarget(batch.checkpointId)} className="mt-3 h-8 w-full rounded-lg border-[#cfe0d2] text-xs text-[#386f50]"><RotateCcw className="ml-1 size-3.5" />طلب التراجع</Button></article>)}</div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#dbe8de] bg-[#f9fcf9] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold text-[#5d8d70]"><Gauge className="size-4" />برنامج التنفيذ المباشر</p><h2 className="mt-2 text-2xl font-bold text-[#1d4532]">لوحة تقدم المراحل العشر</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-[#758278]">تعرض الحالة الفعلية لكل محور، وتسمح بتسجيل طلب إعادة تقييم للبنود المحجوبة بعد استيفاء اعتماديتها؛ لا تبدأ أي عملية خارجية تلقائياً.</p></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#4b7258]">{directExecutionStages.filter(stage => stage.status === "completed").length} مكتملة · {directExecutionStages.filter(stage => stage.status === "blocked").length} محجوبة</span></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{directExecutionStages.map(stage => { const tone = stage.status === "completed" ? "border-[#cfe4d3] bg-white" : stage.status === "partial" ? "border-[#d5dfeb] bg-[#fbfcff]" : "border-[#efdcbf] bg-[#fffaf3]"; const label = stage.status === "completed" ? "مكتملة داخلياً" : stage.status === "partial" ? "تنفيذ جزئي" : retryRequested.includes(stage.number) ? "طلب مراجعة مسجل" : "محجوبة"; return <article key={stage.number} className={`rounded-2xl border p-4 ${tone}`}><div className="flex items-center justify-between gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-[#edf4ee] text-xs font-bold text-[#397d56]">{stage.number}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${stage.status === "blocked" ? "bg-[#fff1de] text-[#a46723]" : stage.status === "partial" ? "bg-[#e9eef8] text-[#446b98]" : "bg-[#e6f4e8] text-[#347950]"}`}>{label}</span></div><h3 className="mt-3 font-bold text-[#294535]">{stage.title}</h3><p className="mt-2 min-h-12 text-xs leading-5 text-[#718075]">{stage.detail}</p>{stage.dependency && <p className="mt-3 rounded-xl bg-white/80 px-2.5 py-2 text-[10px] leading-5 text-[#8b6937]"><LockKeyhole className="ml-1 inline size-3" />{stage.dependency}</p>}{stage.status === "blocked" && <Button variant="outline" size="sm" onClick={() => setRetryTarget(stage.number)} className="mt-3 h-8 w-full rounded-lg border-[#e6c992] text-xs text-[#9b661d]"><Play className="ml-1 size-3.5" />{stage.retryLabel || "إعادة التحقق"}</Button>}</article>; })}</div></section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold text-[#5d8d70]">فريق افتراضي متعدد التخصصات</p><h2 className="mt-2 text-2xl font-bold text-[#1d4532]">8 أدوار تعمل ضمن برنامج واحد</h2></div>
            <span className="rounded-full bg-[#e7f2e8] px-3 py-1.5 text-xs font-bold text-[#327950]">تنفيذ متدرج ومراجع</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {team.map(member => <article key={member.role} className="rounded-3xl border border-[#e1e9e2] bg-white p-5 shadow-[0_8px_22px_rgba(21,50,35,.035)]"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f3e9] text-[#367d55]"><member.icon className="size-5" /></div><h3 className="mt-5 text-sm font-bold text-[#294535]">{member.role}</h3><p className="mt-2 text-xs leading-6 text-[#728077]">{member.focus}</p></article>)}
          </div>
        </section>

        <section className="mt-10">
          <div><p className="text-xs font-bold text-[#5d8d70]">خارطة الإصدار الشاملة</p><h2 className="mt-2 text-2xl font-bold text-[#1d4532]">المراحل الثلاثون</h2><p className="mt-2 text-sm text-[#758278]">المراحل 18 و28 و29 لا تُعرض كمكتملة قبل تحقق حي موثق، حتى مع اكتمال ضماناتها الآلية.</p></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roadmapStages.map(stage => {
              const status = roadmapStatusMeta[stage.status];
              const isValidation = stage.status === "validation";
              return <article key={stage.number} className={`relative overflow-hidden rounded-3xl border p-5 ${isValidation ? "border-[#efd5ae] bg-[#fffaf2]" : stage.status === "completed" ? "border-[#dce9df] bg-white" : "border-[#e2e9e2] bg-white"}`}>
                <div className="flex items-start justify-between gap-4"><span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${isValidation ? "bg-[#a46723] text-white" : "bg-[#edf4ee] text-[#397d56]"}`}>{stage.number}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${trackColors[stage.track]}`}>{stage.track}</span></div>
                <div className="mt-5 flex items-center gap-2"><Layers3 className="size-4 text-[#58866b]" /><h3 className="font-bold text-[#294535]">{stage.title}</h3></div>
                <p className="mt-2 text-xs leading-6 text-[#6f7e74]">{stage.detail}</p>
                {stage.dependency && <p className="mt-3 rounded-2xl bg-[#f7f8f6] px-3 py-2 text-[11px] leading-5 text-[#68766d]">{stage.dependency}</p>}
                <p className={`mt-4 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}><StatusIcon status={stage.status} />{status.label}</p>
              </article>;
            })}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#ead9bd] bg-[#fff9f0] p-6"><div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 size-5 text-[#a26a25]" /><div><h2 className="font-bold text-[#684920]">أولوية الإغلاق الحالية</h2><p className="mt-2 text-sm leading-7 text-[#806647]">إكمال قبول مسار الموافقات الحي بثلاثة أدوار مفعلة، ثم توثيق الأمن والقبول والتدريب. لا تُغلق هذه المراحل بمؤشرات أو اختبارات آلية وحدها.</p></div></div></section>
        <section className="mt-6 grid gap-4 md:grid-cols-3"><Milestone icon={Target} title="أقرب اعتماد" text="جلسات OAuth مستقلة للموظف والمدير والوحدة المختصة." /><Milestone icon={Sparkles} title="محور التوسع التالي" text="التوظيف والتهيئة، ثم الدوام والرواتب بعد اعتماد نطاقهما." /><Milestone icon={Rocket} title="بوابة الإطلاق" text="القبول الحي والأمن والتدريب قبل اعتبار الإطلاق التشغيلي مغلقاً." /></section>
        <Dialog open={Boolean(restoreTarget)} onOpenChange={open => !open && setRestoreTarget(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تأكيد طلب التراجع</DialogTitle><DialogDescription>سيُطلب استخدام نقطة الاستعادة المرجعية المحددة. لا تنفذ هذه الواجهة التراجع تلقائياً ولا تغيّر البيانات أو النشر.</DialogDescription></DialogHeader><div className="rounded-2xl bg-[#fff9f0] p-4 text-sm text-[#76582c]"><p className="font-bold">{selectedBatch?.title || "دفعة تشغيلية"}</p><p className="mt-1 text-xs">نقطة الاستعادة: {selectedBatch?.checkpointId || "—"}</p></div><DialogFooter><Button variant="outline" onClick={() => setRestoreTarget(null)}>إلغاء</Button><Button onClick={requestRestore} className="bg-[#8b5d2e]"><RotateCcw className="ml-2 size-4" />تأكيد طلب التراجع</Button></DialogFooter></DialogContent></Dialog>
        <Dialog open={Boolean(retryTarget)} onOpenChange={open => !open && setRetryTarget(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تأكيد مراجعة الاعتمادية</DialogTitle><DialogDescription>سيُسجل طلب لإعادة تقييم جاهزية هذا البند. لن تبدأ عملية رواتب أو توقيع أو تكامل أو مصدر معرفة تلقائياً.</DialogDescription></DialogHeader><div className="rounded-2xl bg-[#fff9f0] p-4 text-sm text-[#76582c]"><p className="font-bold">{selectedStage?.title || "بند محجوب"}</p><p className="mt-1 text-xs">الاعتمادية: {selectedStage?.dependency || "—"}</p></div><DialogFooter><Button variant="outline" onClick={() => setRetryTarget(null)}>إلغاء</Button><Button onClick={requestRetry} className="bg-[#1f5b45]"><Play className="ml-2 size-4" />تسجيل طلب المراجعة</Button></DialogFooter></DialogContent></Dialog>
      </div>
    </DashboardLayout>
  );
}

function ProgressCard({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: string }) {
  return <article className="rounded-3xl border border-[#e0e9e1] bg-white p-5"><p className="text-xs font-bold text-[#758278]">{label}</p><p className={`mt-3 w-fit rounded-2xl px-3 py-1 text-2xl font-bold ${tone}`}>{value}</p><p className="mt-3 text-xs text-[#728077]">{detail}</p></article>;
}

function Milestone({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return <article className="rounded-3xl border border-[#e0e9e1] bg-white p-5"><Icon className="size-5 text-[#4f8566]" /><h3 className="mt-4 font-bold text-[#294535]">{title}</h3><p className="mt-2 text-xs leading-6 text-[#728077]">{text}</p></article>;
}
