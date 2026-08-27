import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BotMessageSquare, Building2, ChartNoAxesCombined, ChevronLeft, Clock3, FilePlus2, Landmark, Orbit, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const serviceCards = [
  { title: "طلب موارد بشرية", detail: "إجازات، تعريف بالراتب، تحديث بيانات، ومزيد من الخدمات.", icon: Building2, tone: "bg-[#e2eee2] text-[#1f5b45]", path: "/requests/new?type=hr" },
  { title: "طلب علاقات حكومية", detail: "معاملات الجهات الرسمية، التأشيرات، والإقامات والتصديقات.", icon: Landmark, tone: "bg-[#f6e9d7] text-[#9a5d20]", path: "/requests/new?type=government" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [introVisible, setIntroVisible] = useState(true);
  const reportMonth = new Date().toISOString().slice(0, 7);
  const { data: report, isLoading: reportLoading, isError: reportError } = trpc.reports.monthly.useQuery({ month: reportMonth });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setIntroVisible(false); return; }
    const timer = window.setTimeout(() => setIntroVisible(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl" dir="rtl">
        <div aria-hidden={!introVisible} className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#071a1a] transition-opacity duration-300 ${introVisible ? "opacity-100" : "opacity-0"}`}><div className="premium-grid absolute inset-0 opacity-70" /><div className="intro-emerge relative flex flex-col items-center"><div className="relative grid size-28 place-items-center rounded-[2.1rem] border border-[#c8a66a]/40 bg-[#f4f0e8]/10 text-[#18b982] shadow-[0_0_0_16px_rgba(24,185,130,.05),0_32px_70px_rgba(0,0,0,.35)]"><Orbit className="size-10" /><span className="signal-breathe absolute -bottom-2 -left-2 size-4 rounded-full bg-[#c8a66a]" /></div><p className="mt-6 text-xs font-bold tracking-[.25em] text-[#f4f0e8]">حلول الغد · HR HBS</p><p className="mt-2 text-[10px] font-semibold tracking-[.14em] text-[#b7d1d4]">مساحة عمل منضبطة</p></div></div>
        <section className="relative overflow-hidden rounded-[2rem] bg-[#071a1a] px-6 py-8 text-[#f4f0e8] shadow-[0_24px_60px_rgba(7,26,26,.24)] md:px-10 md:py-12">
          <div aria-hidden="true" className="premium-grid absolute inset-0 opacity-60" /><div aria-hidden="true" className="premium-shine absolute inset-0" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[.13em] text-[#c8a66a]"><Sparkles className="size-4" /> مساحة العمل الداخلية</div><h1 className="premium-wordmark text-3xl font-bold leading-tight tracking-tight md:text-5xl">كل طلب إداري يبدأ واضحاً،<br /><span className="text-[#b7d1d4]">وينتهي بأثر قابل للمتابعة.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#c5d7d5] md:text-base">قدّم طلبك، تابع مرحلته، واحتفظ بسجل منظم للتحديثات ضمن تجربة عربية مصممة للعمل اليومي.</p><Button onClick={() => setLocation("/requests/new")} className="pressable mt-7 h-11 rounded-full bg-[#18b982] px-5 font-bold text-[#06201a] hover:bg-[#4bd6aa]"><FilePlus2 className="ml-2 size-4" />ابدأ طلباً جديداً</Button></div><div className="float-soft relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/[.07] p-4 shadow-[0_25px_40px_rgba(0,0,0,.24)] backdrop-blur-md"><div className="flex items-center justify-between text-xs text-[#c5d7d5]"><span>نظرة تشغيلية</span><span className="rounded-full bg-[#18b982]/15 px-2 py-1 font-bold text-[#7de0bd]">ضمن الصلاحية</span></div><div className="mt-4 grid grid-cols-2 gap-2"><MetricTile label="أيام الإجازات" value={reportLoading ? "—" : report ? String(report.leaveDays.current) : "—"} /><MetricTile label="المصروفات" value={reportLoading ? "—" : report ? `${report.expensesSar.current.toLocaleString("ar-SA")} ر.س` : "—"} /></div><div className="mt-3 rounded-2xl border border-white/10 bg-[#061513]/65 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold text-[#c8a66a]">مسار الموافقات</p><ChartNoAxesCombined className="size-4 text-[#18b982]" /></div><p className="mt-2 text-xs leading-6 text-[#b7d1d4]">تظهر مراحل القرار والتحديثات للحسابات التي تملك نطاق الوصول المناسب.</p><div className="mt-3 flex items-center gap-2"><i className="size-2 rounded-full bg-[#18b982]" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-[#c8a66a]" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-[#f4f0e8]" /></div></div></div></div>
        </section>

        <section className="relative z-10 -mt-4 mx-3 grid gap-3 rounded-[1.75rem] border border-[#c8d4ce] bg-[#f7f5ef]/95 p-4 shadow-[0_18px_36px_rgba(7,26,26,.12)] backdrop-blur md:mx-8 md:grid-cols-3 md:p-5">
          <div className="md:col-span-3 flex items-center justify-between gap-3 border-b border-[#dce4df] pb-3"><div><p className="text-sm font-bold text-[#092a28]">نبض العمليات</p><p className="mt-1 text-xs text-[#637a77]">مؤشرات شهرية محدثة من مركز التقارير ضمن نطاقك المصرح.</p></div><button onClick={() => setLocation("/reports")} className="pressable shrink-0 rounded-full bg-[#dff5eb] px-3 py-2 text-xs font-bold text-[#087a5c] hover:bg-[#c9efde]">عرض التقرير</button></div>
          {reportLoading ? [1, 2, 3].map(item => <div key={item} className="h-20 animate-pulse rounded-2xl bg-[#e6ece6]" />) : reportError || !report ? <div className="md:col-span-3 rounded-2xl bg-[#eef1eb] p-4 text-center text-xs leading-6 text-[#637a77]">لا تتوفر مؤشرات التقارير لهذا الحساب حالياً.</div> : <><QuickMetric label="أيام الإجازات" value={String(report.leaveDays.current)} detail={`فرق ${signed(report.leaveDays.delta)} عن الشهر السابق`} /><QuickMetric label="المصروفات" value={`${report.expensesSar.current.toLocaleString("ar-SA")} ر.س`} detail={`فرق ${signed(report.expensesSar.delta)} ر.س عن الشهر السابق`} /><QuickMetric label="نطاق البيانات" value={report.scope === "team" ? "فريقي" : "الشركة"} detail={`محدث لشهر ${report.selectedMonth}`} /></>}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold text-[#173e30]">الخدمات المتاحة</p><p className="mt-1 text-xs text-[#79867e]">اختر المجال المناسب لبدء طلبك.</p></div>
            <button onClick={() => setLocation("/requests/new")} className="flex items-center gap-1 text-xs font-bold text-[#26714f]">عرض جميع الخدمات <ChevronLeft className="size-4" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map(card => <button key={card.title} onClick={() => setLocation(card.path)} className="group flex items-start gap-4 rounded-3xl border border-[#e5eae5] bg-white p-5 text-right shadow-[0_10px_28px_rgba(21,50,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#bcd2c1] hover:shadow-[0_14px_30px_rgba(21,50,35,0.09)]">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}><card.icon className="size-5" /></div>
              <div className="flex-1"><h2 className="font-bold text-[#233e31]">{card.title}</h2><p className="mt-2 text-xs leading-6 text-[#728077]">{card.detail}</p></div>
              <ArrowLeft className="mt-1 size-4 text-[#9ca8a1] transition-transform group-hover:-translate-x-1" />
            </button>)}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <button onClick={() => setLocation("/assistant")} className="group overflow-hidden rounded-3xl bg-[#e3f0e5] p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(21,50,35,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#28704d]"><BotMessageSquare className="size-5" /></span><ArrowLeft className="size-4 text-[#4f7962] transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-[#1e4e37]">مساعد استقبال الطلبات</p><p className="mt-2 text-sm leading-6 text-[#597767]">اكتب ما تحتاجه، وسيساعدك المساعد على تنظيمه وتحويله إلى مسودة طلب قابلة للمراجعة.</p></button><button onClick={() => setLocation("/hr-system")} className="group overflow-hidden rounded-3xl bg-[#f5e7d2] p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(92,56,22,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#9a5b1f]"><WandSparkles className="size-5" /></span><ArrowLeft className="size-4 text-[#957146] transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-[#69451e]">مصمم نظام الموارد البشرية</p><p className="mt-2 text-sm leading-6 text-[#836441]">أدخل نشاط الشركة وحجمها، ثم أنشئ مخطط نظام موارد بشرية مناسباً لمراحل العمل القادمة.</p></button>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-[#e5eae5] bg-white p-6 shadow-[0_10px_28px_rgba(21,50,35,0.04)]">
            <div className="flex items-start justify-between"><div><h2 className="font-bold text-[#173e30]">متابعة طلباتك</h2><p className="mt-1 text-xs text-[#7a877f]">ستظهر هنا التحديثات فور تسجيل طلبك.</p></div><Button variant="outline" onClick={() => setLocation("/my-requests")} className="h-8 rounded-lg border-[#d6e1d7] text-xs text-[#2c684e]">عرض الطلبات</Button></div>
            <div className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d6e3d8] bg-[#fbfcfa] px-5 py-9 text-center"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf4ed] text-[#3b7c59]"><Clock3 className="size-5" /></div><p className="mt-3 text-sm font-semibold text-[#425449]">لا توجد طلبات للعرض حالياً</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#849087]">استخدم زر «ابدأ طلباً جديداً» لتقديم أول طلب لك ومتابعة حالة معالجته من هنا.</p></div>
          </div>
          <aside className="rounded-3xl bg-[#f0e4d1] p-6"><p className="text-xs font-bold text-[#9a5d20]">معلومة سريعة</p><h2 className="mt-3 text-xl font-bold leading-8 text-[#60401e]">التفاصيل الدقيقة تسرّع إنجاز الطلب.</h2><p className="mt-3 text-xs leading-6 text-[#85613b]">أرفق المعلومات الأساسية واستخدم وصفاً واضحاً ليتمكن الفريق المختص من متابعة معاملتك بكفاءة.</p></aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.07] p-3"><p className="text-[10px] font-semibold text-[#b7d1d4]">{label}</p><p className="mt-2 text-lg font-bold text-[#f4f0e8]">{value}</p></div>; }
function QuickMetric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="pressable rounded-2xl bg-white/80 p-4 hover:bg-white"><p className="text-xs font-semibold text-[#526b69]">{label}</p><p className="mt-2 text-xl font-bold text-[#092a28]">{value}</p><p className="mt-1 text-[11px] text-[#0a8060]">{detail}</p></article>; }
function signed(value: number) { return `${value >= 0 ? "+" : ""}${value}`; }
