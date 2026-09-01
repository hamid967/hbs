import DashboardLayout from "@/components/DashboardLayout";
import ManagerKPISummary from "@/components/ManagerKPISummary";
import PerformanceTrendsChart from "@/components/PerformanceTrendsChart";
import SmartNotificationsBanner from "@/components/SmartNotificationsBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BotMessageSquare,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  Clock3,
  CreditCard,
  FilePlus2,
  FileText,
  Landmark,
  Orbit,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const serviceCards = [
  {
    title: "طلب موارد بشرية (HR)",
    detail: "الإجازات، التعريف بالراتب، تحديث البيانات الوظيفية، ومزيد من الخدمات الذاتية.",
    icon: Building2,
    badge: "خدمة ذاتية",
    tone: "bg-ds-brand-50 text-ds-brand-900 border-ds-brand-200",
    path: "/requests/new?type=hr",
  },
  {
    title: "طلب علاقات وتكامل حكومي",
    detail: "معاملات منصات قوى، مقيم، مدد، التأشيرات وتجديد الإقامات والتوثيق الرسمي.",
    icon: Landmark,
    badge: "ربط سيادي",
    tone: "bg-ds-success-soft text-ds-brand-900 border-ds-success-border",
    path: "/requests/new?type=government",
  },
];

const categoryPillars = [
  {
    title: "مساحة العمل",
    titleEn: "Workspace",
    icon: Zap,
    desc: "إدارة الطلبات، صندوق العمل، والمعاملات اليومية",
    path: "/my-requests",
    badge: "العمليات الحية",
    color: "from-ds-brand-500/10 to-ds-brand-700/5 text-ds-brand-950 border-ds-brand-200",
  },
  {
    title: "الموظفون والأفراد",
    titleEn: "People",
    icon: UsersRound,
    desc: "دليل الموظفين، العقود، والتوظيف والأداء",
    path: "/employees",
    badge: "إدارة الكوادر",
    color: "from-ds-emerald/10 to-ds-brand-500/5 text-ds-ink border-ds-success-border",
  },
  {
    title: "الوقت والدوام",
    titleEn: "Time",
    icon: Clock3,
    desc: "سجل الحضور، الورديات، وأرصدة الإجازات",
    path: "/attendance",
    badge: "الامتثال الزمني",
    color: "from-ds-brand-600/10 to-ds-brand-800/5 text-ds-brand-950 border-ds-brand-200",
  },
  {
    title: "المالية والرواتب",
    titleEn: "Finance",
    icon: ReceiptText,
    desc: "مسيرات الرواتب (WPS مدد)، النفقات والاشتراكات",
    path: "/reports",
    badge: "حماية الأجور",
    color: "from-ds-gold/15 to-ds-warning-soft text-ds-ink border-ds-gold/30",
  },
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setIntroVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8" dir="rtl">
        {/* Intro transition overlay */}
        <div
          aria-hidden={!introVisible}
          className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-ds-brand-950 transition-opacity duration-300 ${
            introVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="premium-grid absolute inset-0 opacity-70" />
          <div className="intro-emerge relative flex flex-col items-center">
            <div className="relative grid size-24 place-items-center rounded-[2rem] border border-ds-brand-400/50 bg-white/10 text-ds-brand-300 shadow-[0_0_0_16px_rgba(34,117,89,.12),0_32px_70px_rgba(0,0,0,.4)]">
              <Orbit className="size-10 text-ds-brand-300" />
              <span className="signal-breathe absolute -bottom-1 -left-1 size-3.5 rounded-full bg-ds-emerald-bright" />
            </div>
            <p className="mt-5 text-sm font-bold tracking-widest text-white">حلول الغد · HR HBS 2030</p>
            <p className="mt-1 text-xs font-semibold text-ds-brand-200">المنظومة السيادية الموحدة</p>
          </div>
        </div>

        {/* ── Executive Hero Banner ─────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-ds-brand-950 via-ds-brand-900 to-ds-brand-950 px-6 py-8 text-white shadow-2xl md:px-10 md:py-12 border border-ds-brand-800/60">
          <div aria-hidden="true" className="premium-grid absolute inset-0 opacity-40" />
          <div aria-hidden="true" className="premium-shine absolute inset-0" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-ds-gold/30 bg-ds-gold/10 px-3.5 py-1 text-xs font-bold text-ds-gold">
                <Sparkles className="size-3.5 text-ds-gold" />
                <span>منظومة الامتثال والموارد البشرية السيادية 2030</span>
              </div>

              <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                كل طلب إداري يبدأ بانضباط،
                <br />
                <span className="text-ds-brand-300">وينتهي بأثر تشغيلي موثق.</span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
                قدّم طلبك، وتابع مراحل الاعتماد والربط الحكومي لحظة بلحظة ضمن مسارات متوافقة مع لوائح وزارة الموارد البشرية ونظام حماية الأجور (WPS مدد).
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => setLocation("/requests/new")}
                  size="lg"
                  className="pressable h-12 rounded-2xl bg-gradient-to-r from-ds-brand-600 to-ds-brand-700 px-6 font-black text-white hover:from-ds-brand-700 hover:to-ds-brand-800 shadow-lg shadow-ds-brand-950/40"
                >
                  <FilePlus2 className="ml-2 size-4" />
                  إنشاء طلب جديد الآن
                </Button>

                <Button
                  onClick={() => setLocation("/assistant")}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-2xl border-white/20 bg-white/5 px-5 font-bold text-white hover:bg-white/10"
                >
                  <BotMessageSquare className="ml-2 size-4 text-ds-brand-300" />
                  المساعد الذكي «حامد»
                </Button>
              </div>
            </div>

            {/* Quick Executive Live Pulse Box */}
            <div className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/[.08] p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-ds-brand-300" />
                  حالة الامتثال التشغيلي
                </span>
                <span className="rounded-full bg-ds-emerald/20 border border-ds-emerald-soft/30 px-2.5 py-0.5 text-[11px] font-bold text-ds-emerald-soft">
                  نشط ومطابق
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MetricTile
                  label="أيام الإجازات"
                  value={reportLoading ? "—" : report ? String(report.leaveDays.current) : "0"}
                />
                <MetricTile
                  label="المصروفات المعتمدة"
                  value={reportLoading ? "—" : report ? `${report.expensesSar.current.toLocaleString("ar-SA")} ر.س` : "0 ر.س"}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-ds-brand-300">سلسلة الاعتماد والموافقات</p>
                  <ChartNoAxesCombined className="size-4 text-ds-brand-400" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  المعاملات تُحوّل تلقائياً بحسب مصفوفة الصلاحيات المعتمدة للمنشأة.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="size-2 rounded-full bg-ds-emerald-bright animate-pulse" />
                  <span className="h-0.5 flex-1 bg-white/20" />
                  <span className="size-2 rounded-full bg-ds-brand-400" />
                  <span className="h-0.5 flex-1 bg-white/20" />
                  <span className="size-2 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Smart Urgent Notifications System ───────────────────── */}
        <SmartNotificationsBanner />

        {/* ── Executive KPI Summary Card Section for Managers ────────── */}
        <ManagerKPISummary />

        {/* ── Performance Trends Chart (Recharts) ───────────────────── */}
        <PerformanceTrendsChart />

        {/* ── Grouped Pillars Quick Navigation (Workspace, People, Time, Finance) ─ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">الأقسام الرئيسية الأربعة</h2>
              <p className="text-xs text-slate-500">الوصول السريع لمحاور المنظومة المنظمة</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <button
                  key={pillar.title}
                  onClick={() => setLocation(pillar.path)}
                  className={`group flex flex-col justify-between rounded-3xl border bg-gradient-to-br ${pillar.color} p-5 text-right transition duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-black/5 text-slate-700">
                      {pillar.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="font-bold text-slate-950 text-base">{pillar.title}</h3>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">({pillar.titleEn})</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs font-bold">
                    <span className="text-slate-900 group-hover:text-ds-brand-700 transition">استعراض القسم</span>
                    <ArrowLeft className="size-3.5 text-slate-400 group-hover:-translate-x-1 group-hover:text-ds-brand-700 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Monthly Operations Pulse Strip ─────────────────────────── */}
        <section className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-950">نبض العمليات الشهرية</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                مؤشرات محدثة مباشرة من مركز التقارير والتحليلات.
              </p>
            </div>
            <button
              onClick={() => setLocation("/reports")}
              className="pressable rounded-xl bg-ds-brand-50 border border-ds-brand-200 px-3.5 py-1.5 text-xs font-bold text-ds-brand-800 hover:bg-ds-brand-100 transition"
            >
              عرض التقرير التفصيلي
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {reportLoading ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))
            ) : reportError || !report ? (
              <div className="md:col-span-3 rounded-2xl bg-slate-50 p-4 text-center text-xs leading-6 text-slate-500 border border-dashed border-slate-200">
                لا تتوفر مؤشرات التقارير لهذا الحساب حالياً أو لم يتم تسجيل حركات هذا الشهر.
              </div>
            ) : (
              <>
                <QuickMetric
                  label="أيام الإجازات المعتمدة"
                  value={String(report.leaveDays.current)}
                  detail={`فرق ${signed(report.leaveDays.delta)} يوم عن الشهر السابق`}
                />
                <QuickMetric
                  label="إجمالي المصروفات"
                  value={`${report.expensesSar.current.toLocaleString("ar-SA")} ر.س`}
                  detail={`فرق ${signed(report.expensesSar.delta)} ر.س عن الشهر السابق`}
                />
                <QuickMetric
                  label="نطاق البيانات المصرح"
                  value={report.scope === "team" ? "نطاق الفريق" : "كامل المنشأة"}
                  detail={`محدث لدورة شهر ${report.selectedMonth}`}
                />
              </>
            )}
          </div>
        </section>

        {/* ── 10-Member Sovereign Advisory & Expert Team Section ───── */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-ds-brand-50 border border-ds-brand-200 px-3 py-0.5 text-xs font-bold text-ds-brand-800">
                <UsersRound className="size-3.5 text-ds-brand-600" />
                <span>فريق العمل الاستشاري المعتمد (10 خبراء ومستشارين)</span>
              </div>
              <h2 className="text-lg font-black text-slate-950">استشارات الامتثال ونظام العمل والرواتب الفورية</h2>
              <p className="text-xs text-slate-500">
                تواصل مع نخبة المستشارين في لوائح وزارة الموارد البشرية، منصة مدد WPS، والتأمينات الاجتماعية بنقرة واحدة.
              </p>
            </div>
            <Button
              onClick={() => setLocation("/consulting-hub")}
              className="h-10 rounded-xl bg-ds-brand-600 hover:bg-ds-brand-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              عرض مركز الخبراء بالكامل (10) <ArrowLeft className="mr-1.5 size-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "المستشار د. إبراهيم الهذلي",
                role: "كبير المستشارين القانونيين",
                spec: "م 77، م 84 والنزاعات العمالية",
                color: "bg-ds-brand-50 text-ds-brand-900 border-ds-brand-200",
                badge: "قانون العمل",
              },
              {
                name: "أ. حازم رضوان",
                role: "رئيس قطاع الأجور WPS",
                spec: "تدقيق ملفات مدد ومسيرات SIF",
                color: "bg-ds-gold-soft text-ds-warning-deep border-ds-gold/30",
                badge: "حماية الأجور",
              },
              {
                name: "أ. فيصل الدوسري",
                role: "مدير العلاقات الحكومية GRO",
                spec: "قوى، مقيم، ورادار الـ 7 مستويات",
                color: "bg-ds-success-soft text-ds-brand-900 border-ds-success-border",
                badge: "المنصات الحكومية",
              },
              {
                name: "أ. ليلى الحربي",
                role: "أخصائية التأمينات ونطاقات",
                spec: "أوزان التوطين واشتراكات GOSI",
                color: "bg-ds-neutral-100 text-ds-neutral-900 border-ds-neutral-200",
                badge: "التأمينات ونطاقات",
              },
            ].map((exp, idx) => (
              <div
                key={idx}
                onClick={() => setLocation("/consulting-hub")}
                className={`rounded-2xl border ${exp.color} p-4 transition duration-200 hover:-translate-y-1 hover:shadow-sm cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-black/5">
                      {exp.badge}
                    </span>
                    <span className="size-2 rounded-full bg-ds-emerald" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">{exp.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{exp.role}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{exp.spec}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-ds-brand-800">
                  <span>طلب توجيه استشاري</span>
                  <ChevronLeft className="size-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Superior Model Comparison Highlight (HBS vs Jisr) ───────── */}
        <section className="rounded-3xl border border-ds-brand-200/80 bg-gradient-to-br from-ds-brand-50/40 via-white to-ds-neutral-50 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-ds-brand-100 text-ds-brand-900 border border-ds-brand-200 mb-2 inline-block">
                مقارنة تقنية وتشغيلية
              </span>
              <h2 className="text-lg font-black text-slate-950">
                منظومة HBS 2030 السيادية: معمارية متطورة تتفوق على أنظمة HR التقليدية
              </h2>
            </div>
            <Button
              onClick={() => setLocation("/consulting-hub")}
              variant="outline"
              size="sm"
              className="rounded-xl border-ds-brand-200 bg-white text-ds-brand-900 hover:bg-ds-brand-50 font-bold text-xs"
            >
              استعراض المزايا الكاملة
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-ds-emerald font-bold text-xs mb-1.5">
                <Sparkles className="size-4" />
                <span>ذكاء تفسيري vs إدخال يدوي</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                «حامد» يفسر القرارات ويربطها بنصوص نظام العمل، بدلاً من مجرد شاشات إدخال صامتة في أنظمة مثل جسر.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-ds-brand-600 font-bold text-xs mb-1.5">
                <ShieldCheck className="size-4" />
                <span>تدقيق WPS 3.0 الاستباقي</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                كشف فوري لفروقات الرواتب والتأمينات قبل الرفع لمنصة مدد لتفادي رفض البنوك أو إيقاف الخدمات.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-ds-warning-deep font-bold text-xs mb-1.5">
                <UsersRound className="size-4" />
                <span>فريق خبراء استشاري مدمج</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                10 خبراء ومستشارين معتمدين في كل تخصص داخل النظام لتقديم التوجيه والمذكرات الرسمية الموقعة.
              </p>
            </div>
          </div>
        </section>

        {/* ── Services Section ──────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">الخدمات الإدارية المتاحة</h2>
              <p className="mt-0.5 text-xs text-slate-500">اختر المجال المناسب لبدء وتتبع المعاملة.</p>
            </div>
            <button
              onClick={() => setLocation("/requests/new")}
              className="flex items-center gap-1 text-xs font-bold text-ds-brand-700 hover:text-ds-brand-900 transition"
            >
              عرض جميع الخدمات <ChevronLeft className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map((card) => (
              <button
                key={card.title}
                onClick={() => setLocation(card.path)}
                className={`group flex items-start gap-4 rounded-3xl border ${card.tone} p-6 text-right transition duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-black/5">
                  <card.icon className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-950 text-base">{card.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-black/5">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">{card.detail}</p>
                </div>
                <ArrowLeft className="mt-1 size-5 text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-ds-brand-800" />
              </button>
            ))}
          </div>
        </section>

        {/* ── Smart Assistants & Design Tools ───────────────────────── */}
        <section className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setLocation("/assistant")}
            className="group overflow-hidden rounded-3xl border border-ds-brand-200 bg-gradient-to-br from-ds-brand-50/70 via-white to-ds-brand-50/30 p-6 text-right transition duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-ds-brand-600 text-white shadow-sm">
                <BotMessageSquare className="size-6" />
              </span>
              <span className="rounded-full bg-ds-brand-100 text-ds-brand-800 text-[10px] font-bold px-2.5 py-0.5">
                مساعد ذكي مدعوم بـ AI
              </span>
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-950">مساعد استقبال وتجهيز الطلبات «حامد»</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              اكتب ما تحتاجه باللغة الطبيعية، وسيقوم المساعد بتصنيف المعاملة، وتعبئة الحقول الأساسية وتوجيهها للمسار الصحيح.
            </p>
          </button>

          <button
            onClick={() => setLocation("/hr-system")}
            className="group overflow-hidden rounded-3xl border border-ds-gold/30 bg-gradient-to-br from-ds-gold-soft via-white to-ds-brand-50/20 p-6 text-right transition duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-ds-gold text-ds-brand-950 shadow-sm font-black">
                <WandSparkles className="size-6 text-white" />
              </span>
              <span className="rounded-full bg-ds-gold/20 text-ds-warning-deep text-[10px] font-bold px-2.5 py-0.5">
                مخطط الهيكلة
              </span>
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-950">مصمم نظام الموارد البشرية واللوائح</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              أدخل نشاط المنشأة وعدد الموظفين، ثم ولّد مخططاً متكاملاً للوائح الداخلية، سياسات الإجازات ومسارات الاعتماد.
            </p>
          </button>
        </section>

        {/* ── My Requests Quick Tracking & Tip ──────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-950 text-base">متابعة أحدث المعاملات</h3>
                <p className="text-xs text-slate-500">ستظهر هنا التحديثات المباشرة فور تسجيل ومراجعة طلباتك.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/my-requests")}
                className="rounded-xl border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                عرض كافة الطلبات
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-ds-brand-700 shadow-sm border border-slate-200">
                <Clock3 className="size-5" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900">سجل المعاملات والطلبات</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                استخدم زر «إنشاء طلب جديد» لتقديم معاملتك ومتابعة توقيع وموافقة المسؤولين خطوة بخطوة.
              </p>
            </div>
          </div>

          <aside className="rounded-3xl border border-ds-gold/40 bg-gradient-to-br from-ds-gold-soft to-ds-warning-soft p-6 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ds-gold" />
              <p className="text-xs font-extrabold text-ds-warning-deep uppercase tracking-wide">توجيه تنفيذي معتمد</p>
            </div>
            <h3 className="text-lg font-black text-ds-ink leading-snug">
              التفاصيل الدقيقة تسرّع دورة اعتماد المعاملة.
            </h3>
            <p className="text-xs leading-relaxed text-ds-neutral-600">
              إرفاق الوثائق الرسمية وكتابة مبررات الطلب بدقة يُمكّن مسؤولي الموارد البشرية والعلاقات الحكومية من إنجاز معاملتك في أقل من 24 ساعة عمل.
            </p>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.07] p-3.5">
      <p className="text-[11px] font-semibold text-slate-300">{label}</p>
      <p className="mt-1.5 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function QuickMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="pressable rounded-2xl border border-slate-100 bg-slate-50/80 p-4 hover:bg-white hover:border-slate-200 transition">
      <p className="text-xs font-bold text-slate-600">{label}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-ds-brand-700">{detail}</p>
    </article>
  );
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

