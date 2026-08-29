import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BotMessageSquare,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Coins,
  CreditCard,
  Crown,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Laptop,
  Layers,
  Lock,
  LockKeyhole,
  Menu,
  PhoneCall,
  Play,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  UsersRound,
  Users,
  X,
  Zap,
  Award,
  Maximize2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CinematicExecutiveIntro, COMPLETE_ENTERPRISE_TEAM } from "@/components/CinematicExecutiveIntro";
import { ExecutiveSlideDeck } from "@/components/ExecutiveSlideDeck";

// --- Government Integrations Constants ---
const GOVERNMENT_INTEGRATIONS = [
  { name: "منصة قوى (Qiwa)", role: "عقود العمل ولوائح المنشأة", status: "متوافق 100%", tag: "MHRSD" },
  { name: "منصة مدد (Mudad)", role: "نظام حماية الأجور (WPS)", status: "توليد فوري", tag: "WPS" },
  { name: "التأمينات (GOSI)", role: "احتساب الاشتراكات ونسب السعودة", status: "حساب آلي", tag: "GOSI" },
  { name: "منصة مقيم (Muqeem)", role: "رصد الإقامات والتأشيرات", status: "تنبيه استباقي", tag: "Passports" },
  { name: "سبل (Saudi Post)", role: "الترميز والعنوان الوطني", status: "تكامل مباشر", tag: "SPL" },
  { name: "النفاذ الوطني الموحد", role: "دخول آمن وموثوق للمنشآت", status: "دخول معتمد", tag: "SSO" },
];

const PLATFORM_PILLARS = [
  {
    id: "payroll",
    icon: FileSpreadsheet,
    badge: "نظام حماية الأجور",
    title: "محرك الرواتب والامتثال (WPS)",
    desc: "إعداد مسيرات الرواتب بضغطة زر مع احتساب خصومات التأمينات الاجتماعية (GOSI)، السلف، البدلات، وإصدار ملفات حماية الأجور المعتمدة لبنوك المملكة.",
    points: ["تصدير ملفات مدد WPS بدقة 100%", "حساب تلقائي لشرائح التأمينات (سعودي/وافد)", "متابعة السلف والمصروفات والخصومات"],
  },
  {
    id: "gov-relations",
    icon: ShieldAlert,
    badge: "رصد الوثائق",
    title: "مركز العلاقات الحكومية الاستباقي",
    desc: "لوحة تحكم ذكية ترصد انتهاء الإقامات، السجلات التجارية، رخص العمل، وعقود قوى عبر 7 مستويات تصاعدية (من 120 يوماً حتى التنبيه الحرج).",
    points: ["7 مستويات زمنية للتحذير قبل الانتهاء", "حساب تكاليف التجديد ورسوم المقابل المالي", "منع الغرامات الحكومية تماماً"],
  },
  {
    id: "hamed-ai",
    icon: BotMessageSquare,
    badge: "الذكاء الاصطناعي التفسيري",
    title: "وكيل العمليات الذكي «حامد»",
    desc: "مساعد تشغيلي يحلل الطلبات المعقدة، يقترح الإجراءات المناسبة استناداً إلى مواد نظام العمل السعودي، ولا ينفذ أي تغيير دون موافقة بشرية صريحة.",
    points: ["تفسير القرارات وفق مواد نظام العمل", "صياغة خطابات وقرارات إدارية فورية", "حوكمة صارمة مع تأكيد بشري إلزامي"],
  },
  {
    id: "workforce",
    icon: UsersRound,
    badge: "إدارة الكفاءات",
    title: "دليل الموظف والهيكل التنظيمي 360",
    desc: "منظومة شاملة لبيانات الموظفين، إدارة العقود، متابعة العهد والأصول، ومخطط تفاعلي للهيكل الإداري وتوزيع الصلاحيات (RBAC).",
    points: ["ملف موظف رقمي متكامل وشامل", "هيكل إداري متجاوب مع تسلسل الموافقات", "إخفاء وحماية البيانات الحساسة (PDPL)"],
  },
  {
    id: "time-leave",
    icon: Clock3,
    badge: "الدوام والإجازات",
    title: "إدارة الحضور والورديات والإجازات",
    desc: "تتبع دقيق للورديات، التأخير، ساعات العمل الإضافية، وأرصدة الإجازات السنوية والمرضية والاضطرارية وفق لائحة تنظيم العمل المعتمدة.",
    points: ["حساب أرصدة الإجازات اللحظية بدقة", "جدولة الورديات المرنة والمناوبات", "ربط مباشر بساعات مسير الرواتب"],
  },
  {
    id: "security",
    icon: Lock,
    badge: "الأمان والسيادة",
    title: "عزل تام للبيانات وحماية الخصوصية",
    desc: "بنية سحابية سيادية داخل المملكة العربية السعودية، متوافقة مع ضوابط هيئة الحكومة الرقمية ونظام حماية البيانات الشخصية السعودي.",
    points: ["عزل بيانات المنشآت المتعددة (Multi-Tenant)", "سجل تدقيق كامل لكافة الأنشطة (Audit Trail)", "تشفير متقدم للمعلومات والرواتب"],
  },
];

const FAQS = [
  {
    q: "هل النظام متوافق رسمياً مع نظام العمل السعودي ومنصات قوى ومدد؟",
    a: "نعم، تم تصميم منصة HBS 2030 من الأساس لتلبي كافة متطلبات وزارة الموارد البشرية والتنمية الاجتماعية، وتوليد ملفات حماية الأجور (WPS) المعتمدة لدى منصة مدد، مع ضبط احتساب نسب التأمينات الاجتماعية (GOSI) تلقائياً.",
  },
  {
    q: "كيف يعمل مساعد الذكاء الاصطناعي «حامد» وما مدى دقة قراراته؟",
    a: "«حامد» هو وكيل ذكاء اصطناعي تفسيري مدرب على لوائح العمل والأنظمة السعودية. يقوم بتحليل الطلبات والإجازات وتقديم توصيات مسندة للمادة القانونية، مع اشتراط تأكيد المشرف البشري قبل تنفيذ أي تعديل، مما يضمن دقة 100% وأماناً تشغيلياً كاملاً.",
  },
  {
    q: "هل يمكننا نقل بيانات الموظفين والعقود من أنظمتنا الحالية (جسر / Excel / Frappe)؟",
    a: "نعم، يوفر النظام أدوات استيراد ذكية تدعم ملفات Excel وCSV وقواعد البيانات المهيكلة، مع خدمة ترحيل بيانات شاملة وتدريب مجاني لفريق الموارد البشرية خلال 48 ساعة من الاشتراك.",
  },
  {
    q: "ما هي معايير الأمان وحماية البيانات المطبقة في HBS؟",
    a: "تخضع بيانات المنصة لنظام حماية البيانات الشخصية السعودي (PDPL) مع تشفير كامل بمستوى AES-256، وعزل صارم لحسابات كل منشأة (Multi-Tenant Isolation)، واستضافة سحابية متوافقة مع متطلبات الهيئة الوطنية للأمن السيبراني (NCA).",
  },
  {
    q: "هل يدعم النظام الشركات المتعددة والفروع ذات السجلات التجارية المختلفة؟",
    a: "نعم وبكل سهولة. تتيح المنصة للمجموعات والشركات القابضة إدارة عدة منشآت وفروع من لوحة تحكم واحدة، مع فصل المسيرات والموافقات والصلاحيات لكل كيان بشكل مستقل.",
  },
];

export default function MarketingHome() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">("slides");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"overview" | "payroll" | "gov" | "ai" | "ess">("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTeamCategory, setSelectedTeamCategory] = useState<string>("all");

  // Interactive ROI Simulator State
  const [employeeCount, setEmployeeCount] = useState<number>(85);
  const [sector, setSector] = useState<string>("tech");
  const [avgSalary, setAvgSalary] = useState<number>(9500);

  // Billing Cycle State for Pricing Section
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  // Calculations
  const calculatedSavings = useMemo(() => {
    const hoursSavedMonthly = Math.round(employeeCount * 1.6);
    const moneySavedMonthly = Math.round(hoursSavedMonthly * (avgSalary / 160) * 1.25);
    const annualSavings = moneySavedMonthly * 12;
    const penaltyRiskAvoidance = employeeCount > 50 ? 45000 : 20000;
    return {
      hoursSavedMonthly,
      moneySavedMonthly: moneySavedMonthly.toLocaleString("ar-SA"),
      annualSavings: annualSavings.toLocaleString("ar-SA"),
      penaltyRiskAvoidance: penaltyRiskAvoidance.toLocaleString("ar-SA"),
      saudizationScore: sector === "tech" ? "82% (نطاق بلاتيني)" : "76% (نطاق أخضر مرتفع)",
    };
  }, [employeeCount, sector, avgSalary]);

  const month = new Date().toISOString().slice(0, 7);
  const { data: report } = trpc.reports.monthly.useQuery({ month });

  const filteredTeamMembers = selectedTeamCategory === "all"
    ? COMPLETE_ENTERPRISE_TEAM
    : COMPLETE_ENTERPRISE_TEAM.filter((m) => m.category === selectedTeamCategory);

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-[#FDFDFB] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* ── $100K Cinematic Executive Intro Modal ────────────────────── */}
      <CinematicExecutiveIntro
        isOpen={showIntro}
        onComplete={() => setShowIntro(false)}
      />

      {/* ── Top Announcement Banner ─────────────────────────────────── */}
      <div className="bg-[#0A221A] text-emerald-300 px-4 py-2.5 text-center text-xs font-semibold border-b border-emerald-900/50 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          تحديث 2026 السيادي
        </span>
        <span>متوافق كلياً مع متطلبات نظام العمل السعودي المحدث ولائحة منصة مدد لحماية الأجور (WPS)</span>
        
        <button
          onClick={() => setShowIntro(true)}
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F5E6B8] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[11px] font-bold transition cursor-pointer mr-2 shadow-sm"
        >
          <Crown className="size-3 text-[#D4AF37]" />
          <span>تشغيل الانترو الفخم ($100K)</span>
        </button>

        <button 
          onClick={() => setLocation("/subscribe")} 
          className="hidden sm:inline-flex items-center gap-1 underline text-emerald-300 hover:text-white mr-2 font-bold cursor-pointer"
        >
          اطلب تجربة المنشآت <ChevronLeft className="size-3.5" />
        </button>
      </div>

      {/* ── Main Navigation Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0F2F24]/95 backdrop-blur-md border-b border-white/10 text-white transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            
            {/* Brand Logo & Monogram */}
            <button onClick={() => setLocation("/")} className="flex items-center gap-3 text-right group">
              <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18B982] to-[#0A8060] text-slate-950 font-black text-xl shadow-[0_0_24px_rgba(24,185,130,0.35)] transition group-hover:scale-105">
                هـ
                <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[#D4AF37] border-2 border-[#0F2F24]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">حلول الغد</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10">HBS 2030</span>
                </div>
                <p className="text-[10px] font-medium tracking-widest text-emerald-200/80">SAUDI INTELLIGENT ENTERPRISE</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-200">
              <a href="#deck" onClick={() => setViewMode("slides")} className="text-amber-300 hover:text-amber-200 flex items-center gap-1 transition font-bold">
                <Crown className="size-3.5 text-[#D4AF37]" />
                العرض التنفيذي (سلايدات)
              </a>
              <a href="#team" className="hover:text-emerald-400 transition">فريق العمل (10)</a>
              <a href="#pillars" className="hover:text-emerald-400 transition">المنظومة والحلول</a>
              <a href="#console" className="hover:text-emerald-400 transition">لوحة العمليات الحية</a>
              <a href="#pricing" className="hover:text-emerald-400 transition">باقات المنشآت</a>
              <a href="#simulator" className="hover:text-emerald-400 transition">حاسبة العائد</a>
              <a href="#faqs" className="hover:text-emerald-400 transition">الأسئلة الشائعة</a>
            </nav>

            {/* Header Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Mode Toggle Pills */}
              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/15 text-[11px] font-bold">
                <button
                  onClick={() => setViewMode("slides")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    viewMode === "slides"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Crown className="size-3" />
                  سلايدات فخمة
                </button>
                <button
                  onClick={() => setViewMode("scroll")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === "scroll"
                      ? "bg-white/20 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  تصفح كامل
                </button>
              </div>

              <Button
                onClick={() => setShowIntro(true)}
                variant="outline"
                className="h-9 rounded-xl text-xs font-bold text-[#F5E6B8] hover:bg-[#D4AF37]/20 border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3"
              >
                <Play className="size-3 ml-1 text-[#D4AF37]" />
                انترو $100K
              </Button>

              <Button
                onClick={() => setLocation("/login")}
                variant="ghost"
                className="h-9 rounded-xl text-xs font-bold text-white hover:bg-white/10 border border-white/15 px-3"
              >
                دخول
              </Button>

              <Button
                onClick={() => setLocation("/subscribe")}
                className="h-9 rounded-xl bg-gradient-to-r from-[#18B982] to-[#109E6D] hover:from-[#15A674] hover:to-[#0D855C] text-slate-950 font-bold text-xs px-4 shadow-lg shadow-emerald-950/40"
              >
                طلب اشتراك <ArrowLeft className="mr-1 size-3.5" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex size-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10"
              aria-label="القائمة الرئيسية"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0A221A] px-5 py-6 space-y-4">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-slate-300">طريقة العرض:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setViewMode("slides"); setMenuOpen(false); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${viewMode === "slides" ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-white"}`}
                >
                  سلايدات فخمة
                </button>
                <button
                  onClick={() => { setViewMode("scroll"); setMenuOpen(false); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${viewMode === "scroll" ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-white"}`}
                >
                  تصفح كامل
                </button>
              </div>
            </div>

            <nav className="grid gap-2 text-sm font-semibold text-slate-200">
              <button onClick={() => { setShowIntro(true); setMenuOpen(false); }} className="text-right px-3 py-2 rounded-lg bg-[#D4AF37]/15 text-[#F5E6B8] border border-[#D4AF37]/30 flex items-center gap-2">
                <Crown className="size-4 text-[#D4AF37]" />
                تشغيل الانترو الفخم ($100,000)
              </button>
              <a onClick={() => setMenuOpen(false)} href="#deck" className="px-3 py-2 rounded-lg hover:bg-white/5">العرض التنفيذي</a>
              <a onClick={() => setMenuOpen(false)} href="#team" className="px-3 py-2 rounded-lg hover:bg-white/5">فريق العمل (10)</a>
              <a onClick={() => setMenuOpen(false)} href="#pillars" className="px-3 py-2 rounded-lg hover:bg-white/5">المنظومة والحلول</a>
              <a onClick={() => setMenuOpen(false)} href="#console" className="px-3 py-2 rounded-lg hover:bg-white/5">لوحة العمليات الحية</a>
              <a onClick={() => setMenuOpen(false)} href="#pricing" className="px-3 py-2 rounded-lg hover:bg-white/5 text-amber-300">باقات المنشآت</a>
              <a onClick={() => setMenuOpen(false)} href="#simulator" className="px-3 py-2 rounded-lg hover:bg-white/5">حاسبة العائد</a>
              <a onClick={() => setMenuOpen(false)} href="#faqs" className="px-3 py-2 rounded-lg hover:bg-white/5">الأسئلة الشائعة</a>
            </nav>
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <Button onClick={() => { setMenuOpen(false); setLocation("/login"); }} variant="outline" className="w-full text-xs font-bold text-white border-white/20">
                تسجيل الدخول
              </Button>
              <Button onClick={() => { setMenuOpen(false); setLocation("/subscribe"); }} className="w-full text-xs font-bold bg-[#18B982] text-slate-950">
                طلب اشتراك
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── SECTION: LUXURY EXECUTIVE SLIDE DECK ──────────────────────── */}
      <section id="deck" className="relative">
        <ExecutiveSlideDeck
          onOpenIntro={() => setShowIntro(true)}
          pulse={report ? {
            requests: { submitted: 18, inReview: 6, completed: 84 },
            approvals: { pending: 4, approved: 72, rejected: 3 }
          } : undefined}
        />
      </section>

      {/* ── Hero Section: High Impact Saudi Enterprise ──────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2F24] via-[#0C271E] to-[#0A221A] text-white pt-12 pb-24 lg:pt-16 lg:pb-32 border-b border-emerald-950">
        
        {/* Subtle Decorative Geometric Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-[#18B982]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 size-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Saudi Enterprise Authority Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4AF37]/40 bg-white/[0.06] px-4 py-2 text-xs font-bold text-[#E7C89C] mb-8 shadow-inner">
              <span className="size-2 rounded-full bg-[#18B982] animate-pulse" />
              <span>معيار حلول الغد · متوافق 100% مع رؤية المملكة 2030 وأنظمة MHRSD</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight">
              نظام التشغيل السيادي لإدارة <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18B982] via-[#5DE0AD] to-[#D4AF37]">
                الموارد البشرية والامتثال الحكومي
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              تحكم فوري في مسيرات الرواتب وحماية الأجور (مدد)، رصد استباقي لانتهاء الإقامات والتأشيرات عبر 7 مستويات زمنية، وأتمتة القرارات عبر مساعد الذكاء الاصطناعي التفسيري «حامد».
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => setLocation("/subscribe")}
                size="lg"
                className="h-14 rounded-2xl bg-gradient-to-r from-[#18B982] to-[#109E6D] hover:from-[#15A674] hover:to-[#0D855C] text-slate-950 font-black text-base px-8 shadow-[0_10px_30px_rgba(24,185,130,0.3)] transition transform hover:-translate-y-0.5"
              >
                احجز عرضاً تنفيذياً مخصصاً <ArrowLeft className="mr-2 size-5" />
              </Button>
              <Button
                onClick={() => setLocation("/request-demo")}
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl border-white/25 bg-white/5 hover:bg-white/10 text-white font-bold text-base px-7 backdrop-blur-sm"
              >
                <Play className="ml-2 size-4 text-amber-300 fill-amber-300" />
                استكشف العرض التفاعلي
              </Button>
            </div>

            {/* Trust Markers Bar */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>حماية الأجور (مدد WPS)</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>رصد الإقامات والتراخيص</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>مساعد ذكي معتمد قانونياً</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>سيادة وأمان البيانات (PDPL)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Live Enterprise Console Showcase ────────────── */}
      <section id="console" className="relative z-10 -mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-[0_25px_60px_rgba(15,47,36,0.12)]">
          
          {/* Console Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-700">لوحة التحكم التفاعلية الحية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">تجربة تشغيلية متكاملة لفرق الموارد البشرية والقيادة</h2>
            </div>

            {/* Console Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveConsoleTab("overview")}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${activeConsoleTab === "overview" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                المؤشرات الحية
              </button>
              <button
                onClick={() => setActiveConsoleTab("payroll")}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${activeConsoleTab === "payroll" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                مسير الرواتب (WPS)
              </button>
              <button
                onClick={() => setActiveConsoleTab("gov")}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${activeConsoleTab === "gov" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                الجوازات والوثائق
              </button>
              <button
                onClick={() => setActiveConsoleTab("ai")}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${activeConsoleTab === "ai" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                الذكاء «حامد»
              </button>
              <button
                onClick={() => setActiveConsoleTab("ess")}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${activeConsoleTab === "ess" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                الخدمة الذاتية
              </button>
            </div>
          </div>

          {/* Console Active Content Screen */}
          <div className="mt-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeConsoleTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="text-xs font-bold text-slate-500">إجمالي القوى العاملة</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900">248 موظفاً</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+12 هذا الربع</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">سعودة: <strong className="text-emerald-700">78.4% (بلاتيني)</strong></p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                    <p className="text-xs font-bold text-emerald-900">امتثال حماية الأجور (WPS)</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-emerald-800">99.8%</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">معتمد بمدد</span>
                    </div>
                    <p className="mt-2 text-xs text-emerald-800">مسير شهر أغسطس مكتمل وجاهز للصرف</p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                    <p className="text-xs font-bold text-amber-900">وثائق تقترب من الانتهاء</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-amber-800">4 وثائق</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">&lt; 30 يوماً</span>
                    </div>
                    <p className="mt-2 text-xs text-amber-800">تم تجهيز طلبات التجديد آلياً للمسؤول</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="text-xs font-bold text-slate-500">طلبات وموافقات معلقة</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900">7 قرارات</span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">تتطلب تدخلك</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">متوسط زمن الاستجابة: <strong>2.4 ساعة</strong></p>
                  </div>
                </div>

                {/* Mini Visual Table Preview */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">أحدث العمليات والطلبات الجارية</span>
                    <span className="text-xs text-emerald-700 font-semibold">تحديث لحظي</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-bold text-slate-900">إجازة سنوية — م. عبدالله القحطاني (رئيس تطوير البرمجيات)</p>
                          <p className="text-slate-500">الرصيد المتبقي: 22 يوماً · تم التحقق من المادة 84</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">معتمد آلياً</span>
                    </div>
                    <div className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-amber-500" />
                        <div>
                          <p className="font-bold text-slate-900">تجديد إقامة — د. سارة منصور (أخصائية تقنية معلومات)</p>
                          <p className="text-slate-500">تنتهي خلال 18 يوماً · المقابل المالي جاهز للربط</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700">بانتظار سداد سداد</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYROLL */}
            {activeConsoleTab === "payroll" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">مسير رواتب شهر أغسطس 2026 (WPS)</h3>
                    <p className="text-xs text-slate-500">مطابق لبنوك المملكة ونظام مدد لحماية الأجور</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">ملف .TXT معتمد</span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold">التأمينات GOSI: 21.5%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <p className="text-xs text-slate-500">إجمالي الرواتب الأساسية</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">1,842,500 ر.س</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <p className="text-xs text-slate-500">خصومات واشتراكات التأمينات</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">198,320 ر.س</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-emerald-200 bg-emerald-50/30">
                    <p className="text-xs text-emerald-900">صافي الحوالات البنكية للموظفين</p>
                    <p className="text-2xl font-black text-emerald-800 mt-1">1,725,480 ر.س</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOV RELATIONS */}
            {activeConsoleTab === "gov" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">نظام الرصد الاستباقي للوثائق والإقامات (7 مستويات)</h3>
                  <span className="text-xs font-bold text-emerald-700">صفر مخالفات</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-white border border-emerald-200">
                    <p className="text-slate-500">120 يوماً</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">14</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200">
                    <p className="text-slate-500">90 يوماً</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">8</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sky-200">
                    <p className="text-slate-500">60 يوماً</p>
                    <p className="text-lg font-bold text-sky-700 mt-1">5</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-amber-200">
                    <p className="text-slate-500">30 يوماً</p>
                    <p className="text-lg font-bold text-amber-700 mt-1">3</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-orange-200">
                    <p className="text-slate-500">15 يوماً</p>
                    <p className="text-lg font-bold text-orange-700 mt-1">1</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-rose-200">
                    <p className="text-slate-500">7 أيام</p>
                    <p className="text-lg font-bold text-rose-700 mt-1">0</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                    <p className="text-slate-500">منتهية</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">0</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: HAMED AI */}
            {activeConsoleTab === "ai" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-950 text-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">ح</div>
                    <div>
                      <h4 className="font-bold text-sm">المساعد الذكي «حامد» · Hamed Co-pilot</h4>
                      <p className="text-[11px] text-emerald-300">مفسر نظام العمل والسياسات الداخلية</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-900/80 px-2.5 py-1 rounded-full text-emerald-300 border border-emerald-700">
                    ثقة 99.4% · مادة 84
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-900/50 border border-emerald-800 text-xs leading-relaxed text-slate-200 space-y-2">
                  <p className="font-bold text-emerald-300">📋 ملخص التوصية الذكية لطلب الإجازة التعويضية #REQ-928:</p>
                  <p>«بناءً على سجل الحضور لمشروع التحول الرقمي خلال إجازة اليوم الوطني وتوافق ذلك مع المادة (107) من نظام العمل السعودي، يُوصى باحتساب يوم ونصف تعويضي أو صرف الأجر الإضافي بنسبة 150%.»</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" className="text-xs rounded-xl border-emerald-700 text-white bg-transparent">تعديل القرار</Button>
                  <Button size="sm" className="text-xs rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">اعتماد التوصية وتوثيقها</Button>
                </div>
              </div>
            )}

            {/* TAB 5: ESS */}
            {activeConsoleTab === "ess" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">بوابة الخدمة الذاتية للموظف (ESS 360)</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">3 نقرات فقط</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition cursor-pointer">
                    <FileText className="size-6 text-emerald-700 mx-auto mb-2" />
                    <span className="font-bold text-slate-900">طلب إجازة</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition cursor-pointer">
                    <FileCheck className="size-6 text-emerald-700 mx-auto mb-2" />
                    <span className="font-bold text-slate-900">تعريف بالراتب</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition cursor-pointer">
                    <Scale className="size-6 text-emerald-700 mx-auto mb-2" />
                    <span className="font-bold text-slate-900">سلفة أو مصروف</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition cursor-pointer">
                    <UserCheck className="size-6 text-emerald-700 mx-auto mb-2" />
                    <span className="font-bold text-slate-900">تحديث العنوان الوطني</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── Saudi Enterprise ROI & Compliance Simulator ─────────────── */}
      <section id="simulator" className="py-24 bg-[#F8F9FA] border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 mb-4">
              <Sliders className="size-3.5" />
              <span>حاسبة العائد والامتثال المؤسسي الذكية</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">احسب العائد التشغيلي والأمان المالي لمنشأتك</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              شاهد كيف توفر حلول الغد مئات الساعات التشغيلية وتضمن الامتثال التام مع أنظمة وزارة الموارد البشرية.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Interactive Inputs Column */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Employee Count Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">حجم القوى العاملة (عدد الموظفين)</label>
                  <span className="text-base font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                    {employeeCount} موظفاً
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#18B982]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>10 موظفين</span>
                  <span>250 موظفاً</span>
                  <span>500+ موظف</span>
                </div>
              </div>

              {/* Sector Selector */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">القطاع والنشاط التجاري</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { id: "tech", label: "تقنية واتصالات" },
                    { id: "contracting", label: "مقاولات وإنشاءات" },
                    { id: "retail", label: "تجارة وتجزئة" },
                    { id: "health", label: "رعاية صحية" },
                    { id: "finance", label: "خدمات مالية" },
                    { id: "industrial", label: "صناعة وتشغيل" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSector(s.id)}
                      className={`p-3 rounded-xl border transition text-center cursor-pointer ${sector === s.id ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold" : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Average Salary Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">متوسط الراتب الشهري التقديري</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(Math.max(3000, Number(e.target.value)))}
                    className="h-11 rounded-xl pr-4 pl-16 text-sm font-bold border-slate-200 font-mono"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ر.س / شهر</span>
                </div>
              </div>

            </div>

            {/* Results Output Column */}
            <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#0F2F24] to-[#0A221A] text-white p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-emerald-400 uppercase">الأثر والعائد التقديري المباشر</p>
                <h3 className="text-2xl font-black mt-1">توفير سنوي يصل إلى:</h3>
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 mt-2 font-mono">
                  {calculatedSavings.annualSavings} <span className="text-xl text-slate-300 font-sans">ر.س</span>
                </p>
              </div>

              <div className="space-y-3.5 border-t border-white/10 pt-5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">ساعات العمل الشهرية الموفرة:</span>
                  <strong className="text-emerald-300 font-mono text-sm">{calculatedSavings.hoursSavedMonthly} ساعة / شهرياً</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">تجنب مخاطر الغرامات الحكومية:</span>
                  <strong className="text-amber-300 font-mono text-sm">~{calculatedSavings.penaltyRiskAvoidance} ر.س</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">نطاق التوطين المقترح:</span>
                  <strong className="text-emerald-300 text-sm font-bold">{calculatedSavings.saudizationScore}</strong>
                </div>
              </div>

              <Button
                onClick={() => setLocation("/subscribe")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#18B982] to-[#109E6D] hover:from-[#15A674] hover:to-[#0D855C] text-slate-950 font-bold text-sm shadow-md cursor-pointer"
              >
                تثبيت النتائج وطلب عرض سعر رسمي <ArrowLeft className="mr-2 size-4" />
              </Button>
            </div>

          </div>

        </div>
      </section>

      {/* ── The 6 Core Enterprise Pillars ──────────────────────────── */}
      <section id="pillars" className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 mb-4">
            <Layers className="size-3.5 text-emerald-700" />
            <span>معمارية النظام المتكاملة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">ركائز منظومة HBS 2030 الست</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            تمت هندسة كل وحدة لتعمل بتناغم كامل مع اللوائح السعودية والمعايير السحابية الحديثة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white transition">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-6">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5">{pillar.desc}</p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  {pillar.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Complete 10-Member Enterprise Sovereign Team Showcase ───── */}
      <section id="team" className="py-24 bg-gradient-to-b from-[#0F2F24] via-[#0B251D] to-[#081C16] text-white border-t border-emerald-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-[#D4AF37]/30 px-4 py-1.5 text-xs font-bold text-[#F5E6B8] mb-4">
              <Users className="size-3.5 text-[#D4AF37]" />
              <span>فريق العمل والقيادة السيادية المعتمدة (10 خبراء ومستشارين)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black">نخبة الكفاءات الوطنية لإدارة الامتثال والتحول</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              يقف خلف منظومة HBS 2030 فريق متكامل يجمع بين الاستشارات القانونية لأنظمة العمل، هندسة الحوسبة السيادية، وإدارة الرواتب المعتمدة.
            </p>

            {/* Team Category Filter Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "كافة أعضاء الفريق (10)" },
                { id: "leadership", label: "القيادة التنفيذية" },
                { id: "legal", label: "الامتثال وقانون العمل" },
                { id: "payroll", label: "الرواتب وWPS مدد" },
                { id: "ai_tech", label: "الذكاء والتقنية السيادية" },
                { id: "experience", label: "تجربة ونجاح المنشآت" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTeamCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTeamCategory === tab.id
                      ? "bg-gradient-to-r from-[#18B982] to-[#109E6D] text-slate-950 font-black shadow-lg shadow-emerald-950/50"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 hover:bg-white/[0.08] hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-14 rounded-2xl border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${member.avatarBg}`}>
                        <Users className="size-6 text-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {member.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">{member.role}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wider">{member.nationalIdRef}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300 border border-white/5">
                      {member.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                    {member.bio}
                  </p>

                  <div className="mt-4 space-y-1.5 text-[11px] text-emerald-200">
                    {member.credentials.slice(0, 2).map((cred, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Award className="size-3.5 text-[#D4AF37] shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">الاعتماد:</span>
                  <span className="font-bold text-[#F5E6B8] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                    {member.titleEn}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B89020] hover:from-[#E2C048] hover:to-[#C69C2A] text-slate-950 font-black text-xs shadow-xl transition cursor-pointer transform hover:-translate-y-0.5"
            >
              <Crown className="size-4" />
              <span>مشاهدة عرض التقديم السيادي للفريق ($100K Intro)</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── Enterprise Pricing & Packages Section ─────────────────────── */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-bold text-amber-900 mb-4 shadow-sm">
              <Crown className="size-4 text-amber-600" />
              <span>خيارات الاشتراك المرنة للمنشآت والشركات القابضة</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">استثمار تشغيلي ذكي مصمم لنمو منشأتك</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              باقات مرنة تشمل كافة التحديثات القانونية الدورية، دعم فني محلي، وترحيل بيانات مجاني.
            </p>

            {/* Annual vs Monthly Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 text-xs font-bold">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 ${billingCycle === "annual" ? "bg-[#0F2F24] text-white shadow-md" : "text-slate-700 hover:text-slate-900"}`}
              >
                <span>الدفع السنوي</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">وفر شهرين (18%)</span>
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2.5 rounded-xl transition cursor-pointer ${billingCycle === "monthly" ? "bg-[#0F2F24] text-white shadow-md" : "text-slate-700 hover:text-slate-900"}`}
              >
                <span>الدفع الشهري</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* TIER 1: GROWTH / نمو */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">باقة النمو</span>
                  <span className="text-xs text-slate-500 font-medium">حتى 30 موظفاً</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-4">الشركات الناشئة والمكاتب</h3>
                <p className="text-xs text-slate-500 mt-2">بداية قوية لضبط مسير الرواتب والامتثال الحكومي الأساسي.</p>

                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 font-mono">
                      {billingCycle === "annual" ? "890" : "1,050"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">ر.س / شهرياً</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">تُدفع سنوياً أو شهرياً مع تدريب أولي</p>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> مسير الرواتب وملفات مدد WPS</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> رصد انتهاء الإقامات والتراخيص</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> بوابة الخدمة الذاتية وتتبع الإجازات</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> دعم فني عبر التذاكر والبريد</li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  onClick={() => setLocation("/subscribe")}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold text-xs border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  اختر باقة النمو
                </Button>
              </div>
            </div>

            {/* TIER 2: ADVANCED ENTERPRISE / الأعمال المتقدمة - HIGHLIGHTED */}
            <div className="relative rounded-3xl border-2 border-emerald-600 bg-gradient-to-b from-[#0F2F24] to-[#0A221A] text-white p-7 sm:p-8 flex flex-col justify-between shadow-2xl scale-105 z-10">
              <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <Star className="size-3.5 fill-slate-950" />
                الأكثر اختياراً للمنشآت السعودية
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">باقة الأعمال الذكية</span>
                  <span className="text-xs text-emerald-300/80 font-medium">حتى 150 موظفاً</span>
                </div>
                <h3 className="text-2xl font-black text-white mt-4">المؤسسات والشركات المتوسطة</h3>
                <p className="text-xs text-slate-300 mt-2">شامل وكيل الذكاء «حامد»، الترحيل الشامل، والربط الحكومي المتقدم.</p>

                <div className="mt-6 pb-6 border-b border-white/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-emerald-400 font-mono">
                      {billingCycle === "annual" ? "2,490" : "2,950"}
                    </span>
                    <span className="text-xs font-bold text-slate-300">ر.س / شهرياً</span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-semibold mt-1">توفير سنوي مباشر 5,520 ر.س</p>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400 shrink-0" /> كل ميزات باقة النمو + عدد موظفين أعلى</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400 shrink-0" /> <strong>مساعد الذكاء الاصطناعي التفسيري «حامد»</strong></li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400 shrink-0" /> محرك التحذير ذو الـ 7 مستويات للإقامات</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400 shrink-0" /> ترحيل كامل للبيانات وتدريب الموظفين مجاناً</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400 shrink-0" /> مدير حساب مخصص ودعم هاتفي ذو أولوية</li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  onClick={() => setLocation("/subscribe")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#18B982] to-[#109E6D] hover:from-[#15A674] hover:to-[#0D855C] text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                >
                  ابدأ التجربة التنفيذية الآن <ArrowLeft className="mr-2 size-4" />
                </Button>
              </div>
            </div>

            {/* TIER 3: HOLDING / المجموعات والقابضة */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">باقة المجموعات والسيادة</span>
                  <span className="text-xs text-slate-500 font-medium">غير محدود</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-4">الشركات القابضة والمصانع</h3>
                <p className="text-xs text-slate-500 mt-2">تعدد سجلات تجارية، استضافة مخصصة، واتفاقيات مستوى خدمة SLA.</p>

                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">عقد مخصص</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">تسعير يتناسب مع حجم العمليات والربط الخاص</p>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> دعم فروع وشركات شقيقة غير محدودة</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> ربط مخصص عبر واجهات برمجة التطبيقات (API)</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> اتفاقية مستوى خدمة خاصة (SLA 99.99%)</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-emerald-600 shrink-0" /> تدقيق أمني مخصص وخيارات استضافة معزولة</li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  onClick={() => setLocation("/request-demo")}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold text-xs border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  طلب اجتماع تنفيذي مخصص
                </Button>
              </div>
            </div>

          </div>

          {/* Money-back Guarantee & Compliance Assurance */}
          <div className="mt-12 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">ضمان الامتثال التام بنسبة 100%</h4>
                <p className="text-xs text-emerald-800">في حال عدم توافق مسيرات الرواتب مع منصة مدد أو نظام حماية الأجور، نتحمل المتابعة الكاملة.</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/subscribe")}
              className="h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 shrink-0"
            >
              تواصل مع مستشار الاشتراك
            </Button>
          </div>

        </div>
      </section>

      {/* ── Saudi Government & System Integrations ─────────────────── */}
      <section id="integrations" className="py-20 bg-[#0F2F24] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-300 tracking-widest uppercase">الربط والتوافق الحكومي المعتمد</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">متصل بأهم المنصات والأنظمة السيادية</h2>
            <p className="mt-3 text-sm text-slate-300">
              تكامل سلس وتوافق معايير مع كافة منصات وزارة الموارد البشرية وهيئات المملكة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNMENT_INTEGRATIONS.map((gov) => (
              <div key={gov.name} className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {gov.tag}
                  </span>
                  <span className="text-xs font-semibold text-amber-300">{gov.status}</span>
                </div>
                <h4 className="text-base font-bold mt-3 text-white">{gov.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{gov.role}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Security, PDPL, and Data Sovereignty ───────────────────── */}
      <section id="security" className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-bold mb-4">
                <ShieldCheck className="size-4" />
                <span>السيادة والخصوصية والأمان</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                أمان مصرفي وعزل تام لبيانات المنشأة
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                تلتزم حلول الغد بالمعايير الصارمة لنظام حماية البيانات الشخصية السعودي (PDPL) وضوابط الهيئة الوطنية للأمن السيبراني (NCA)، مع تشفير متقدم لكافة مسيرات الرواتب والمعلومات الحساسة.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">عزل تام للحسابات والشركات المتعددة (Multi-Tenant Isolation)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">ضمان عدم تداخل بيانات أي شركة أو فرع مع الآخر على مستوى قاعدة البيانات.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <FileCheck className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">سجل تدقيق كامل لكافة الأنشطة (Audit Trail Logs)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">توثيق هوية وتوقيت كل قرار، إجازة، كشف راتب، أو تعديل إداري في النظام.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">استضافة محلية متوافقة مع الأنظمة السعودية</h4>
                    <p className="text-xs text-slate-500 mt-0.5">بياناتك لا تغادر حدود المملكة العربية السعودية وتخضع للسيادة النظامية الكاملة.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">شهادات الامتثال والأمان</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Shield className="size-8 text-emerald-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">نظام PDPL</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">حماية البيانات الشخصية</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <LockKeyhole className="size-8 text-emerald-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">AES-256</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">تشفير المسيرات والوثائق</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Scale className="size-8 text-emerald-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">لوائح MHRSD</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">نظام العمل السعودي</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Zap className="size-8 text-emerald-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">99.9% Uptime</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">جاهزية سحابية دائمة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise FAQ Section ─────────────────────────────────── */}
      <section id="faqs" className="py-24 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">الأسئلة الشائعة</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">إجابات على استفسارات المنشآت والقيادات</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/60 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-5 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-emerald-700" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Executive VIP Call to Action ───────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0F2F24] via-[#0C271E] to-[#0A221A] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl mx-auto">
          <div className="size-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-amber-300 text-slate-950 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Sparkles className="size-8" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight">
            ارتقِ بعمليات منشأتك إلى مستوى القيادة الذكية
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            انضم إلى كبرى الشركات السعودية التي تعتمد حلول الغد كشريك تشغيلي موثوق للامتثال والرواتب والعلاقات الحكومية.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => setLocation("/subscribe")}
              size="lg"
              className="h-14 rounded-2xl bg-gradient-to-r from-[#18B982] to-[#109E6D] hover:from-[#15A674] hover:to-[#0D855C] text-slate-950 font-black text-base px-8 shadow-xl cursor-pointer"
            >
              اطلب عرضاً مخصصاً لمنشأتك <ArrowLeft className="mr-2 size-5" />
            </Button>
            <Button
              onClick={() => setLocation("/request-demo")}
              size="lg"
              variant="outline"
              className="h-14 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-base px-7 cursor-pointer"
            >
              تحدث مع مستشار أنظمة HR
            </Button>
          </div>
        </div>
      </section>

      {/* ── Corporate Footer ───────────────────────────────────────── */}
      <footer className="bg-[#081A14] text-slate-400 text-xs py-14 border-t border-emerald-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#18B982] text-slate-950 font-black text-lg">
                  هـ
                </div>
                <div>
                  <span className="text-base font-bold text-white">حلول الغد | HR HBS</span>
                  <p className="text-[10px] text-emerald-300">منظومة الموارد البشرية والعمليات الذكية</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                نظام تشغيلي متكامل موجه للمنشآت والشركات السعودية في الرياض وجدة والمنطقة الشرقية، متوافق كلياً مع متطلبات رؤية المملكة 2030 وحماية الأجور.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">المنظومة والحلول</h4>
              <ul className="space-y-2">
                <li><a href="#console" className="hover:text-emerald-400">مسير الرواتب (WPS)</a></li>
                <li><a href="#console" className="hover:text-emerald-400">رصد الجوازات والإقامات</a></li>
                <li><a href="#console" className="hover:text-emerald-400">وكيل الذكاء «حامد»</a></li>
                <li><a href="#console" className="hover:text-emerald-400">الخدمة الذاتية للموظف</a></li>
                <li><a href="#console" className="hover:text-emerald-400">الهيكل الإداري 360</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">الامتثال والربط</h4>
              <ul className="space-y-2">
                <li><a href="#integrations" className="hover:text-emerald-400">منصة مدد (WPS)</a></li>
                <li><a href="#integrations" className="hover:text-emerald-400">منصة قوى (Qiwa)</a></li>
                <li><a href="#integrations" className="hover:text-emerald-400">التأمينات (GOSI)</a></li>
                <li><a href="#integrations" className="hover:text-emerald-400">العنوان الوطني (SPL)</a></li>
                <li><a href="#security" className="hover:text-emerald-400">حماية البيانات (PDPL)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setLocation("/login")} className="hover:text-emerald-400 text-right cursor-pointer">دخول المنشآت</button></li>
                <li><button onClick={() => setLocation("/subscribe")} className="hover:text-emerald-400 text-right cursor-pointer">طلب اشتراك جديد</button></li>
                <li><button onClick={() => setLocation("/request-demo")} className="hover:text-emerald-400 text-right cursor-pointer">طلب عرض توضيحي</button></li>
                <li><button onClick={() => setLocation("/app")} className="hover:text-emerald-400 text-right cursor-pointer">لوحة التحكم الداخلية</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 حلول الغد (HR HBS) — جميع الحقوق محفوظة للمملكة العربية السعودية.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Lock className="size-3" /> مشفر بـ AES-256</span>
              <span>·</span>
              <span>مستضاف سحابياً داخل المملكة</span>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
