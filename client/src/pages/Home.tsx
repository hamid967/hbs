import DashboardLayout from "@/components/DashboardLayout";
import CompanyOverview from "@/components/CompanyOverview";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BotMessageSquare, Building2, ChartNoAxesCombined, ChevronLeft, Clock3, FilePlus2, Landmark, Orbit, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const serviceCards = [
  { title: "طلب موارد بشرية", detail: "إجازات، تعريف بالراتب، تحديث بيانات، ومزيد من الخدمات.", icon: Building2, tone: "bg-ds-brand-100 text-ds-brand-800", path: "/requests/new?type=hr" },
  { title: "طلب علاقات حكومية", detail: "معاملات الجهات الرسمية، التأشيرات، والإقامات والتصديقات.", icon: Landmark, tone: "bg-ds-warning-soft text-ds-warning", path: "/requests/new?type=government" },
];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [introVisible, setIntroVisible] = useState(true);
  const reportMonth = new Date().toISOString().slice(0, 7);
  const canViewReports = Boolean(user && ["admin", "hr", "manager"].includes(user.role));
  const { data: report, isLoading: reportLoading, isError: reportError } = trpc.reports.monthly.useQuery(
    { month: reportMonth },
    { enabled: canViewReports, retry: false }
  );
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setIntroVisible(false); return; }
    const timer = window.setTimeout(() => setIntroVisible(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl" dir="rtl">
        <div aria-hidden={!introVisible} className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-ds-ink-strong transition-opacity duration-300 ${introVisible ? "opacity-100" : "opacity-0"}`}><div className="premium-grid absolute inset-0 opacity-70" /><div className="intro-emerge relative flex flex-col items-center"><div className="relative grid size-28 place-items-center rounded-[2.1rem] border border-ds-gold/40 bg-ds-ivory/10 text-ds-emerald shadow-[0_0_0_16px_rgba(24,185,130,.05),0_32px_70px_rgba(0,0,0,.35)]"><Orbit className="size-10" /><span className="signal-breathe absolute -bottom-2 -left-2 size-4 rounded-full bg-ds-gold" /></div><p className="mt-6 text-xs font-bold tracking-[.25em] text-ds-ivory">حلول الغد · HR HBS</p><p className="mt-2 text-[10px] font-semibold tracking-[.14em] text-ds-mist">مساحة عمل منضبطة</p></div></div>
        <section className="relative overflow-hidden rounded-[2rem] bg-ds-ink-strong px-6 py-8 text-ds-ivory shadow-[0_24px_60px_rgba(7,26,26,.24)] md:px-10 md:py-12">
          <div aria-hidden="true" className="premium-grid absolute inset-0 opacity-60" /><div aria-hidden="true" className="premium-shine absolute inset-0" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[.13em] text-ds-gold"><Sparkles className="size-4" /> مساحة العمل الداخلية</div><h1 className="premium-wordmark text-3xl font-bold leading-tight tracking-tight md:text-5xl">كل طلب إداري يبدأ واضحاً،<br /><span className="text-ds-mist">وينتهي بأثر قابل للمتابعة.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-ds-neutral-300 md:text-base">قدّم طلبك، تابع مرحلته، واحتفظ بسجل منظم للتحديثات ضمن تجربة عربية مصممة للعمل اليومي.</p><Button onClick={() => setLocation("/requests/new")} className="pressable mt-7 h-11 rounded-full bg-ds-emerald px-5 font-bold text-ds-ink hover:bg-ds-emerald-bright"><FilePlus2 className="ml-2 size-4" />ابدأ طلباً جديداً</Button></div><div className="float-soft relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/[.07] p-4 shadow-[0_25px_40px_rgba(0,0,0,.24)] backdrop-blur-md"><div className="flex items-center justify-between text-xs text-ds-neutral-300"><span>نظرة تشغيلية</span><span className="rounded-full bg-ds-emerald/15 px-2 py-1 font-bold text-ds-emerald-soft">ضمن الصلاحية</span></div><div className="mt-4 grid grid-cols-2 gap-2"><MetricTile label="أيام الإجازات" value={reportLoading ? "—" : report ? String(report.leaveDays.current) : "—"} /><MetricTile label="المصروفات" value={reportLoading ? "—" : report ? `${report.expensesSar.current.toLocaleString("ar-SA")} ر.س` : "—"} /></div><div className="mt-3 rounded-2xl border border-white/10 bg-ds-ink-strong/65 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold text-ds-gold">مسار الموافقات</p><ChartNoAxesCombined className="size-4 text-ds-emerald" /></div><p className="mt-2 text-xs leading-6 text-ds-mist">تظهر مراحل القرار والتحديثات للحسابات التي تملك نطاق الوصول المناسب.</p><div className="mt-3 flex items-center gap-2"><i className="size-2 rounded-full bg-ds-emerald" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-ds-gold" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-ds-ivory" /></div></div></div></div>
        </section>

        <section className="relative z-10 -mt-4 mx-3 grid gap-3 rounded-[1.75rem] border border-ds-neutral-300 bg-ds-ivory/95 p-4 shadow-[0_18px_36px_rgba(7,26,26,.12)] backdrop-blur md:mx-8 md:grid-cols-3 md:p-5">
          <div className="md:col-span-3 flex items-center justify-between gap-3 border-b border-ds-neutral-200 pb-3"><div><p className="text-sm font-bold text-ds-ink">نبض العمليات</p><p className="mt-1 text-xs text-ds-teal-500">مؤشرات شهرية محدثة من مركز التقارير ضمن نطاقك المصرح.</p></div><button onClick={() => setLocation("/reports")} className="pressable shrink-0 rounded-full bg-ds-brand-100 px-3 py-2 text-xs font-bold text-ds-success hover:bg-ds-success-border">عرض التقرير</button></div>
          {reportLoading ? [1, 2, 3].map(item => <div key={item} className="h-20 animate-pulse rounded-2xl bg-ds-neutral-200" />) : reportError || !report ? <div className="md:col-span-3 rounded-2xl bg-ds-neutral-100 p-4 text-center text-xs leading-6 text-ds-teal-500">لا تتوفر مؤشرات التقارير لهذا الحساب حالياً.</div> : <><QuickMetric label="أيام الإجازات" value={String(report.leaveDays.current)} detail={`فرق ${signed(report.leaveDays.delta)} عن الشهر السابق`} /><QuickMetric label="المصروفات" value={`${report.expensesSar.current.toLocaleString("ar-SA")} ر.س`} detail={`فرق ${signed(report.expensesSar.delta)} ر.س عن الشهر السابق`} /><QuickMetric label="نطاق البيانات" value={report.scope === "team" ? "فريقي" : "الشركة"} detail={`محدث لشهر ${report.selectedMonth}`} /></>}
        </section>

        {/* Company Overview KPI Cards */}
        <CompanyOverview className="mt-8" />

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold text-ds-brand-1000">الخدمات المتاحة</p><p className="mt-1 text-xs text-ds-neutral-600">اختر المجال المناسب لبدء طلبك.</p></div>
            <button onClick={() => setLocation("/requests/new")} className="flex items-center gap-1 text-xs font-bold text-ds-brand-600">عرض جميع الخدمات <ChevronLeft className="size-4" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map(card => <button key={card.title} onClick={() => setLocation(card.path)} className="group flex items-start gap-4 rounded-3xl border border-ds-neutral-200 bg-white p-5 text-right shadow-[0_10px_28px_rgba(21,50,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-ds-success-border hover:shadow-[0_14px_30px_rgba(21,50,35,0.09)]">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}><card.icon className="size-5" /></div>
              <div className="flex-1"><h2 className="font-bold text-ds-neutral-950">{card.title}</h2><p className="mt-2 text-xs leading-6 text-ds-neutral-600">{card.detail}</p></div>
              <ArrowLeft className="mt-1 size-4 text-ds-neutral-400 transition-transform group-hover:-translate-x-1" />
            </button>)}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <button onClick={() => setLocation("/assistant")} className="group overflow-hidden rounded-3xl bg-ds-brand-100 p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(21,50,35,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-ds-brand-600"><BotMessageSquare className="size-5" /></span><ArrowLeft className="size-4 text-ds-brand-400 transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-ds-brand-950">مساعد استقبال الطلبات</p><p className="mt-2 text-sm leading-6 text-ds-neutral-700">اكتب ما تحتاجه، وسيساعدك المساعد على تنظيمه وتحويله إلى مسودة طلب قابلة للمراجعة.</p></button><button onClick={() => setLocation("/hr-system")} className="group overflow-hidden rounded-3xl bg-ds-warning-soft p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(92,56,22,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-ds-warning"><WandSparkles className="size-5" /></span><ArrowLeft className="size-4 text-ds-warning-strong transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-ds-warning-strong">مصمم نظام الموارد البشرية</p><p className="mt-2 text-sm leading-6 text-ds-warning-tan">أدخل نشاط الشركة وحجمها، ثم أنشئ مخطط نظام موارد بشرية مناسباً لمراحل العمل القادمة.</p></button>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-ds-neutral-200 bg-white p-6 shadow-[0_10px_28px_rgba(21,50,35,0.04)]">
            <div className="flex items-start justify-between"><div><h2 className="font-bold text-ds-brand-1000">متابعة طلباتك</h2><p className="mt-1 text-xs text-ds-neutral-600">ستظهر هنا التحديثات فور تسجيل طلبك.</p></div><Button variant="outline" onClick={() => setLocation("/my-requests")} className="h-8 rounded-lg border-ds-brand-200 text-xs text-ds-brand-700">عرض الطلبات</Button></div>
            <div className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ds-brand-200 bg-ds-neutral-50 px-5 py-9 text-center"><div className="flex size-11 items-center justify-center rounded-2xl bg-ds-brand-50 text-ds-brand-600"><Clock3 className="size-5" /></div><p className="mt-3 text-sm font-semibold text-ds-neutral-900">لا توجد طلبات للعرض حالياً</p><p className="mt-1 max-w-sm text-xs leading-5 text-ds-neutral-500">استخدم زر «ابدأ طلباً جديداً» لتقديم أول طلب لك ومتابعة حالة معالجته من هنا.</p></div>
          </div>
          <aside className="rounded-3xl bg-ds-warning-soft p-6"><p className="text-xs font-bold text-ds-warning">معلومة سريعة</p><h2 className="mt-3 text-xl font-bold leading-8 text-ds-warning-deep">التفاصيل الدقيقة تسرّع إنجاز الطلب.</h2><p className="mt-3 text-xs leading-6 text-ds-warning-strong">أرفق المعلومات الأساسية واستخدم وصفاً واضحاً ليتمكن الفريق المختص من متابعة معاملتك بكفاءة.</p></aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.07] p-3"><p className="text-[10px] font-semibold text-ds-mist">{label}</p><p className="mt-2 text-lg font-bold text-ds-ivory">{value}</p></div>; }
function QuickMetric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="pressable rounded-2xl bg-white/80 p-4 hover:bg-white"><p className="text-xs font-semibold text-ds-teal-600">{label}</p><p className="mt-2 text-xl font-bold text-ds-ink">{value}</p><p className="mt-1 text-[11px] text-ds-success">{detail}</p></article>; }
function signed(value: number) { return `${value >= 0 ? "+" : ""}${value}`; }
