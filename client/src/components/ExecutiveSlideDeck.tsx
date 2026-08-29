import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  FileSpreadsheet,
  Cpu,
  Layers,
  BotMessageSquare,
  Building2,
  TrendingUp,
  Clock,
  Lock,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sliders,
  DollarSign,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Scale,
  ShieldAlert,
  Search,
  ExternalLink,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPLETE_ENTERPRISE_TEAM, TeamMember } from "./CinematicExecutiveIntro";
import { HeroThreeScene, OperationsPulse } from "./HeroThreeScene";
import { useLocation } from "wouter";

interface ExecutiveSlideDeckProps {
  onOpenIntro: () => void;
  pulse?: OperationsPulse;
}

export function ExecutiveSlideDeck({ onOpenIntro, pulse }: ExecutiveSlideDeckProps) {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeTeamCategory, setActiveTeamCategory] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember>(COMPLETE_ENTERPRISE_TEAM[0]);
  const [activeSuiteTab, setActiveSuiteTab] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeAiDemo, setActiveAiDemo] = useState<number>(0);

  // ROI Calculator in Slide 6
  const [calcEmployees, setCalcEmployees] = useState<number>(120);
  const [calcAvgSalary, setCalcAvgSalary] = useState<number>(11000);
  const [calcSector, setCalcSector] = useState<string>("tech");

  const TOTAL_SLIDES = 6;

  const SLIDE_TITLES = [
    { title: "الرؤية السيادية", subtitle: "منظومة HBS 2030" },
    { title: "فريق العمل بالكامل", subtitle: "10 قيادات وخبراء" },
    { title: "محرك الامتثال الثلاثي", subtitle: "مدد · قوى · التأمينات" },
    { title: "الوكيل الذكي «حامد»", subtitle: "الاستدلال القانوني" },
    { title: "الأجنحة التشغيلية الستة", subtitle: "إدارة المنشأة 360" },
    { title: "العائد وباقات المنشآت", subtitle: "حاسبة التوفير والاستثمار" },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);

  const filteredTeam = activeTeamCategory === "all"
    ? COMPLETE_ENTERPRISE_TEAM
    : COMPLETE_ENTERPRISE_TEAM.filter((m) => m.category === activeTeamCategory);

  // Calculated ROI values
  const monthlyHoursSaved = Math.round(calcEmployees * 1.75);
  const monthlyMoneySaved = Math.round(monthlyHoursSaved * (calcAvgSalary / 160) * 1.3);
  const annualMoneySaved = monthlyMoneySaved * 12;
  const penaltyProtection = calcEmployees > 50 ? 65000 : 30000;

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#040C08] overflow-y-auto" : "min-h-[860px] bg-gradient-to-b from-[#0A221A] via-[#061510] to-[#040C08]"
      } text-white font-sans overflow-hidden select-none border-b border-emerald-950/60 transition-all duration-300`}
      dir="rtl"
    >
      {/* ── Background Subtle Shaders & Luxury Grids ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-1/4 size-[600px] rounded-full bg-[#18B982]/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 size-[550px] rounded-full bg-[#D4AF37]/10 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#18B982 1px, #061510 1px)`,
            backgroundSize: "44px 44px",
            backgroundPosition: "0 0, 22px 22px",
          }}
        />
      </div>

      {/* ── Slide Deck Navigation Top Bar ────────────────────────────── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-white/10 backdrop-blur-md bg-black/40">
        
        {/* Brand & Slide Deck Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenIntro}
            className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#99791F] text-slate-950 font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition cursor-pointer"
            title="إعادة تشغيل الانترو الفخم $100K"
          >
            <Crown className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">العرض التنفيذي الفخم</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EXECUTIVE SLIDE DECK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              الشريحة {currentSlide + 1} من {TOTAL_SLIDES}: {SLIDE_TITLES[currentSlide].title}
            </p>
          </div>
        </div>

        {/* Slide Selector Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          {SLIDE_TITLES.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentSlide === idx
                  ? "bg-[#D4AF37] text-slate-950 font-black shadow-md"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        {/* Deck Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* Replay 100K Intro Button */}
          <Button
            onClick={onOpenIntro}
            variant="outline"
            className="rounded-xl border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#F5E6B8] hover:bg-[#D4AF37]/20 text-xs font-bold px-3.5 h-9"
          >
            <Play className="ml-1.5 size-3 text-[#D4AF37]" />
            انترو $100K
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="ghost"
            size="sm"
            className="rounded-xl text-slate-300 hover:bg-white/10 h-9 px-2.5"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "عرض بملء الشاشة"}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>

          {/* Direct CTA */}
          <Button
            onClick={() => setLocation("/subscribe")}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-500 text-xs px-4 h-9 shadow-lg"
          >
            طلب اشتراك المنشآت
          </Button>
        </div>
      </div>

      {/* ── Slide Progress Bar ───────────────────────────────────────── */}
      <div className="relative w-full h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-[#18B982] via-[#D4AF37] to-[#18B982]"
          initial={false}
          animate={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>

      {/* ── Slide Stage Container ────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-8 min-h-[720px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ═════════════════════════════════════════════════════════════
              SLIDE 1: SOVEREIGN VISION & 3D PULSE HUB
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-[#D4AF37]/20 to-emerald-500/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold">
                  <Crown className="size-3.5 text-[#D4AF37]" />
                  <span>المنظومة السيادية الأولى لإدارة رأس المال البشري بالمملكة</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                  القيادة الذكية للمنشآت السعودية
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6B8] via-[#D4AF37] to-[#18B982]">
                    امتثال مطلق · ذكاء تفسيري · أمان سيادي
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  حلول الغد HBS 2030 تعيد تعريف إدارة الموارد البشرية والعلاقات الحكومية بربط مباشر مع منصات مدد (WPS)، قوى، التأمينات الاجتماعية (GOSI)، ومقيم، مدعومة بوكيل الذكاء الاصطناعي التفسيري «حامد».
                </p>

                {/* Highlight Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black text-emerald-400 font-mono">100%</p>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">توافق مدد WPS 3.0</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black text-[#D4AF37] font-mono">7 مستويات</p>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">رادار رصد الوثائق</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1">
                    <p className="text-2xl font-black text-sky-400 font-mono">AES-256</p>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">تشفير وسيادة وطنية</p>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button
                    onClick={() => setLocation("/subscribe")}
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#18B982] to-[#0A8060] text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(24,185,130,0.35)] hover:scale-105 transition"
                  >
                    حجز عرض تنفيذي للمنشأة <ArrowLeft className="mr-2 size-4" />
                  </Button>
                  <Button
                    onClick={onOpenIntro}
                    variant="outline"
                    className="h-12 px-5 rounded-2xl border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#F5E6B8] hover:bg-[#D4AF37]/20 text-xs font-bold"
                  >
                    <Sparkles className="ml-2 size-4 text-[#D4AF37]" />
                    استعراض الانترو الفخم ($100K)
                  </Button>
                </div>
              </div>

              {/* 3D Holographic Scene Card */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-[420px] rounded-3xl bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent border border-white/15 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE SYSTEM PULSE
                    </span>
                    <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* 3D Scene Viewport */}
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <HeroThreeScene pulse={pulse} />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-center">
                    <p className="text-xs font-bold text-white">القلب الرقمي السيادي HBS Core</p>
                    <p className="text-[11px] text-slate-400">
                      معالجة فورية للمسيرات، التنبيهات، والتأشيرات المتزامنة لحظياً.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SLIDE 2: COMPLETE WORKFORCE & LEADERSHIP TEAM SHOWCASE
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    <Users className="size-3.5 text-amber-400" />
                    <span>فريق العمل المتكامل · 10 كفاءات قيادية وتقنية</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                    الخبراء وصنّاع القرار خلف المنظومة
                  </h2>
                </div>

                {/* Team Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-bold">
                  {[
                    { id: "all", label: "كافة الفريق (10)" },
                    { id: "leadership", label: "القيادة العليا" },
                    { id: "legal", label: "الحوكمة والقانون" },
                    { id: "payroll", label: "الأجور والتأمينات" },
                    { id: "ai_tech", label: "الذكاء والسيادة" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTeamCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        activeTeamCategory === cat.id
                          ? "bg-[#D4AF37] text-slate-950 font-black shadow-md"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster & Details Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Team Grid Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTeam.map((member) => {
                    const isSelected = selectedMember.id === member.id;
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-br from-white/[0.12] to-white/[0.04] border-[#D4AF37] shadow-lg shadow-amber-950/30"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex size-11 items-center justify-center rounded-xl border text-base font-bold ${member.avatarBg}`}>
                            {member.name.split(" ")[1]?.[0] || member.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-amber-300">
                              {member.badge}
                            </span>
                            <h4 className="text-sm font-bold text-white truncate mt-1">{member.name}</h4>
                            <p className="text-xs text-emerald-400 truncate">{member.role}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Member Detailed Spotlight */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-[#D4AF37]/40 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {selectedMember.nationalIdRef}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedMember.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className={`flex size-16 items-center justify-center rounded-2xl border-2 text-2xl font-black ${selectedMember.avatarBg}`}>
                        {selectedMember.name.split(" ")[1]?.[0] || selectedMember.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{selectedMember.name}</h3>
                        <p className="text-xs font-bold text-emerald-400">{selectedMember.role}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{selectedMember.titleEn}</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selectedMember.bio}
                    </p>

                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-slate-400">الاعتمادات والمؤهلات القيادية:</p>
                      {selectedMember.credentials.map((cred, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200">
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          <span>{cred}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">جاهز للتواصل مع قادة المنشآت</span>
                    <Button
                      size="sm"
                      onClick={() => setLocation("/request-demo")}
                      className="rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                    >
                      طلب اجتماع تنفيذي
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SLIDE 3: TRIPLE COMPLIANCE CORE (WPS, GOSI, QIWA, MUQEEM)
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  <span>الربط الحكومي السيادي الشامل</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  المحرك السيادي الثلاثي للامتثال
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  توليد ملفات حماية الأجور، احتساب التأمينات وساند، ورصد انتهاء الوثائق عبر 7 مستويات تصاعدية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                
                {/* 1. Mudad & WPS 3.0 */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/40 via-white/[0.02] to-transparent border border-emerald-500/30 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      منصة مدد WPS
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">محرك حماية الأجور (SIF 3.0)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    توليد فوري ومحكم لملف مسير الرواتب المعتمد لكافة البنوك السعودية مع تدقيق أرقام الآيبان والهويات والبدلات.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-emerald-400" /> تصدير ملف SIF القياسي المعتمد
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-emerald-400" /> ضبط الاستقطاعات والسلف تلقائياً
                    </li>
                  </ul>
                  <Button
                    onClick={() => setLocation("/hr-tools")}
                    size="sm"
                    className="w-full rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    تجربة مولد ملفات SIF
                  </Button>
                </div>

                {/* 2. GOSI & Saned Engine */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-white/[0.02] to-transparent border border-amber-500/30 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Scale className="size-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      التأمينات وساند
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">احتساب GOSI ونسب التوطين</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تطبيق شرائح التأمينات (21.5% للسعوديين، 2% للوافدين) مع تتبع مؤشر نطاقات والتوظيف النوعي.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-amber-400" /> احتساب حصة المنشأة والموظف
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-amber-400" /> محاكي الانتقال للنطاق البلاتيني
                    </li>
                  </ul>
                  <Button
                    onClick={() => setLocation("/hr-tools")}
                    size="sm"
                    className="w-full rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs"
                  >
                    فتح حاسبة التأمينات
                  </Button>
                </div>

                {/* 3. 7-Tier Document Radar */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/40 via-white/[0.02] to-transparent border border-rose-500/30 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="size-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      مقيم وقوى
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">رادار الوثائق ذو الـ 7 مستويات</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    نظام رصد استباقي يمنع الغرامات الحكومية عبر التنبيه قبل 120 يوماً وصولاً للمستوى الحرج 15 يوماً.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-rose-400" /> إقامات، رخص عمل، وسجلات تجارية
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-rose-400" /> احتساب المقابل المالي للتجديد
                    </li>
                  </ul>
                  <Button
                    onClick={() => setLocation("/hr-tools")}
                    size="sm"
                    className="w-full rounded-xl bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 text-xs"
                  >
                    تشغيل رادار الوثائق
                  </Button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SLIDE 4: AGENT HAMED AI & SAUDI LABOR LAW REASONING
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 3 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                  <BotMessageSquare className="size-4 text-sky-400" />
                  <span>وكيل العمليات الذكي «حامد» · AI Co-pilot</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  الاستدلال القانوني الذكي وفق نظام العمل السعودي
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  «حامد» ليس مجرد روبوت محادثة؛ إنه وكيل عمليات متخصص يقارن طلبات الموظفين بمواد نظام العمل، يحسب مستحقات نهاية الخدمة بدقة، ويصيغ القرارات مع اشتراط تأكيد المشرف البشري.
                </p>

                <div className="space-y-2.5">
                  {[
                    "استدلال معلل بالمواد 84 و 85 لنهاية الخدمة",
                    "حوكمة صارمة مع تأكيد بشري إلزامي قبل أي تغيير",
                    "توليد القرارات والخطابات الإدارية بلغة نظامية رصينة",
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="size-4 text-sky-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setLocation("/assistant")}
                  className="h-11 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-lg"
                >
                  فتح غرفة عمليات «حامد» <ArrowLeft className="mr-2 size-4" />
                </Button>
              </div>

              {/* Interactive AI Query Showcase Box */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-black/60 border border-sky-500/30 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 font-bold text-xs">
                      ح
                    </span>
                    <span className="text-xs font-bold text-white">جلسة تحليل استدلالي حية</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    مستند للمادة 85 من نظام العمل
                  </span>
                </div>

                {/* Example Query Selectors */}
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  {[
                    { id: 0, label: "استقالة بعد 4 سنوات عمل" },
                    { id: 1, label: "إجازة أبوة وعقد قوى" },
                    { id: 2, label: "إنهاء عقد محدد المدة (م 77)" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setActiveAiDemo(q.id)}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        activeAiDemo === q.id
                          ? "bg-sky-500 text-slate-950 font-bold"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Query & Reasoning Result */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  {activeAiDemo === 0 && (
                    <>
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="font-bold text-amber-400 shrink-0">سؤال المنشأة:</span>
                        <span>موظف براتب 12,000 ريال قدم استقالته بعد خدمة 4 سنوات وشهرين، كم يستحق؟</span>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200 space-y-1.5 leading-relaxed font-sans">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <Scale className="size-3.5 text-sky-400" /> تحليل المستشار «حامد»:
                        </p>
                        <p>1. استناداً إلى المادة (84): يستحق نصف راتب عن كل سنة من السنوات الخمس الأولى = 25,000 ريال.</p>
                        <p>2. استناداً إلى المادة (85) في حالة الاستقالة بين سنتين و 5 سنوات: يستحق الموظف <strong>ثلث المكافأة</strong> فقط.</p>
                        <p className="text-amber-300 font-bold">المبلغ المستحق النهائي: 8,333.33 ريال سعودي (مع اشتراط اعتماد المشرف).</p>
                      </div>
                    </>
                  )}
                  {activeAiDemo === 1 && (
                    <>
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="font-bold text-amber-400 shrink-0">سؤال المنشأة:</span>
                        <span>ما هي ضوابط إجازة الأبوة ومدتها وأثرها على مسير الرواتب؟</span>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200 space-y-1.5 leading-relaxed">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <Scale className="size-3.5 text-sky-400" /> تحليل المستشار «حامد»:
                        </p>
                        <p>• استناداً للمادة (113) المعدلة: يستحق العامل إجازة بأجر كامل مدتها <strong>3 أيام</strong> عند ولادة مولود له.</p>
                        <p>• تُمنح الإجازة خلال 7 أيام من تاريخ الوضع ولا تخصم من رصيد الإجازة السنوية إطلاقاً.</p>
                      </div>
                    </>
                  )}
                  {activeAiDemo === 2 && (
                    <>
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="font-bold text-amber-400 shrink-0">سؤال المنشأة:</span>
                        <span>تعويض الإنهاء غير المشروع لعقد محدد المدة استناداً للمادة 77؟</span>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200 space-y-1.5 leading-relaxed">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <Scale className="size-3.5 text-sky-400" /> تحليل المستشار «حامد»:
                        </p>
                        <p>• في العقد محدد المدة: أجر المدة المتبقية من العقد، بما لا يقل عن أجر شهرين للعامل.</p>
                        <p>• يوصي النظام بالتسوية الودية وتوثيق مخالصة إنهاء العلاقة التعاقدية عبر منصة قوى.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SLIDE 5: 6 ENTERPRISE OPERATING SUITES
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 4 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <Layers className="size-3.5 text-emerald-400" />
                  <span>المنظومة المتكاملة 360</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  الأجنحة التشغيلية الستة لإدارة المنشأة
                </h2>
              </div>

              {/* Suites Tabs Bar */}
              <div className="flex flex-wrap justify-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 max-w-4xl mx-auto text-xs font-bold">
                {[
                  { id: 0, label: "مسيرات الأجور والرواتب (WPS)" },
                  { id: 1, label: "الحضور والورديات والإجازات" },
                  { id: 2, label: "العلاقات والرادار الحكومي" },
                  { id: 3, label: "الهيكل والصلاحيات (RBAC)" },
                  { id: 4, label: "الخدمة الذاتية والعهد" },
                  { id: 5, label: "السيادة السحابية والأمان" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSuiteTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                      activeSuiteTab === tab.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-md"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Suite Content Box */}
              <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 backdrop-blur-xl shadow-2xl">
                {activeSuiteTab === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 01 · PAYROLL</span>
                      <h3 className="text-xl font-bold text-white">إدارة الرواتب ومطابقة البنوك</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        معالجة مئات الموظفين في ثوانٍ معدودة، واحتساب الاستقطاعات والبدلات وتصدير ملف SIF المعتمد لبنوك الراجحي، الأهلي، والإنماء مع تقارير التكلفة الإجمالية.
                      </p>
                      <Button onClick={() => setLocation("/hr-tools")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        فتح مركز الرواتب
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400"><span>إجمالي المسير:</span><span className="text-white font-bold">485,200 ر.س</span></div>
                      <div className="flex justify-between text-slate-400"><span>استقطاع التأمينات (GOSI):</span><span className="text-amber-400 font-bold">47,320 ر.س</span></div>
                      <div className="flex justify-between text-slate-400"><span>صافي التحويل البنكي:</span><span className="text-emerald-400 font-bold">437,880 ر.س</span></div>
                    </div>
                  </div>
                )}
                {activeSuiteTab === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 02 · ATTENDANCE</span>
                      <h3 className="text-xl font-bold text-white">الورديات وساعات العمل والغياب</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        جدولة الورديات المرنة، تتبع بصمات الحضور، احتساب ساعات العمل الإضافي والأرصدة اللحظية للإجازات السنوية والمرضية والاضطرارية.
                      </p>
                      <Button onClick={() => setLocation("/attendance")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        سجل الحضور والورديات
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span>نسبة الانضباط اليومي:</span><span className="text-emerald-400 font-bold">96.8%</span></div>
                      <div className="flex justify-between"><span>ساعات العمل الإضافي المعتمدة:</span><span className="text-sky-400 font-bold">142 ساعة</span></div>
                    </div>
                  </div>
                )}
                {activeSuiteTab === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 03 · GOVERNMENT RELATIONS</span>
                      <h3 className="text-xl font-bold text-white">الرادار الحكومي والتراخيص</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        متابعة السجلات التجارية، رخص الدفاع المدني، بطاقات البلدية، وتأشيرات الموظفين لمنع توقف الأنشطة التجارية أو فرض غرامات التأخير.
                      </p>
                      <Button onClick={() => setLocation("/hr-tools")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        فتح رادار التنبيهات
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span>وثائق مجددة بالكامل:</span><span className="text-emerald-400 font-bold">189 وثيقة</span></div>
                      <div className="flex justify-between"><span>تنبيهات استباقية (60 يوماً):</span><span className="text-amber-400 font-bold">4 وثائق</span></div>
                    </div>
                  </div>
                )}
                {activeSuiteTab === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 04 · ORG & RBAC</span>
                      <h3 className="text-xl font-bold text-white">الهيكل الإداري وتوزيع الصلاحيات</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        مخطط شجري تفاعلي للهيكل التنظيمي، سلاسل الاعتمادات والموافقات متعددة المستويات، وصلاحيات دقيقة للمدراء والمشرفين.
                      </p>
                      <Button onClick={() => setLocation("/organization")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        الهيكل التنظيمي
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span>الكيانات والفروع:</span><span className="text-white font-bold">4 فروع تشغيلية</span></div>
                      <div className="flex justify-between"><span>سلاسل الموافقات:</span><span className="text-emerald-400 font-bold">مضبوطة آلياً</span></div>
                    </div>
                  </div>
                )}
                {activeSuiteTab === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 05 · ESS & ASSETS</span>
                      <h3 className="text-xl font-bold text-white">بوابة الخدمة الذاتية والعهد</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        تمكين الموظف من رفع طلبات الإجازات، السلف، خطابات التعريف، وتوثيق استلام العهد والأجهزة الرقمية مع إمكانية التوقيع الإلكتروني.
                      </p>
                      <Button onClick={() => setLocation("/employee-requests")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        بوابة الطلبات الذاتية
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span>متوسط زمن إنجاز الطلب:</span><span className="text-emerald-400 font-bold">4.2 ساعات</span></div>
                      <div className="flex justify-between"><span>رضا الكفاءات:</span><span className="text-sky-400 font-bold">98.4%</span></div>
                    </div>
                  </div>
                )}
                {activeSuiteTab === 5 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold">SUITE 06 · SOVEREIGN SECURITY</span>
                      <h3 className="text-xl font-bold text-white">السيادة السحابية والأمان الوطني</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        استضافة بيانات المنشأة داخل خوادم سيادية في المملكة العربية السعودية، متوافقة 100% مع نظام حماية البيانات الشخصية السعودي (PDPL).
                      </p>
                      <Button onClick={() => setLocation("/data-inventory")} size="sm" className="bg-emerald-500 text-slate-950 font-bold">
                        سجل سيادة البيانات
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between"><span>مستوى التشفير:</span><span className="text-emerald-400 font-bold">AES-256 GCM</span></div>
                      <div className="flex justify-between"><span>المطابقة الوطنية:</span><span className="text-amber-400 font-bold">NCA / PDPL</span></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SLIDE 6: ROI CALCULATOR & SOVEREIGN ENTERPRISE TIERS
             ═════════════════════════════════════════════════════════════ */}
          {currentSlide === 5 && (
            <motion.div
              key="slide-5"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#F5E6B8] border border-[#D4AF37]/30 text-xs font-bold">
                  <Crown className="size-3.5 text-[#D4AF37]" />
                  <span>العائد الاستثماري وباقات المنشآت السيادية</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  حاسبة التوفير المالي وباقات الانطلاق
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Interactive Sliders */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="size-4 text-emerald-400" />
                    اضبط معايير منشأتك لاحتساب العائد:
                  </h3>

                  {/* Employees Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">عدد الموظفين:</span>
                      <span className="text-emerald-400 font-black font-mono text-sm">{calcEmployees} موظف</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="5"
                      value={calcEmployees}
                      onChange={(e) => setCalcEmployees(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Salary Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">متوسط الرواتب:</span>
                      <span className="text-amber-400 font-black font-mono text-sm">{calcAvgSalary.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <input
                      type="range"
                      min="4000"
                      max="40000"
                      step="500"
                      value={calcAvgSalary}
                      onChange={(e) => setCalcAvgSalary(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Sector Buttons */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-300">القطاع التجاري:</span>
                    <div className="flex gap-2">
                      {["tech", "retail", "contracting", "health"].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setCalcSector(sec)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            calcSector === sec
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {sec === "tech" ? "تقنية واستشارات" : sec === "retail" ? "تجزئة وتجارة" : sec === "contracting" ? "مقاولات وتشغيل" : "رعاية صحية"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Savings Summary & CTA */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-[#18B982]/20 via-[#0A221A] to-black border border-[#D4AF37]/40 shadow-2xl space-y-4">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">PROJECTED ENTERPRISE VALUE</span>
                  
                  <div>
                    <p className="text-xs text-slate-400">التوفير المالي السنوي المقدر:</p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-emerald-400 font-mono">
                      {annualMoneySaved.toLocaleString("ar-SA")} ر.س
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">ساعات العمل التشغيلي الموفرة:</span>
                      <span className="text-emerald-400 font-bold font-mono">{monthlyHoursSaved * 12} ساعة/سنوياً</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">تجنب مخاطر الغرامات الحكومية:</span>
                      <span className="text-amber-400 font-bold font-mono">{penaltyProtection.toLocaleString("ar-SA")} ر.س</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setLocation("/subscribe")}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-105 transition"
                  >
                    بدء تفعيل اشتراك المنشأة <ArrowLeft className="mr-2 size-4" />
                  </Button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Slide Deck Bottom Controller ─────────────────────────────── */}
      <div className="relative z-20 px-6 sm:px-10 py-4 border-t border-white/10 backdrop-blur-md bg-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            <ChevronRight className="size-4 ml-1" /> الشريحة السابقة
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {SLIDE_TITLES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === i
                    ? "w-8 h-2 bg-[#D4AF37]"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`الانتقال للشريحة ${i + 1}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={nextSlide}
            className="rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs px-4"
          >
            الشريحة التالية <ChevronLeft className="size-4 mr-1" />
          </Button>

        </div>
      </div>
    </div>
  );
}
