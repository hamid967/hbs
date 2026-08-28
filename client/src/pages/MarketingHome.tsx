import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowUpLeft,
  BotMessageSquare,
  Building2,
  Check,
  ChevronLeft,
  ClipboardCheck,
  LockKeyhole,
  Menu,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HeroThreeScene, type OperationsPulse } from "@/components/HeroThreeScene";

const capabilities = [
  { number: "01", icon: UsersRound, title: "رحلة الموظف", text: "طلبات ومتابعة وسجل واضح في تجربة عربية منظمة." },
  { number: "02", icon: ClipboardCheck, title: "قرار منضبط", text: "تسلسل مراجعة يوضح المرحلة التالية والمسؤول عنها." },
  { number: "03", icon: Building2, title: "عمليات مترابطة", text: "مساحة واحدة للموارد البشرية والعلاقات الحكومية." },
  { number: "04", icon: Sparkles, title: "إشارة قابلة للقياس", text: "مؤشرات تعمل ضمن نطاق الصلاحيات المتاح للحساب." },
];

export default function MarketingHome() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const month = new Date().toISOString().slice(0, 7);
  const { data: report, isLoading, isError } = trpc.reports.monthly.useQuery({ month });

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-ds-ivory text-ds-ink-strong">
      <section className="relative isolate overflow-hidden bg-ds-ink-strong text-ds-ivory">
        <div aria-hidden="true" className="premium-grid absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="premium-shine absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px premium-hairline" />
        <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onNavigate={setLocation} />

        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-10 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <div className="intro-emerge inline-flex items-center gap-2 rounded-full border border-ds-gold/35 bg-ds-ivory/[0.06] px-3 py-2 text-[11px] font-bold tracking-[0.08em] text-ds-gold-soft">
              <span className="signal-breathe size-1.5 rounded-full bg-ds-emerald" />
              نظام تشغيل للموارد البشرية والعلاقات الحكومية
            </div>
            <div className="intro-emerge-delay">
              <p className="mt-8 text-xs font-bold tracking-[0.18em] text-ds-gold">حلول الغد | HR HBS</p>
              <h1 className="premium-wordmark mt-4 max-w-3xl text-[2.75rem] font-bold leading-[1.13] sm:text-6xl lg:text-7xl">
                تشغيل أكثر وضوحاً.<br />
                <span className="text-ds-mist">قرار أكثر ثقة.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-ds-neutral-300 sm:text-lg">
                منصة عربية مصممة لتمنح فرقك مساراً هادئاً، واضحاً، وقابلاً للمتابعة من أول طلب حتى اكتمال الإجراء.
              </p>
            </div>
            <div className="intro-emerge-late mt-9 flex flex-wrap gap-3">
              <Button onClick={() => setLocation("/request-demo")} size="lg" className="pressable h-12 rounded-full bg-ds-emerald px-6 font-bold text-ds-ink hover:bg-ds-emerald-bright">
                اطلب عرضاً مخصصاً <ArrowLeft className="mr-2 size-4" />
              </Button>
              <Button onClick={() => setLocation("/app")} size="lg" variant="outline" className="pressable h-12 rounded-full border-ds-ivory/30 bg-transparent px-6 font-bold text-ds-ivory hover:bg-white/10 hover:text-ds-ivory">
                دخول المنصة <ArrowUpLeft className="mr-2 size-4" />
              </Button>
            </div>
            <div className="intro-emerge-late mt-11 flex flex-wrap gap-x-6 gap-y-3 border-t border-ds-ivory/10 pt-6 text-xs font-semibold text-ds-mist">
              <span className="flex items-center gap-1.5"><Check className="size-4 text-ds-emerald" />واجهة عربية أصلية</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-ds-emerald" />مسارات وصول واضحة</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 text-ds-emerald" />بيانات ضمن الصلاحية</span>
            </div>
          </div>
          <HeroArtifact pulse={report?.operationPulse} report={report} loading={isLoading} />
        </div>
      </section>

      <OperationsBand report={report} loading={isLoading} error={isError} onOpen={() => setLocation("/reports")} />

      <section id="platform" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[.76fr_1.24fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-ds-success">بنية واجهة مصممة للوضوح</p>
            <h2 className="premium-wordmark mt-4 text-4xl font-bold leading-tight text-ds-ink sm:text-5xl">تجربة تبدو هادئة، وتعمل بعمق.</h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-ds-teal-600">لا تتطلب العمليات المعقدة واجهات مزدحمة. تجمع حلول الغد نقاط البداية والتنفيذ والمتابعة في لغة بصرية واحدة تحترم الوقت والسياق.</p>
        </div>
        <div className="mt-14 grid overflow-hidden border-y border-ds-neutral-300 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => <Capability key={item.number} {...item} />)}
        </div>
      </section>

      <section id="benefits" className="bg-ds-neutral-200 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-10">
          <div className="relative min-h-[370px] overflow-hidden rounded-[2rem] bg-ds-ink">
            <img src="/manus-storage/hrhbs-premium-flow_c19a9c61.png" alt="تدفق بصري مجرد يرمز إلى تنظيم العمليات" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-ds-ink/5 via-ds-ink/25 to-ds-ink/70" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-ds-ivory sm:p-9">
              <p className="text-xs font-bold tracking-[0.15em] text-ds-gold">إيقاع تشغيلي واحد</p>
              <p className="mt-3 max-w-sm text-2xl font-bold leading-9">كل مرحلة مرئية، وكل خطوة تقود لما بعدها.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold tracking-[0.16em] text-ds-success">من الإشارة إلى الإجراء</p>
            <h2 className="premium-wordmark mt-4 text-4xl font-bold leading-tight text-ds-ink">قالب مؤسسي لا يساوم على المسار.</h2>
            <div className="mt-8 space-y-5">
              <ProcessStep number="01" title="يبدأ الطلب بسياق واضح" text="واجهات موجهة تمنح الموظف بداية مناسبة للخدمة." />
              <ProcessStep number="02" title="يتحرك القرار عبر المسار" text="يعرض النظام المرحلة الحالية ضمن حدود الصلاحيات." />
              <ProcessStep number="03" title="يبقى الأثر قابلاً للمتابعة" text="تظهر المؤشرات والتحديثات لمن يملك نطاق الوصول المناسب." />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ds-ink-strong py-24 text-ds-ivory">
        <div aria-hidden="true" className="premium-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-9 px-5 sm:px-8 lg:flex-row lg:items-end lg:px-10">
          <div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.16em] text-ds-gold">الخطوة التالية</p><h2 className="premium-wordmark mt-4 text-4xl font-bold leading-tight sm:text-5xl">اجعل التجربة الداخلية امتداداً لمستوى عمل فريقك.</h2></div>
          <Button onClick={() => setLocation("/request-demo")} size="lg" className="pressable h-12 rounded-full bg-ds-ivory px-6 font-bold text-ds-ink hover:bg-white">ابدأ المحادثة <ArrowLeft className="mr-2 size-4" /></Button>
        </div>
      </section>

      <footer className="bg-ds-ink-strong px-5 pb-8 text-ds-mist sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs"><span>© حلول الغد | HR HBS</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-3" />مساحة عمل مقيدة بالصلاحيات</span></div></footer>
    </main>
  );
}

function Header({ menuOpen, onMenuToggle, onNavigate }: { menuOpen: boolean; onMenuToggle: () => void; onNavigate: (path: string) => void }) {
  return <header className="relative z-20 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="flex h-24 items-center justify-between border-b border-white/10"><button onClick={() => onNavigate("/")} className="flex items-center gap-3 text-right"><span className="grid size-10 place-items-center rounded-2xl border border-ds-gold/40 bg-ds-ivory/10 text-base font-bold text-ds-ivory">هـ</span><span><b className="premium-wordmark block text-base">حلول الغد</b><small className="block text-[9px] font-bold tracking-[0.25em] text-ds-mist">HR HBS</small></span></button><nav className="hidden items-center gap-8 text-sm font-semibold text-ds-neutral-300 lg:flex"><a className="pressable hover:text-ds-ivory" href="#platform">المنصة</a><a className="pressable hover:text-ds-ivory" href="#insights">نبض العمليات</a><a className="pressable hover:text-ds-ivory" href="#benefits">المنهج</a></nav><div className="hidden items-center gap-2 lg:flex"><Button onClick={() => onNavigate("/app")} variant="ghost" className="pressable rounded-full text-ds-ivory hover:bg-white/10 hover:text-ds-ivory">تسجيل الدخول</Button><Button onClick={() => onNavigate("/request-demo")} className="pressable rounded-full bg-ds-emerald font-bold text-ds-ink hover:bg-ds-emerald-bright">اطلب عرضاً</Button></div><button onClick={onMenuToggle} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} className="grid size-10 place-items-center rounded-xl border border-white/15 text-ds-ivory lg:hidden">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>{menuOpen && <div className="premium-glass absolute inset-x-5 top-[5.75rem] rounded-2xl p-4 lg:hidden"><div className="grid gap-2 text-sm font-semibold text-ds-ivory"><a onClick={onMenuToggle} href="#platform" className="rounded-lg px-3 py-2 hover:bg-white/10">المنصة</a><a onClick={onMenuToggle} href="#insights" className="rounded-lg px-3 py-2 hover:bg-white/10">نبض العمليات</a><button onClick={() => onNavigate("/app")} className="rounded-lg px-3 py-2 text-right hover:bg-white/10">دخول المنصة</button></div></div>}</header>;
}

function HeroArtifact({ pulse, report, loading }: { pulse?: OperationsPulse; report: any; loading: boolean }) {
  const statuses = pulse ? [
    { label: "طلبات جديدة", value: String(pulse.requests.submitted).padStart(2, "0") },
    { label: "قيد المراجعة", value: String(pulse.requests.inReview).padStart(2, "0") },
    { label: "قرارات معلقة", value: String(pulse.approvals.pending).padStart(2, "0") },
  ] : [];
  return <div className="intro-emerge-delay relative mx-auto w-full max-w-[560px]"><div className="float-soft relative min-h-[440px] overflow-hidden rounded-[2.25rem] border border-white/15 bg-ds-ink shadow-[0_34px_80px_rgba(0,0,0,.35)]"><img src="/manus-storage/hrhbs-premium-hero_62f89147.png" alt="مجسم ثلاثي الأبعاد مجرد لمنصة حلول الغد" className="absolute inset-0 h-full w-full object-cover object-left" /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ds-ink-strong/90 via-ds-ink-strong/10 to-transparent" /><HeroThreeScene pulse={pulse} /><div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-white/15 bg-ds-ink-strong/70 p-4 backdrop-blur-md"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-ds-gold">نظرة التنفيذ</p><p className="mt-1 text-sm font-bold text-ds-ivory">{pulse ? "إشارات ضمن نطاقك المصرح" : loading ? "جارٍ تجهيز الإشارات" : "سجّل الدخول لعرض الإشارات"}</p></div><span className={`size-2.5 rounded-full ${pulse ? "signal-breathe bg-ds-emerald" : "bg-ds-mist/60"}`} /></div>{statuses.length ? <div className="mt-4 grid grid-cols-3 gap-2">{statuses.map((status) => <div key={status.label} className="rounded-xl bg-white/[.07] px-2 py-3"><p className="text-lg font-bold text-ds-ivory">{status.value}</p><p className="mt-1 text-[9px] font-semibold text-ds-mist">{status.label}</p></div>)}</div> : <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-ds-mist">تحافظ المنصة على خصوصية بيانات العمليات وتعرضها وفق الصلاحيات فقط.</p>}</div></div><div className="absolute -bottom-5 -right-5 rounded-2xl border border-ds-gold/35 bg-ds-ivory px-4 py-3 text-ds-ink shadow-xl"><p className="text-[10px] font-bold tracking-[0.14em] text-ds-warning-strong">HR HBS</p><p className="mt-1 text-xs font-bold">وضوح بصري. أثر منضبط.</p></div></div>;
}

function OperationsBand({ report, loading, error, onOpen }: { report: any; loading: boolean; error: boolean; onOpen: () => void }) {
  const stats = report ? [{ label: "أيام الإجازات", value: String(report.leaveDays.current), detail: `الشهر ${report.selectedMonth}` }, { label: "المصروفات", value: `${report.expensesSar.current.toLocaleString("ar-SA")} ر.س`, detail: `الشهر ${report.selectedMonth}` }, { label: "نطاق البيانات", value: report.scope === "team" ? "فريقي" : "الشركة", detail: "حسب الصلاحية" }] : [];
  return <section id="insights" className="relative z-10 mx-auto -mt-8 max-w-6xl px-5 sm:px-8 lg:px-10"><div className="rounded-[1.75rem] border border-ds-neutral-300 bg-ds-ivory p-5 shadow-[0_20px_50px_rgba(7,26,26,.12)] sm:p-6"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold tracking-[0.14em] text-ds-success">نبض العمليات</p><h2 className="premium-wordmark mt-2 text-2xl font-bold text-ds-ink">قراءة حية في السياق الصحيح.</h2></div><button onClick={onOpen} className="pressable flex items-center gap-1 text-sm font-bold text-ds-brand-800 hover:text-ds-emerald">فتح مركز التقارير <ChevronLeft className="size-4" /></button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{loading ? [1, 2, 3].map((item) => <div key={item} className="h-[108px] animate-pulse rounded-2xl bg-ds-neutral-200" />) : error || !report ? <div className="rounded-2xl border border-dashed border-ds-neutral-300 bg-ds-neutral-100 p-5 text-sm leading-7 text-ds-teal-600 md:col-span-3">سجّل الدخول لعرض مؤشرات التقرير ضمن نطاق الشركة أو الفريق المخوّل.</div> : stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-ds-neutral-200 bg-white/80 p-5"><p className="text-xs font-semibold text-ds-teal-600">{stat.label}</p><p className="mt-2 text-2xl font-bold text-ds-ink">{stat.value}</p><p className="mt-1 text-[11px] font-medium text-ds-success">{stat.detail}</p></div>)}</div></div></section>;
}

function Capability({ number, icon: Icon, title, text }: { number: string; icon: typeof UsersRound; title: string; text: string }) { return <article className="group border-ds-neutral-300 px-0 py-8 md:border-l md:px-7 lg:last:border-l-0"><div className="flex items-start justify-between"><span className="text-xs font-bold tracking-[0.12em] text-ds-success">{number}</span><Icon className="size-5 text-ds-gold" /></div><h3 className="mt-10 text-xl font-bold text-ds-ink">{title}</h3><p className="mt-3 max-w-xs text-sm leading-7 text-ds-teal-600">{text}</p></article>; }

function ProcessStep({ number, title, text }: { number: string; title: string; text: string }) { return <div className="grid grid-cols-[auto_1fr] gap-4"><span className="mt-0.5 grid size-8 place-items-center rounded-full bg-ds-ink text-[10px] font-bold text-ds-ivory">{number}</span><div><h3 className="font-bold text-ds-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-ds-teal-600">{text}</p></div></div>; }
