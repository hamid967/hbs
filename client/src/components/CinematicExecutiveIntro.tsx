import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Users,
  Award,
  Building2,
  CheckCircle2,
  Cpu,
  Scale,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "leadership" | "legal" | "payroll" | "ai_tech" | "experience";
  titleEn: string;
  bio: string;
  credentials: string[];
  nationalIdRef: string;
  color: string;
  badge: string;
  avatarBg: string;
}

export const COMPLETE_ENTERPRISE_TEAM: TeamMember[] = [
  {
    id: "ceo",
    name: "م. عبدالرحمن بن نايف القحطاني",
    role: "الرئيس التنفيذي & المؤسس",
    category: "leadership",
    titleEn: "Chief Executive Officer & Founder",
    bio: "خبير استراتيجي في حوكمة المنشآت والتحول الرقمي لمنظومات الموارد البشرية برؤية المملكة 2030.",
    credentials: ["ماجستير إدارة الأعمال التنفيذية", "عضو جمعية الموارد البشرية", "خبرة 16 عاماً في القيادة المؤسسية"],
    nationalIdRef: "SA-CEO-108928",
    color: "from-amber-400 to-amber-600",
    badge: "القيادة التنفيذية",
    avatarBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  {
    id: "vp-hr",
    name: "أ. فاطمة بنت أحمد السالم",
    role: "نائب الرئيس للموارد البشرية والعمليات",
    category: "leadership",
    titleEn: "VP of HR & Operations",
    bio: "قيادية متخصصة في هندسة السياسات المؤسسية، الامتثال للوائح العمل السعودية، وتطوير رأس المال البشري.",
    credentials: ["شهادة CIPD المستوى 7", "مستشارة معتمدة في سياسات التوطين", "إدارة عمليات أكثر من 12 ألف موظف"],
    nationalIdRef: "SA-VPHR-109847",
    color: "from-emerald-400 to-emerald-600",
    badge: "العمليات والسياسات",
    avatarBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    id: "cto",
    name: "م. سعود بن خالد العتيبي",
    role: "الرئيس التنفيذي للتقنية والابتكار (CTO)",
    category: "leadership",
    titleEn: "Chief Technology Officer",
    bio: "معماري برمجيات متقدمة يقود التحول السحابي السيادي وهندسة الأنظمة عالية التوافر ومحركات الربط الحكومي.",
    credentials: ["ماجستير علوم الحاسب السحابية", "خبير أمان البيانات الوطنية NCA", "هندسة معمارية خالية من الثغرات"],
    nationalIdRef: "SA-CTO-108422",
    color: "from-sky-400 to-sky-600",
    badge: "التقنية والسيادة",
    avatarBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  {
    id: "legal",
    name: "المستشار د. إبراهيم بن صالح الهذلي",
    role: "كبير المستشارين القانونيين وحوكمة نظام العمل",
    category: "legal",
    titleEn: "Chief Legal Counsel & Labor Law Architect",
    bio: "مرجع قانوني في قضايا العمل والعمال وصياغة لوائح تنظيم العمل المعتمدة من وزارة الموارد البشرية.",
    credentials: ["دكتوراه في القانون التجاري والعمل", "محكم معتمد لدى وزارة العدل", "مؤلف دليل الامتثال العمالي"],
    nationalIdRef: "SA-LEG-107739",
    color: "from-purple-400 to-purple-600",
    badge: "الحوكمة القانونية",
    avatarBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  {
    id: "wps",
    name: "أ. حازم رضوان",
    role: "رئيس قطاع الأجور وحماية الأجور (WPS Controller)",
    category: "payroll",
    titleEn: "Head of Payroll & WPS SIF Compliance",
    bio: "خبير مسيرات الأجور وضبط معايير منصة مدد ونظام WPS 3.0 وحسابات مكافأة نهاية الخدمة والتأمينات.",
    credentials: ["محاسب قانوني معتمد SOCPA", "مهندس تكاملات المصارف السعودية", "دقة مالية بنسبة 99.99%"],
    nationalIdRef: "SA-WPS-248928",
    color: "from-teal-400 to-teal-600",
    badge: "حماية الأجور والمالية",
    avatarBg: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  },
  {
    id: "ai-lead",
    name: "م. أحمد الشربيني",
    role: "كبير معماريي الذكاء الاصطناعي ومطور «حامد»",
    category: "ai_tech",
    titleEn: "Lead AI & Decision Engine Architect",
    bio: "متخصص في النماذج اللغوية التفسيرية، هندسة الاستدلال الآلي وفق مواد القانون، وأتمتة القرارات الذكية.",
    credentials: ["باحث في الذكاء الاصطناعي التفسيري", "مصمم وكيل العمليات حامد", "أمان الاستدلال دون أخطاء هلوسة"],
    nationalIdRef: "SA-AI-209384",
    color: "from-indigo-400 to-indigo-600",
    badge: "وكيل العمليات الذكي",
    avatarBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  },
  {
    id: "gro",
    name: "أ. فيصل بن ماجد الدوسري",
    role: "مدير العلاقات الحكومية ومنصات قوى ومقيم (GRO)",
    category: "legal",
    titleEn: "Director of Government Relations & Integrations",
    bio: "مسؤول الربط والتكامل المباشر مع منصات قوى، مقيم، سبل، بلدي، والدفاع المدني وإدارة رادار الوثائق ذو الـ 7 مستويات.",
    credentials: ["خبير منصات وزارة الموارد البشرية", "إدارة أكثر من 50,000 إقامة وترخيص", "سجل صفر غرامات حكومية"],
    nationalIdRef: "SA-GRO-105541",
    color: "from-rose-400 to-rose-600",
    badge: "العلاقات والمنصات الحكومية",
    avatarBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  {
    id: "gosi-spec",
    name: "أ. ليلى بنت منصور الحربي",
    role: "أخصائية التأمينات الاجتماعية ونطاقات التوطين",
    category: "payroll",
    titleEn: "GOSI & Saudization Analytics Specialist",
    bio: "متخصصة في حسابات التأمينات وساند، رصد أوزان التوطين وذوي الاحتياجات الخاصة، ومحاكاة النطاق البلاتيني.",
    credentials: ["شهادة احترافية في معايير GOSI", "محللة بيانات التوطين ونطاقات", "محسنة نسب السعودة لـ 50+ منشأة"],
    nationalIdRef: "SA-GOS-103392",
    color: "from-yellow-400 to-yellow-600",
    badge: "التأمينات ونطاقات",
    avatarBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  {
    id: "security",
    name: "م. ريان بن طلال الغامدي",
    role: "مدير البنية التحتية السحابية والأمن السيبراني",
    category: "ai_tech",
    titleEn: "Cloud Infrastructure & Cybersecurity Lead",
    bio: "مسؤول السيادة السحابية، التشفير بمستوى AES-256، العزل التام للمنشآت والامتثال لضوابط NCA وPDPL.",
    credentials: ["شهادات CISSP و CISM", "مهندس السحابة السيادية الوطنية", "اختبارات اختراق دورية ومراقبة 24/7"],
    nationalIdRef: "SA-SEC-104928",
    color: "from-cyan-400 to-cyan-600",
    badge: "السيادة والأمن السيبراني",
    avatarBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  {
    id: "talent",
    name: "أ. نورة بنت سعد الشمري",
    role: "مديرة تجربة الكفاءات واستقطاب المواهب",
    category: "experience",
    titleEn: "Talent Acquisition & Employee Experience Lead",
    bio: "قائدة برامج التهيئة التفاعلية، قياس الأداء KPI، والتطوير المهني المستمر لكفاءات الشركات الوطنية.",
    credentials: ["ماجستير إدارة الموارد البشرية", "مبتكرة رحلة الموظف الرقمية 360", "برامج استبقاء الكفاءات العالية"],
    nationalIdRef: "SA-TAL-102874",
    color: "from-pink-400 to-pink-600",
    badge: "تجربة الكفاءات الوطنية",
    avatarBg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
];

// Elegant synthesized luxury audio tones via Web Audio API
function playChime(freq: number = 587.33, type: OscillatorType = "sine", duration: number = 0.8) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if audio is blocked by user browser policy
  }
}

interface CinematicExecutiveIntroProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function CinematicExecutiveIntro({ onComplete, isOpen }: CinematicExecutiveIntroProps) {
  const [phase, setPhase] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total phases:
  // 0: Royal Sovereign Crest & Vision 2030 ($100K Cinematic Title Reveal)
  // 1: Executive Board & Strategic Leadership
  // 2: Complete Specialized Workforce & Domain Masters
  // 3: The Triple Sovereign Engine (Qiwa, Mudad, GOSI, Hamed AI)
  // 4: The Royal Handover to Platform

  const PHASES_COUNT = 5;

  useEffect(() => {
    if (!isOpen) return;

    if (soundEnabled) {
      if (phase === 0) playChime(440, "sine", 1.2);
      if (phase === 1) playChime(554.37, "triangle", 0.9);
      if (phase === 2) playChime(659.25, "sine", 0.9);
      if (phase === 3) playChime(880, "sine", 1.0);
      if (phase === 4) playChime(1108.73, "sine", 1.4);
    }

    if (autoPlay && phase < PHASES_COUNT - 1) {
      const delay = phase === 0 ? 5500 : phase === 1 ? 6500 : phase === 2 ? 7500 : 6000;
      timerRef.current = setTimeout(() => {
        setPhase((prev) => prev + 1);
      }, delay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, isOpen, autoPlay, soundEnabled]);

  if (!isOpen) return null;

  const currentMember = COMPLETE_ENTERPRISE_TEAM[selectedMemberIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#040C08] text-white font-sans overflow-hidden select-none"
        dir="rtl"
      >
        {/* ── Background Luxury Shaders & Particle Effects ─────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Radial Royal Ambient Lights */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-b from-[#18B982]/20 via-[#D4AF37]/10 to-transparent blur-[120px]" />
          <div className="absolute -bottom-40 right-10 size-[500px] rounded-full bg-[#0A8060]/20 blur-[140px]" />
          <div className="absolute top-1/3 -left-40 size-[450px] rounded-full bg-[#D4AF37]/15 blur-[130px]" />

          {/* Luxury Geometric Grid Mesh */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#18B982 1px, #040C08 1px)`,
              backgroundSize: "40px 40px",
              backgroundPosition: "0 0, 20px 20px",
            }}
          />

          {/* Animated Gold Sparkle Beams */}
          <motion.div
            animate={{
              opacity: [0.2, 0.45, 0.2],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full border border-[#D4AF37]/15"
          />
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[1100px] rounded-full border border-dashed border-emerald-500/10"
          />
        </div>

        {/* ── Top Header Controls ─────────────────────────────────────── */}
        <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 border-b border-white/10 backdrop-blur-md bg-black/30">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#B8972E] to-[#99791F] text-slate-950 font-black shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              <Crown className="size-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white">حلول الغد · HBS 2030</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#EBD38D] border border-[#D4AF37]/30">
                  العرض السيادي $100,000
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-emerald-400 font-mono">SAUDI VISION 2030 ENTERPRISE SUITE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime(600, "sine", 0.5);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="size-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">الصوت الفخم: مفعّل</span>
                </>
              ) : (
                <>
                  <VolumeX className="size-3.5 text-slate-400" />
                  <span className="hidden sm:inline">صامت</span>
                </>
              )}
            </button>

            {/* AutoPlay Toggle */}
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              {autoPlay ? <Pause className="size-3.5 text-emerald-400" /> : <Play className="size-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{autoPlay ? "إيقاف مؤقت" : "تشغيل آلي"}</span>
            </button>

            {/* Skip / Close */}
            <Button
              onClick={onComplete}
              variant="outline"
              className="rounded-xl border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white text-xs font-bold px-4 h-9 shadow-lg"
            >
              تخطي إلى المنظومة <ArrowLeft className="mr-1.5 size-3.5" />
            </Button>
          </div>
        </header>

        {/* ── Main Dynamic Stage ──────────────────────────────────────── */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10 max-w-7xl mx-auto w-full">
          {/* ══ PHASE 0: The Sovereign Crest & Royal Foundation ═════════ */}
          {phase === 0 && (
            <motion.div
              key="phase-0"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-4xl space-y-8"
            >
              {/* Royal Emblem */}
              <div className="relative mx-auto size-28 sm:size-36 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-3xl bg-gradient-to-br from-[#18B982]/30 via-[#0A8060]/40 to-[#D4AF37]/20 blur-xl"
                />
                <div className="relative size-20 sm:size-24 rounded-3xl bg-gradient-to-br from-[#113B2E] via-[#0A221A] to-[#040C08] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.35)]">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11]">
                    هـ
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-[#D4AF37]/20 to-emerald-500/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold tracking-wide">
                  <Sparkles className="size-3.5 text-[#D4AF37]" />
                  <span>السيادة المؤسسية · هندسة الذكاء والامتثال لنظام العمل السعودي</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                  منظومة الكفاءات والحوكمة الرقمية
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6B8] via-[#D4AF37] to-[#18B982]">
                    حلول الغد · HBS 2030 SOVEREIGN SUITE
                  </span>
                </h1>

                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
                  تجربة استثنائية بقيمة $100,000 تجمع بين أحدث ما توصلت إليه هندسة البرمجيات، الذكاء الاصطناعي التفسيري، والامتثال المطلق لأنظمة وزارة الموارد البشرية، منصة قوى، مدد، والتأمينات الاجتماعية.
                </p>
              </div>

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  امتثال 100% لنظام العمل السعودي
                </span>
                <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-[#D4AF37] flex items-center gap-2">
                  <Award className="size-4 text-[#D4AF37]" />
                  ملفات مدد WPS SIF 3.0 المعتمدة
                </span>
                <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-sky-300 flex items-center gap-2">
                  <Cpu className="size-4 text-sky-400" />
                  وكيل العمليات الذكي «حامد»
                </span>
              </div>
            </motion.div>
          )}

          {/* ══ PHASE 1: Executive Board & Strategic Leadership ═════════ */}
          {phase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-[#F5E6B8] border border-amber-500/30 text-xs font-bold">
                  <Crown className="size-3.5 text-amber-400" />
                  <span>القيادة التنفيذية العليا ومجلس المعماريين</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  قادة المنظومة وصنّاع القرار
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                  نخبة من القيادات الوطنية المتخصصة في الاستراتيجية المؤسسية، الامتثال العمالي، والتحول الرقمي السيادي.
                </p>
              </div>

              {/* Grid of Top Leaders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {COMPLETE_ENTERPRISE_TEAM.slice(0, 3).map((leader) => (
                  <motion.div
                    key={leader.id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="relative rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-6 backdrop-blur-md shadow-2xl overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${leader.color}`} />
                    
                    <div className="flex items-start justify-between">
                      <div className={`flex size-14 items-center justify-center rounded-2xl border font-bold text-xl ${leader.avatarBg}`}>
                        {leader.name.split(" ")[1]?.[0] || "ق"}
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-white/10 text-amber-300 border border-white/10">
                        {leader.badge}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition">
                        {leader.name}
                      </h3>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">{leader.role}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{leader.titleEn}</p>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 leading-relaxed">{leader.bio}</p>

                    <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                      {leader.credentials.map((cred, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{cred}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ PHASE 2: Complete Specialized Workforce ═════════════════ */}
          {phase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <Users className="size-3.5 text-emerald-400" />
                    <span>فريق العمل المتكامل · 10 كفاءات قيادية وتشغيلية</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
                    محرك الامتثال، الأجور، الذكاء والعمليات
                  </h2>
                </div>

                {/* Categories Selector */}
                <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
                  {COMPLETE_ENTERPRISE_TEAM.map((member, idx) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMemberIndex(idx);
                        if (soundEnabled) playChime(500 + idx * 50, "sine", 0.3);
                      }}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        selectedMemberIndex === idx
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-md"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{member.name.split(" ")[1] || member.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spotlight Active Member Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-16 items-center justify-center rounded-3xl border-2 text-2xl font-black ${currentMember.avatarBg}`}>
                      {currentMember.name[0]}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-white/10 text-amber-300 border border-white/10">
                        {currentMember.badge}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">{currentMember.name}</h3>
                      <p className="text-sm font-bold text-emerald-400">{currentMember.role}</p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {currentMember.bio}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentMember.credentials.map((cred, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-200">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">SOVEREIGN ROLE SPECIFICATION</span>
                    <p className="text-sm font-bold text-white mt-1">{currentMember.titleEn}</p>
                    <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-3">
                      <span>المرجع المؤسسي:</span>
                      <span className="text-amber-400 font-bold">{currentMember.nationalIdRef}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      size="sm"
                      onClick={() => {
                        const next = (selectedMemberIndex - 1 + COMPLETE_ENTERPRISE_TEAM.length) % COMPLETE_ENTERPRISE_TEAM.length;
                        setSelectedMemberIndex(next);
                      }}
                      className="rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs"
                    >
                      <ChevronRight className="size-4 ml-1" /> السابق
                    </Button>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedMemberIndex + 1} / {COMPLETE_ENTERPRISE_TEAM.length}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        const next = (selectedMemberIndex + 1) % COMPLETE_ENTERPRISE_TEAM.length;
                        setSelectedMemberIndex(next);
                      }}
                      className="rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                    >
                      التالي <ChevronLeft className="size-4 mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ PHASE 3: The Sovereign Platform Core ═════════════════════ */}
          {phase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-5xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  <span>الركائز التشغيلية الأربع للمنظومة</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  محركات الأتمتة والربط الحكومي المباشر
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: FileSpreadsheet, title: "حماية الأجور (WPS SIF 3.0)", desc: "توليد فوري لملفات مدد بدقة 100% مع معالجة كافة البدلات والاستقطاعات.", color: "from-emerald-500/20 to-emerald-950/40 border-emerald-500/30 text-emerald-300" },
                  { icon: Scale, title: "حوكمة نظام العمل واللوائح", desc: "احتساب دقيق لنهاية الخدمة (م 84/85) والإجازات وساعات العمل الإضافية.", color: "from-amber-500/20 to-amber-950/40 border-amber-500/30 text-amber-300" },
                  { icon: Cpu, title: "وكيل الذكاء «حامد»", desc: "استدلال قانوني ذكي وتحليل شامل لطلبات الموظفين مع اشتراط الموافقة البشرية.", color: "from-sky-500/20 to-sky-950/40 border-sky-500/30 text-sky-300" },
                  { icon: Layers, title: "رادار الوثائق ذو الـ 7 مستويات", desc: "رصد استباقي للإقامات والسجلات والتراخيص ومنع الغرامات الحكومية تماماً.", color: "from-rose-500/20 to-rose-950/40 border-rose-500/30 text-rose-300" },
                ].map((pillar, i) => (
                  <div key={i} className={`p-5 rounded-3xl bg-gradient-to-b ${pillar.color} border backdrop-blur-md space-y-3`}>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                      <pillar.icon className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-white">{pillar.title}</h3>
                    <p className="text-xs text-slate-300 leading-5">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ PHASE 4: Royal Handover to Platform ═════════════════════ */}
          {phase === 4 && (
            <motion.div
              key="phase-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="text-center max-w-3xl space-y-8"
            >
              <div className="size-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-[#D4AF37] flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(24,185,130,0.4)]">
                <Crown className="size-10" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-black text-white">
                  أهلاً بك في المستقبل المؤسسي
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                  تم تجهيز الواجهة التنفيذية المتطورة بأسلوب السلايدات الفخمة لتمكين قادة المنشآت وفرق الموارد البشرية من استعراض كافة الحلول والبدء فوراً.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  onClick={onComplete}
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition transform cursor-pointer"
                >
                  الدخول إلى العرض التنفيذي الفخم <ArrowLeft className="mr-2 size-5" />
                </Button>
                <Button
                  onClick={() => setPhase(0)}
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white/20 text-white hover:bg-white/10 text-xs font-bold"
                >
                  <RotateCcw className="ml-2 size-4" /> إعادة مشاهدة الانترو
                </Button>
              </div>
            </motion.div>
          )}
        </main>

        {/* ── Bottom Timeline & Stage Navigation ───────────────────────── */}
        <footer className="relative z-10 px-6 sm:px-10 py-5 border-t border-white/10 backdrop-blur-md bg-black/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Phase Step Indicators */}
            <div className="flex items-center gap-2">
              {[
                "الرؤية السيادية",
                "القيادة التنفيذية",
                "فريق العمل بالكامل",
                "محركات الامتثال",
                "الدخول للمنظومة",
              ].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhase(idx);
                    if (soundEnabled) playChime(450 + idx * 70, "sine", 0.4);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    phase === idx
                      ? "bg-[#D4AF37] text-slate-950 shadow-md font-black"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Next / Prev Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={phase === 0}
                onClick={() => setPhase((p) => Math.max(0, p - 1))}
                className="rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                <ChevronRight className="size-4 ml-1" /> السابق
              </Button>

              {phase < PHASES_COUNT - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setPhase((p) => Math.min(PHASES_COUNT - 1, p + 1))}
                  className="rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs px-4"
                >
                  التالي <ChevronLeft className="size-4 mr-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onComplete}
                  className="rounded-xl bg-[#D4AF37] text-slate-950 font-black hover:bg-[#c49f2e] text-xs px-5"
                >
                  ابدأ التجربة <ArrowLeft className="size-4 mr-1" />
                </Button>
              )}
            </div>

          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
