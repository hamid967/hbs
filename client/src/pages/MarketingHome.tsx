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
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Laptop,
  Layers,
  Lock,
  Menu,
  PhoneCall,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Users,
  X,
  Zap,
  Award,
  ArrowUpRight,
  CalendarCheck,
  Smartphone,
  Send,
  Sliders,
  CheckCircle,
  Eye,
  TrendingUp,
  Download,
  FileCheck,
  BadgeCheck,
  Briefcase,
  Layers3,
  Activity,
  AlertTriangle,
  QrCode,
  DollarSign,
  Fingerprint,
  Cpu,
  Terminal,
  Radio,
  Search,
  Compass,
  CornerDownLeft,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Globe,
  Flame,
  CheckCheck,
  Network
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- AI Prompts Database for Interactive AI Terminal ---
interface AIPromptPreset {
  id: string;
  category: string;
  label: string;
  prompt: string;
  badge: string;
  response: {
    title: string;
    citation: string;
    metrics: { label: string; value: string; color: string }[];
    details: string[];
    actionLabel: string;
  };
}

const AI_PROMPT_PRESETS: AIPromptPreset[] = [
  {
    id: "eos_calc",
    category: "نظام العمل والتعويضات",
    label: "احسب مكافأة نهاية الخدمة (استقالة بعد 4 سنوات)",
    prompt: "احسب استحقاق مكافأة نهاية الخدمة لموظف براتب أساسي 12,000 ر.س، وبدلات 3,000 ر.س، أمضى 4 سنوات وقدم استقالته وفق نظام العمل السعودي.",
    badge: "المادة 84 & 85",
    response: {
      title: "احتساب مكافأة نهاية الخدمة الاستباقي (المادة 85 نظام العمل)",
      citation: "المرجع النظامي: المادة 85 (حالة الاستقالة بعد مدة خدمة بين سنتين و5 سنوات)",
      metrics: [
        { label: "الأجر الفعلي المعتمد", value: "15,000 ر.س", color: "emerald" },
        { label: "نسبة الاستحقاق بالاستقالة", value: "ثلث المكافأة (1/3)", color: "cyan" },
        { label: "إجمالي المكافأة المستحقة", value: "10,000 ر.س", color: "emerald" },
        { label: "فترة الإشعار المعتمدة", value: "60 يوماً متوافقة", color: "purple" }
      ],
      details: [
        "تم احتساب نصف أجر شهر عن كل سنة من السنوات الأربع الأولى: (15,000 ÷ 2) × 4 = 30,000 ر.س كإجمالي أولي.",
        "بناءً على المادة 85 من نظام العمل السعودي: يستحق الموظف المستقيل ثلث المكافأة (30,000 × 1/3 = 10,000 ر.س).",
        "تمت مطابقة رصيد الإجازات المتبقي (14 يوماً) وإضافته لنموذج المخالصة النهائية الآلي بنقرة واحدة."
      ],
      actionLabel: "تصدير مسودة المخالصة المالية المعتمدة"
    }
  },
  {
    id: "wps_audit",
    category: "حماية الأجور والرواتب",
    label: "تدقيق مسير الرواتب ومنع رفض مدد SIF",
    prompt: "قم بالفحص الاستباقي لملف مسير الرواتب لشهر أغسطس وتحقق من تطابق أجور 48 موظفاً مع التأمينات الاجتماعية وبنوك المملكة.",
    badge: "WPS 3.0 مدد",
    response: {
      title: "تقرير الفحص الذكي الاستباقي لملف حماية الأجور (WPS Audit)",
      citation: "المرجع: اشتراطات منصة مدد وبنك الراجحي / الأهلي / الإنماء",
      metrics: [
        { label: "جاهزية ملف SIF", value: "100% مدقق", color: "emerald" },
        { label: "نسبة الامتثال المتوقعة", value: "99.8%", color: "emerald" },
        { label: "تطابق التأمينات (GOSI)", value: "48/48 مطابق", color: "teal" },
        { label: "مخاطر الرفض البنكي", value: "0 ملاحظة", color: "cyan" }
      ],
      details: [
        "تم التحقق التلقائي من عدم وجود رواتب تقل عن المسجل في عقد قوى الموثق.",
        "تمت تسوية خصومات الغياب والتأخير بنسبة لا تتجاوز الحدود النظامية (المادة 92).",
        "تم توليد ملف SIF القياسي المشفر وجاهزيته للإرسال المباشر لبوابة المنشأة في مدد."
      ],
      actionLabel: "توليد ملف SIF المعتمد للبنك"
    }
  },
  {
    id: "nitaqat_sim",
    category: "التوطين ونطاقات",
    label: "محاكاة تعيين 3 مقيمين وتأثيرها على النطاق",
    prompt: "لدينا 32 موظفاً (14 سعودياً و18 مقيماً)، ما هو تأثير استقطاب 3 مقيمين إضافيين على نطاق المنشأة وهل نحتاج توظيف سعودي؟",
    badge: "نطاقات 2026",
    response: {
      title: "محاكاة ذكية لنسبة التوطين ومسار نطاقات المنشأة",
      citation: "المرجع: دليل نطاقات المحدث لوزارة الموارد البشرية والتنمية الاجتماعية",
      metrics: [
        { label: "نسبة التوطين الحالية", value: "43.75% (بلاتيني)", color: "emerald" },
        { label: "النسبة بعد توظيف 3 مقيمين", value: "40.0% (أخضر مرتفع)", color: "teal" },
        { label: "مستوى الأمان النظامي", value: "آمن ومستقر", color: "cyan" },
        { label: "السعوديون المطلوبون للبلاتيني", value: "1 موظف سعودي", color: "purple" }
      ],
      details: [
        "المنشأة تظل في النطاق (الأخضر المرتفع) ولن تتأثر الخدمات الحكومية أو نقل الكفالات.",
        "توصية حامد: توظيف كادر سعودي واحد براتب ≥ 4,000 ر.س لضمان الحفاظ على النطاق البلاتيني والحصول على حوافز صندوق هدف.",
        "تم تحديث خطة الاستقطاب الفصلية تلقائياً في لوحة الإدارة."
      ],
      actionLabel: "فتح خطة التوظيف الاستباقية"
    }
  },
  {
    id: "gro_radar",
    category: "رادار الامتثال الحكومي",
    label: "فحص الوثائق والتراخيص الحرجة (90 يوماً)",
    prompt: "أظهر قائمة الإقامات، رخص العمل، والسجلات التجارية التي توشك على الانتهاء خلال الـ 90 يوماً القادمة لمنع الغرامات.",
    badge: "GRO Radar v3",
    response: {
      title: "رادار الرقابة اللحظية للوثائق والامتثال المؤسسي",
      citation: "المرجع: منصة مقيم، وزارة التجارة، الدفاع المدني، منصة بلدي",
      metrics: [
        { label: "الوثائق المراقبة", value: "142 وثيقة", color: "emerald" },
        { label: "وثائق حرجة (<30 يوم)", value: "2 إقامة (مقيم)", color: "amber" },
        { label: "وثائق متوسطة (<60 يوم)", value: "3 رخص عمل", color: "cyan" },
        { label: "غرامات تم تفاديها", value: "12,500 ر.س", color: "emerald" }
      ],
      details: [
        "تم إرسال إشعار تجديد آلي لمسؤول العلاقات الحكومية وللموظف لتحديث التأمين الطبي.",
        "تم رصد سداد الرسوم عبر منصة مقيم وحساب سداد المنشأة دون أي تأخير.",
        "السجل التجاري وعضوية الغرفة التجارية ساريتان لأكثر من 18 شهراً."
      ],
      actionLabel: "تجديد الإقامات عبر مقيم مباشرة"
    }
  }
];

// --- Futuristic Services Showcase Catalog ---
const FUTURISTIC_SERVICES = [
  {
    id: "wps_engine",
    title: "محرك الرواتب الذكي وحماية الأجور WPS 3.0",
    category: "المالية والأجور المؤتمتة",
    tagline: "أتمتة شاملة لمسيرات الرواتب، خصومات التأمينات GOSI، وتوليد ملفات SIF في 30 ثانية",
    icon: FileSpreadsheet,
    color: "emerald",
    highlightStat: "0% نسبة رفض بنكي",
    subStat: "متوافق 100% مع مدد والراجحي والأهلي",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    features: [
      "توليد فوري لملف حماية الأجور بصيغة SIF المشفرة والمعتمدة لدى مدد",
      "حساب تلقائي دقيق لاشتراكات التأمينات الاجتماعية (GOSI) للسعوديين والمقيمين",
      "معالجة البدلات، السلف، الاستقطاعات، وساعات العمل الإضافي بنقرة واحدة",
      "إصدار قسائم رواتب مشفرة تُرسل تلقائياً إلى تطبيق الجوال والبريد"
    ]
  },
  {
    id: "saudization_radar",
    title: "رادار التوطين ونطاقات الذكي",
    category: "الامتثال والتخطيط الاستراتيجي",
    tagline: "مراقبة حية لمؤشر نطاقات، محاكاة القرارات التوظيفية، وتفادي هبوط النطاق مسبقاً",
    icon: TrendingUp,
    color: "cyan",
    highlightStat: "نطاق بلاتيني مضمون",
    subStat: "تنبيهات استباقية قبل 180 يوماً",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    features: [
      "محاكاة استقطاب أو إنهاء العقود وانعكاسها المباشر على نسبة التوطين",
      "ربط لحظي بمعايير وزارة الموارد البشرية وبرامج الدعم (صندوق هدف)",
      "تقارير امتثال ربع سنوية جاهزة للعرض على مجلس الإدارة",
      "توصيات ذكية بالوظائف المستهدفة للتوطين وتكاليفها التقديرية"
    ]
  },
  {
    id: "biometric_attendance",
    title: "الحضور الذكي والسياج الجغرافي الحي",
    category: "إدارة القوى العاملة والدوام",
    tagline: "إثبات الدوام عبر بصمة الوجه والموقع الجغرافي المشفر مع ربط لحظي بمسير الرواتب",
    icon: Fingerprint,
    color: "teal",
    highlightStat: "0.3 ثانية سرعة البصمة",
    subStat: "سياج جغرافي دقيق بالفروع والمشاريع",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    features: [
      "تحقق بيومتري متطور يمنع التلاعب وتسجيل الحضور بالنيابة",
      "جدولة الورديات المرنة والمناوبات التلقائية بحسب طبيعة العمل",
      "احتساب آلي للتأخير والاستئذان وربطه بمسير الرواتب بنظام العمل",
      "تطبيق جوال خفيف وسريع يعمل دون الحاجة لأجهزة بصمة مادية مكلفة"
    ]
  },
  {
    id: "employee_experience",
    title: "بوابة الموظف الرقمية والخدمة الذاتية",
    category: "تجربة الكفاءات والموظفين",
    tagline: "تطبيق جوال فائق السلاسة لطلب الإجازات، السلف، والشهادات المختومة بالرمز الرقمي",
    icon: Smartphone,
    color: "purple",
    highlightStat: "< 15 ثانية للطلب",
    subStat: "شهادات تعريف بالراتب معتمدة بـ QR",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    features: [
      "إصدار خطابات التعريف بالراتب المعتمدة رقمياً بالختم ورمز التحقق QR",
      "طلب الإجازات والاطلاع على الرصيد المستحق ومسار الموافقات اللحظي",
      "استعراض قسائم الرواتب التاريخية مع التفصيل الكامل للبدلات والخصومات",
      "سلاسل موافقات إدارية ديناميكية تتكيف مع الهيكل التنظيمي للمنشأة"
    ]
  }
];

// --- Saudi Government Neural Integrations ---
const SAUDI_INTEGRATIONS = [
  { name: "منصة قوى (Qiwa)", subtitle: "توثيق العقود واللوائح", badge: "API v2.4 Live", icon: Building2, status: "نشط 100%" },
  { name: "منصة مدد (Mudad)", subtitle: "حماية الأجور WPS 3.0", badge: "SIF Ready", icon: FileSpreadsheet, status: "نشط 100%" },
  { name: "التأمينات (GOSI)", subtitle: "الاشتراكات والتوطين", badge: "Sync Live", icon: ShieldCheck, status: "نشط 100%" },
  { name: "منصة مقيم (Muqeem)", subtitle: "الإقامات وتأشيرات العمل", badge: "Direct Connect", icon: Users, status: "نشط 100%" },
  { name: "العنوان الوطني (SPL)", subtitle: "التحقق الجغرافي للمنشأة", badge: "Verified", icon: QrCode, status: "نشط 100%" },
  { name: "النفاذ الوطني (Nafath)", subtitle: "الدخول المؤسسي الموحد", badge: "SSO Biometric", icon: Lock, status: "نشط 100%" }
];

export default function MarketingHome() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Interactive AI Terminal State ---
  const [selectedPromptId, setSelectedPromptId] = useState<string>("wps_audit");
  const [customPromptInput, setCustomPromptInput] = useState<string>("");
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [typedResponseText, setTypedResponseText] = useState<string>("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // --- Interactive Services Showcase State ---
  const [activeServiceTab, setActiveServiceTab] = useState<number>(0);

  // --- Interactive Saudization Simulator State ---
  const [saudiCount, setSaudiCount] = useState<number>(18);
  const [expatCount, setExpatCount] = useState<number>(24);

  // --- Interactive Payroll Simulator State ---
  const [payrollEmployees, setPayrollEmployees] = useState<number>(48);
  const [avgSalary, setAvgSalary] = useState<number>(8500);
  const [isAuditingPayroll, setIsAuditingPayroll] = useState<boolean>(false);
  const [auditSuccess, setAuditSuccess] = useState<boolean>(true);

  // --- Interactive ROI & Savings Calculator State ---
  const [roiHeadcount, setRoiHeadcount] = useState<number>(65);
  const [roiManualHours, setRoiManualHours] = useState<number>(38);

  // --- Interactive Self-Service Mobile Simulator App Screen ---
  const [mobileActiveApp, setMobileActiveApp] = useState<"certificate" | "leave" | "payslip" | "loan">("certificate");

  // --- Quick Demo Request Form State ---
  const [demoName, setDemoName] = useState("");
  const [demoCompany, setDemoCompany] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoEmployees, setDemoEmployees] = useState("10-50");
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  // Selected Active Preset
  const activePromptPreset = AI_PROMPT_PRESETS.find((p) => p.id === selectedPromptId) || AI_PROMPT_PRESETS[0];

  // AI Response Typing Simulation Effect
  useEffect(() => {
    setIsAITyping(true);
    setTypedResponseText("");
    const fullText = activePromptPreset.response.details.join(" \n\n");
    let currentIdx = 0;

    const timer = setInterval(() => {
      if (currentIdx < fullText.length) {
        setTypedResponseText(fullText.slice(0, currentIdx + 4));
        currentIdx += 4;
      } else {
        setTypedResponseText(fullText);
        setIsAITyping(false);
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [selectedPromptId]);

  // Keyboard shortcut (Ctrl+K / Cmd+K) for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate dynamic Saudization metrics
  const totalHeadcount = saudiCount + expatCount;
  const saudizationPercent = totalHeadcount > 0 ? ((saudiCount / totalHeadcount) * 100).toFixed(1) : "0";
  const numSaudization = parseFloat(saudizationPercent);

  let nitaqatTier = "بلاتيني";
  let nitaqatColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  let nitaqatAdvise = "المنشأة في قمة الأمان والاستقرار ومؤهلة لكافة التأشيرات الفورية";

  if (numSaudization < 15) {
    nitaqatTier = "أحمر (حرج)";
    nitaqatColor = "text-rose-400 border-rose-500/40 bg-rose-500/10";
    nitaqatAdvise = "تنبيه حرج: توقف خدمات نقل الكفالة والتأشيرات حتى رفع النسبة";
  } else if (numSaudization < 25) {
    nitaqatTier = "أخضر منخفض";
    nitaqatColor = "text-amber-400 border-amber-500/40 bg-amber-500/10";
    nitaqatAdvise = "مقبول جزئياً مع قيود على بعض التأشيرات التوسعية";
  } else if (numSaudization < 38) {
    nitaqatTier = "أخضر مرتفع";
    nitaqatColor = "text-teal-400 border-teal-500/40 bg-teal-500/10";
    nitaqatAdvise = "وضع آمن مع إمكانية التوسع ونقل الخدمات بسهولة";
  }

  // Calculate dynamic Payroll total
  const totalBasePay = payrollEmployees * avgSalary;
  const estimatedGosi = Math.round(totalBasePay * 0.0975); // approx GOSI
  const netPayroll = totalBasePay - estimatedGosi;

  // Calculate dynamic ROI
  const calculatedMonthlySavings = Math.round(roiHeadcount * 180 + roiManualHours * 95);
  const calculatedYearlySavings = calculatedMonthlySavings * 12;
  const calculatedHoursSaved = Math.round(roiManualHours * 0.78);

  const handleAuditPayroll = () => {
    setIsAuditingPayroll(true);
    setTimeout(() => {
      setIsAuditingPayroll(false);
      setAuditSuccess(true);
      toast.success("تم التدقيق الذكي بنجاح: 0 ملاحظات، جاهز 100% لمدد وبنوك المملكة");
    }, 600);
  };

  const handleQuickDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoPhone.trim()) {
      toast.error("يرجى إدخال الاسم ورقم الجوال للتواصل");
      return;
    }
    setDemoSubmitting(true);
    setTimeout(() => {
      setDemoSubmitting(false);
      toast.success("تم استلام طلبك بنجاح! سيتواصل معك مهندس حلول HBS 2030 لتفعيل التجربة.");
      setDemoName("");
      setDemoCompany("");
      setDemoPhone("");
    }, 700);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#030908] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      
      {/* ── 1. Futuristic Smart HUD Top Bar ──────────────────────────────── */}
      <div className="bg-[#051310] border-b border-emerald-900/40 text-[11px] py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-emerald-400">
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="font-mono font-bold">HBS Neural OS v3.8 · Live Engine</span>
            </div>
            <span className="text-emerald-900">•</span>
            <div className="flex items-center gap-1 text-slate-300 font-mono">
              <Cpu className="size-3 text-emerald-400" />
              <span>زمن الاستجابة: 12ms</span>
            </div>
            <span className="text-emerald-900">•</span>
            <div className="flex items-center gap-1 text-slate-300 font-mono">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>أمن سيبراني سعودي (NCA Class A)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 hover:border-emerald-500 transition text-[10px] font-mono cursor-pointer"
            >
              <Terminal className="size-3" />
              <span>الأوامر الذكية السريعة</span>
              <kbd className="bg-emerald-900/60 px-1.5 py-0.2 rounded text-[9px] text-emerald-200 border border-emerald-700">Ctrl+K</kbd>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>الرياض، المملكة العربية السعودية 🇸🇦</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Futuristic Main Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#030908]/90 backdrop-blur-xl border-b border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Futuristic Holographic Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative size-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
              <div className="w-full h-full bg-[#04120F] rounded-[14px] flex items-center justify-center text-emerald-400">
                <Building2 className="size-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight font-mono">HBS 2030</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  SMART OS
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80 font-medium">المنظومة الذكية للموارد البشرية والرواتب</p>
            </div>
          </div>

          {/* Navigation Links with Futuristic Micro-badges */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#ai-terminal" className="hover:text-emerald-400 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span>مساعد حامد الذكي</span>
            </a>
            <a href="#smart-showcase" className="hover:text-emerald-400 transition px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              محركات المنظومة
            </a>
            <a href="#saudization-simulator" className="hover:text-emerald-400 transition flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              <TrendingUp className="size-3.5 text-cyan-400" />
              <span>محاكي نطاقات</span>
            </a>
            <a href="#mobile-simulator" className="hover:text-emerald-400 transition px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              تطبيق الخدمة الذاتية
            </a>
            <a href="#roi-calculator" className="hover:text-emerald-400 transition px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              حاسبة التوفير الذكية
            </a>
            <a href="#gov-matrix" className="hover:text-emerald-400 transition px-3 py-1.5 rounded-xl hover:bg-emerald-950/40">
              التكامل الحكومي
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-xs font-bold text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-xl h-10 px-4 cursor-pointer border border-emerald-900/40"
            >
              تسجيل الدخول
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("demo-form");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else setLocation("/request-demo");
              }}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl h-10 px-5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="size-3.5 fill-slate-950" />
              <span>تفعيل التجربة الذكية</span>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden size-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-emerald-950/60 border border-emerald-900/40"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#051310] border-b border-emerald-900/60 px-4 pt-3 pb-6 space-y-2">
            <a href="#ai-terminal" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-slate-200 hover:text-emerald-400">
              ✨ مساعد حامد الذكي
            </a>
            <a href="#smart-showcase" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-slate-200 hover:text-emerald-400">
              ⚙️ محركات المنظومة الذكية
            </a>
            <a href="#saudization-simulator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-slate-200 hover:text-emerald-400">
              📊 محاكي نطاقات والتوطين
            </a>
            <a href="#mobile-simulator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-slate-200 hover:text-emerald-400">
              📱 تطبيق الخدمة الذاتية
            </a>
            <a href="#roi-calculator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-slate-200 hover:text-emerald-400">
              💰 حاسبة العائد والتوفير
            </a>
            <div className="pt-3 border-t border-emerald-900/50 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); setLocation("/login"); }}
                className="w-full h-11 rounded-xl text-xs font-bold border-emerald-800 text-slate-200"
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById("demo-form");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full h-11 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black"
              >
                طلب عرض تجريبي فوري
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. Futuristic Cyber Hero Section ─────────────────────────────── */}
      <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        
        {/* Cyber Holographic Mesh & Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#0c2a21_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/20 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title Area */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            
            <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-4 py-1.5 text-xs font-mono font-bold text-emerald-300 shadow-lg shadow-emerald-500/10">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>المنظومة الذكية المستقبلية للموارد البشرية والرواتب 🇸🇦</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">VISION 2030</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.25]">
              نظام تشغيل ذكي ومستقبلي{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                لإدارة الموارد البشرية والرواتب
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              محركات ذكاء اصطناعي تشغيلية لأتمتة حماية الأجور (WPS 3.0)، التنبؤ بنطاقات، تدقيق مكافأة نهاية الخدمة، ومساعد «حامد» المعتمد على لوائح وزارة الموارد البشرية والتأمينات وقوى.
            </p>

            {/* Quick Hero Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  const el = document.getElementById("ai-terminal");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4 text-slate-950" />
                <span>جرّب المساعد الذكي «حامد» الآن</span>
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/app")}
                className="w-full sm:w-auto h-12 px-7 rounded-2xl border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Laptop className="size-4" />
                <span>دخول لوحة التحكم الحية</span>
              </Button>
            </div>
          </div>

          {/* ── 4. Interactive Live AI Terminal Sandbox («حامد AI 3.0») ─────── */}
          <div id="ai-terminal" className="mt-14 max-w-5xl mx-auto scroll-mt-24">
            
            {/* Outer Cyber Frame */}
            <div className="rounded-3xl border-2 border-emerald-600/40 bg-[#04110E] p-3 sm:p-5 shadow-2xl shadow-emerald-950/60 relative overflow-hidden">
              
              {/* Top Cyber Console Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#071F19] rounded-2xl border border-emerald-800/60 mb-4 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="size-3 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </div>
                  <span className="text-emerald-300 font-bold">HBS-HAMED-AI-CONSOLE // STAGE 3.0</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    SAUDI LABOR LAW 2026
                  </span>
                  <span className="text-emerald-500 font-bold hidden sm:inline">● متصل باللوائح</span>
                </div>
              </div>

              {/* Prompt Presets Selector Bar */}
              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <Terminal className="size-3.5" />
                  <span>اختر سيناريو ذكي لتجربة الاستجابة الفورية:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {AI_PROMPT_PRESETS.map((preset) => {
                    const isSelected = selectedPromptId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPromptId(preset.id)}
                        className={`p-3 rounded-xl text-right transition border cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? "bg-emerald-950/90 border-emerald-400 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50"
                            : "bg-[#061813] border-emerald-900/50 text-slate-300 hover:border-emerald-700 hover:bg-[#09221B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                            {preset.badge}
                          </span>
                          {isSelected && <Sparkles className="size-3 text-emerald-400 animate-spin" />}
                        </div>
                        <p className="text-xs font-bold text-slate-100 leading-tight">{preset.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Screen Body */}
              <div className="bg-[#020B09] rounded-2xl border border-emerald-900/70 p-5 sm:p-7 space-y-6 relative overflow-hidden">
                
                {/* Active Prompt Box */}
                <div className="p-4 rounded-xl bg-[#061C16] border border-emerald-800/60 flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BotMessageSquare className="size-4.5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">الاستفسار التشغيلي المقدم لحامد:</span>
                      <span className="text-[10px] text-slate-400 font-mono">{activePromptPreset.category}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      "{activePromptPreset.prompt}"
                    </p>
                  </div>
                </div>

                {/* AI Holographic Response Output */}
                <div className="space-y-4 pt-1">
                  
                  {/* Response Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-emerald-400" />
                      <h3 className="text-sm sm:text-base font-black text-emerald-300">
                        {activePromptPreset.response.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                      {activePromptPreset.response.citation}
                    </span>
                  </div>

                  {/* AI Computed Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {activePromptPreset.response.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[#051813] border border-emerald-800/50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                        <p className="text-sm sm:text-base font-black text-emerald-300 font-mono mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Streamed Explanation Box */}
                  <div className="p-4 rounded-xl bg-[#041410] border border-emerald-900/60 text-xs text-slate-300 leading-relaxed space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-emerald-900/40 pb-1.5">
                      <span>التحليل النظامي والتنفيذي:</span>
                      {isAITyping ? (
                        <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
                          <span>جارٍ التوليد الذكي...</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCheck className="size-3.5" />
                          <span>جاهز للاعتماد</span>
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-line text-slate-200 text-xs sm:text-sm">
                      {typedResponseText}
                      {isAITyping && <span className="inline-block w-2 h-4 bg-emerald-400 mr-1 animate-pulse" />}
                    </div>
                  </div>

                  {/* Terminal Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      <span>يتطلب اعتماد مسؤول الموارد البشرية النهائي لضمان أعلى معايير الحوكمة.</span>
                    </div>
                    <Button
                      onClick={() => {
                        toast.success(`تم تنفيذ الإجراء: ${activePromptPreset.response.actionLabel}`);
                      }}
                      className="w-full sm:w-auto h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>{activePromptPreset.response.actionLabel}</span>
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 5. Smart Futuristic Services Showcase (Interactive Engine Tabs) ─ */}
      <section id="smart-showcase" className="py-20 bg-[#04110E] border-y border-emerald-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-mono font-bold px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60">
              محركات HBS المستقبلية الأربعة
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              أدوات تشغيلية مؤتمتة تقود مستقبل منشأتك
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              حلول مصممة لتلبية متطلبات كبرى المنشآت والشركات السعودية المتنامية بأعلى كفاءة رقمية.
            </p>
          </div>

          {/* Service Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {FUTURISTIC_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              const isActive = activeServiceTab === idx;
              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveServiceTab(idx)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black"
                      : "bg-[#061B15] text-slate-300 border-emerald-900/50 hover:bg-[#0A261E] hover:border-emerald-700"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{srv.title.split(" ")[0]} {srv.title.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase Card */}
          {(() => {
            const activeSrv = FUTURISTIC_SERVICES[activeServiceTab];
            const Icon = activeSrv.icon;
            return (
              <div className="bg-gradient-to-br from-[#072019] via-[#041410] to-[#020A08] rounded-3xl border border-emerald-800/80 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details & Features */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        {activeSrv.category}
                      </span>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-slate-300">
                        {activeSrv.highlightStat}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white">{activeSrv.title}</h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeSrv.tagline}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2.5 pt-1">
                      {activeSrv.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                          <div className="size-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="size-3.5" />
                          </div>
                          <span className="leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60">
                        <Activity className="size-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 font-mono">{activeSrv.subStat}</span>
                      </div>
                      <Button
                        onClick={() => {
                          const el = document.getElementById("demo-form");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 shadow-md transition cursor-pointer"
                      >
                        تفعيل محرك {activeSrv.title.split(" ")[0]}
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Visual Showcase Frame */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-700/50 shadow-2xl group">
                      <img
                        src={activeSrv.image}
                        alt={activeSrv.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020A08] via-black/40 to-transparent" />
                      
                      <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-[#041712]/90 backdrop-blur-md border border-emerald-600/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{activeSrv.title}</p>
                            <p className="text-[10px] text-emerald-300/80 font-mono">{activeSrv.highlightStat}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-1 rounded bg-emerald-500 text-slate-950">
                          LIVE ENGINE
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ── 6. Smart Interactive Saudization & Nitaqat Matrix Simulator ──── */}
      <section id="saudization-simulator" className="py-20 bg-[#030908] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              محاكي التوطين الاستباقي 🇸🇦
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              محاكي نطاقات الذكي: خطط لقراراتك التوظيفية بثقة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              حرّك أشرطة التمرير لمشاهدة الانعكاس المباشر لتوظيف الكوادر السعودية أو المقيمين على نطاق منشأتك وحالة الخدمات الحكومية.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#051813] rounded-3xl border border-emerald-800/80 p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* Sliders Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Saudi Employees Slider */}
              <div className="space-y-3 bg-[#030E0B] p-5 rounded-2xl border border-emerald-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Users className="size-4" />
                    <span>عدد الكوادر السعودية:</span>
                  </span>
                  <span className="text-lg font-black text-emerald-300 font-mono">{saudiCount} موظفاً</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={saudiCount}
                  onChange={(e) => setSaudiCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Expat Employees Slider */}
              <div className="space-y-3 bg-[#030E0B] p-5 rounded-2xl border border-emerald-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UsersRound className="size-4" />
                    <span>عدد الكوادر غير السعودية:</span>
                  </span>
                  <span className="text-lg font-black text-slate-200 font-mono">{expatCount} موظفاً</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={expatCount}
                  onChange={(e) => setExpatCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

            </div>

            {/* Live Holographic Results Gauge */}
            <div className="bg-[#020B09] p-6 rounded-2xl border border-emerald-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-mono">نسبة التوطين المحسوبة اللحظية:</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                    {saudizationPercent}%
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-slate-400 font-mono">تصنيف المنشأة في نطاقات:</p>
                  <span className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-black font-mono border ${nitaqatColor}`}>
                    {nitaqatTier}
                  </span>
                </div>
              </div>

              {/* Advisory Box */}
              <div className="p-4 rounded-xl bg-[#061C16] border border-emerald-800/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                  <span>{nitaqatAdvise}</span>
                </div>
                <Button
                  onClick={() => {
                    toast.success("تم تحديث خطة التوطين وتصديرها بصيغة PDF في لوحة التقارير");
                  }}
                  className="h-8 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-bold shrink-0"
                >
                  تصدير تقرير نطاقات
                </Button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 7. Interactive Next-Gen Mobile Self-Service Simulator ────────── */}
      <section id="mobile-simulator" className="py-20 bg-[#04110E] border-t border-emerald-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-mono font-bold px-3.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              تطبيق الجوال والخدمة الذاتية 📱
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              تجربة رقمية فائقة للموظف على الجوال والويب
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              انقر على التبويبات لتجربة شاشات الخدمة الذاتية الحية وإصدار المستندات الرقمية المعتمدة فوراً.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Left Column: Interactive Apps List */}
            <div className="lg:col-span-6 space-y-3">
              {[
                {
                  id: "certificate",
                  title: "خطاب تعريف بالراتب موثق بـ QR",
                  desc: "إصدار فوري لشهادة الراتب المعتمدة بختم المنشأة الرقمي ورمز التحقق للجهات التمويلية والبنوك.",
                  icon: QrCode,
                  badge: "فوري 100%"
                },
                {
                  id: "leave",
                  title: "طلب إجازة ذكي مع رصيد لحظي",
                  desc: "تقديم طلب الإجازة السنوية أو المرضية وحساب الرصيد المتبقي تلقائياً وفق نظام العمل.",
                  icon: CalendarCheck,
                  badge: "موافقة سريعة"
                },
                {
                  id: "payslip",
                  title: "قسيمة الراتب المشفرة وتفاصيل البدلات",
                  desc: "استعراض مسير الراتب الشهري وتفاصيل خصومات التأمينات وساعات العمل الإضافية بكل شفافية.",
                  icon: FileText,
                  badge: "مشفرة وآمنة"
                },
                {
                  id: "loan",
                  title: "طلب سلفة مالية واحتساب الأقساط",
                  desc: "تقديم طلب سلفة مع جدول سداد آلي يُقتطع تلقائياً من مسير الرواتب القادم.",
                  icon: DollarSign,
                  badge: "جدولة تلقائية"
                }
              ].map((app) => {
                const Icon = app.icon;
                const isSelected = mobileActiveApp === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setMobileActiveApp(app.id as any)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-[#08241C] border-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/50"
                        : "bg-[#030E0B] border-emerald-900/50 hover:bg-[#061A14] hover:border-emerald-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-emerald-500 text-slate-950" : "bg-emerald-950 text-emerald-400"
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white">{app.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{app.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: 3D Smartphone Interactive Screen Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[300px] sm:w-[320px] rounded-[40px] border-4 border-slate-800 bg-[#020A08] p-3 shadow-2xl shadow-emerald-950/80 relative">
                
                {/* Speaker & Camera Notch */}
                <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="size-1.5 rounded-full bg-slate-700" />
                </div>

                {/* Smartphone Screen Content */}
                <div className="bg-[#041410] rounded-[28px] border border-emerald-800/60 p-4 space-y-4 text-white min-h-[460px] flex flex-col justify-between">
                  
                  {/* App Header Inside Phone */}
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                        ع
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">عبدالعزيز الشمري</p>
                        <p className="text-[9px] text-emerald-400 font-mono">مطور برمجيات أول</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      نشط
                    </span>
                  </div>

                  {/* Dynamic Screen by Selected App */}
                  <div className="space-y-3 flex-1">
                    {mobileActiveApp === "certificate" && (
                      <div className="bg-[#020B09] p-3.5 rounded-xl border border-emerald-800/60 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-300">شهادة تعريف بالراتب</span>
                          <span className="text-[9px] font-mono text-slate-400">#CERT-2026-89</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-[10px] space-y-1 text-slate-300">
                          <p>الراتب الأساسي: <strong className="text-white">16,000 ر.س</strong></p>
                          <p>إجمالي البدلات: <strong className="text-white">4,000 ر.س</strong></p>
                          <p>الجهة الموجه إليها: <strong className="text-emerald-300">إلى من يهمه الأمر</strong></p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                            <QrCode className="size-6 text-emerald-300" />
                            <span>رمز تحقق إلكتروني</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[9px]">
                            مختوم رقمياً
                          </span>
                        </div>
                      </div>
                    )}

                    {mobileActiveApp === "leave" && (
                      <div className="bg-[#020B09] p-3.5 rounded-xl border border-emerald-800/60 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-300">طلب إجازة سنوية</span>
                          <span className="text-[9px] font-mono text-emerald-400">الرصيد: 21 يوماً</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-900/60 text-[10px] space-y-1 text-slate-300">
                          <p>من: <strong className="text-white">01 سبتمبر 2026</strong></p>
                          <p>إلى: <strong className="text-white">07 سبتمبر 2026 (7 أيام)</strong></p>
                          <p>حالة الطلب: <strong className="text-teal-400">بانتظار موافقة المدير المباشر</strong></p>
                        </div>
                        <button
                          onClick={() => toast.success("تم إرسال طلب الإجازة للمدير المباشر")}
                          className="w-full py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-bold cursor-pointer"
                        >
                          تأكيد وإرسال الطلب
                        </button>
                      </div>
                    )}

                    {mobileActiveApp === "payslip" && (
                      <div className="bg-[#020B09] p-3.5 rounded-xl border border-emerald-800/60 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-300">قسيمة راتب شهر أغسطس</span>
                          <span className="text-[9px] font-mono text-emerald-400">مدفوع بنجاح</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-950/40 text-[10px] space-y-1">
                          <div className="flex justify-between"><span>الأساسي والبدلات:</span><span className="font-mono text-white">20,000 ر.س</span></div>
                          <div className="flex justify-between text-rose-300"><span>خصم التأمينات (GOSI):</span><span className="font-mono">-1,950 ر.س</span></div>
                          <div className="flex justify-between border-t border-emerald-900 pt-1 font-bold text-emerald-300"><span>صافي المحول للبنك:</span><span className="font-mono">18,050 ر.س</span></div>
                        </div>
                      </div>
                    )}

                    {mobileActiveApp === "loan" && (
                      <div className="bg-[#020B09] p-3.5 rounded-xl border border-emerald-800/60 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-300">طلب سلفة راتب</span>
                          <span className="text-[9px] font-mono text-slate-400">الحد الأقصى: 10,000 ر.س</span>
                        </div>
                        <div className="p-2 rounded bg-purple-950/40 text-[10px] space-y-1">
                          <p>المبلغ المطلوب: <strong className="text-white">6,000 ر.س</strong></p>
                          <p>عدد الأقساط: <strong className="text-white">3 أشهر (2,000 ر.س/شهر)</strong></p>
                          <p>تاريخ بدء الخصم: <strong className="text-purple-300">راتب سبتمبر 2026</strong></p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Bottom Home Indicator */}
                  <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto" />

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. Interactive Enterprise ROI & Cost Savings Calculator ───────── */}
      <section id="roi-calculator" className="py-20 bg-[#030908] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60">
              حاسبة العائد على الاستثمار الذكية 💰
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              كم ستوفّر منشأتك سنوياً باستخدام منظومة HBS 2030؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              أدخل عدد موظفيك وساعات العمل اليدوي الحالية لتشاهد التوفير المالي والزمني المباشر.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#051813] rounded-3xl border border-emerald-800/80 p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Sliders Input Column */}
              <div className="space-y-6">
                
                {/* Headcount slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">إجمالي عدد الموظفين في المنشأة:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{roiHeadcount} موظفاً</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={roiHeadcount}
                    onChange={(e) => setRoiHeadcount(parseInt(e.target.value))}
                    className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10 موظفين</span>
                    <span>500</span>
                    <span>1000+ موظف</span>
                  </div>
                </div>

                {/* Manual HR Hours slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">ساعات العمل اليدوي في الرواتب شهرياً:</span>
                    <span className="text-base font-black text-cyan-400 font-mono">{roiManualHours} ساعة</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={roiManualHours}
                    onChange={(e) => setRoiManualHours(parseInt(e.target.value))}
                    className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 ساعات</span>
                    <span>60 ساعة</span>
                    <span>120+ ساعة</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Results Card */}
              <div className="bg-[#020B09] p-6 rounded-2xl border border-emerald-700/60 space-y-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-mono">التوفير المالي السنوي التقديري:</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                    {calculatedYearlySavings.toLocaleString()} ر.س
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono mt-0.5">({calculatedMonthlySavings.toLocaleString()} ر.س شهرياً)</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-900/60">
                  <div className="bg-[#061A14] p-3 rounded-xl border border-emerald-800/40">
                    <p className="text-[10px] text-slate-400">ساعات مستعادة شهرياً:</p>
                    <p className="text-lg font-black text-teal-300 font-mono mt-0.5">{calculatedHoursSaved} ساعة</p>
                  </div>
                  <div className="bg-[#061A14] p-3 rounded-xl border border-emerald-800/40">
                    <p className="text-[10px] text-slate-400">تقليل مخاطر الغرامات:</p>
                    <p className="text-lg font-black text-cyan-300 font-mono mt-0.5">99.8%</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const el = document.getElementById("demo-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer mt-2"
                >
                  احصل على دراسة جدوى مفصلة لمنشأتك
                </Button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 9. Saudi Government Neural Sync Matrix ──────────────────────── */}
      <section id="gov-matrix" className="py-16 bg-[#04110E] border-y border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              الربط والتكامل الحكومي المباشر 🇸🇦
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
              جاهزية تامة ومطابقة 100% مع البوابات والجهات الرسمية
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {SAUDI_INTEGRATIONS.map((gov, idx) => {
              const Icon = gov.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#030E0B] rounded-2xl border border-emerald-900/60 p-4 text-center space-y-2 shadow-sm hover:border-emerald-500 transition group"
                >
                  <div className="size-10 rounded-xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {gov.badge}
                  </span>
                  <p className="text-xs font-black text-white">{gov.name}</p>
                  <p className="text-[10px] text-slate-400">{gov.subtitle}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 10. Smart Demo Request Form (Instant Activation Box) ─────────── */}
      <section id="demo-form" className="py-20 bg-[#030908] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl border-2 border-emerald-600/40 bg-gradient-to-br from-[#061E17] via-[#041410] to-[#020A08] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40">
                <Sparkles className="size-3.5" />
                <span>عرض توضيحي مباشر وتفعيل فوري</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                جاهز لترقية إدارة الموارد البشرية والرواتب في منشأتك؟
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                املأ النموذج وسيقوم مستشار الحلول لدينا بالتواصل معك وتقديم عرض توضيحي مباشر مخصص لاحتياجات منشأتك.
              </p>

              <form onSubmit={handleQuickDemoSubmit} className="pt-2 space-y-3.5 max-w-lg mx-auto text-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 mb-1">الاسم الكريم *</label>
                    <Input
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="مثال: م. فهد القحطاني"
                      required
                      className="h-11 rounded-xl bg-[#020B09] border-emerald-800 text-white placeholder:text-slate-500 text-xs focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 mb-1">اسم المنشأة / الشركة</label>
                    <Input
                      value={demoCompany}
                      onChange={(e) => setDemoCompany(e.target.value)}
                      placeholder="مثال: شركة الرؤية المتقدمة"
                      className="h-11 rounded-xl bg-[#020B09] border-emerald-800 text-white placeholder:text-slate-500 text-xs focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 mb-1">رقم الجوال أو الواتساب *</label>
                    <Input
                      value={demoPhone}
                      onChange={(e) => setDemoPhone(e.target.value)}
                      placeholder="مثال: 05xxxxxxxx"
                      required
                      className="h-11 rounded-xl bg-[#020B09] border-emerald-800 text-white placeholder:text-slate-500 text-xs focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 mb-1">حجم المنشأة</label>
                    <select
                      value={demoEmployees}
                      onChange={(e) => setDemoEmployees(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#020B09] border border-emerald-800 text-white px-3 text-xs focus:border-emerald-400 outline-none"
                    >
                      <option value="1-10">من 1 إلى 10 موظفين</option>
                      <option value="10-50">من 10 إلى 50 موظفاً</option>
                      <option value="50-200">من 50 إلى 200 موظف</option>
                      <option value="200+">أكثر من 200 موظف</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={demoSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer mt-2"
                >
                  {demoSubmitting ? (
                    <span>جارٍ الإرسال والتأكيد...</span>
                  ) : (
                    <>
                      <span>تأكيد طلب العرض التجريبي المجاني</span>
                      <Send className="mr-2 size-4" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-emerald-400/80 pt-1">
                  🔒 بياناتك مشفرة ومحمية وفق نظام حماية البيانات الشخصية السعودي (PDPL).
                </p>
              </form>

            </div>

          </div>

        </div>
      </section>

      {/* ── 11. Futuristic Footer ────────────────────────────────────────── */}
      <footer className="bg-[#020A08] border-t border-emerald-900/60 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-emerald-900/50">
            
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold font-mono">
                <Building2 className="size-5" />
              </div>
              <div>
                <span className="text-base font-black text-white font-mono">HBS 2030</span>
                <p className="text-xs text-emerald-400 font-medium">المنظومة السحابية الذكية للموارد البشرية والرواتب</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
              <a href="#ai-terminal" className="hover:text-emerald-400 transition">مساعد حامد AI</a>
              <a href="#smart-showcase" className="hover:text-emerald-400 transition">المحركات</a>
              <a href="#saudization-simulator" className="hover:text-emerald-400 transition">محاكي نطاقات</a>
              <a href="#mobile-simulator" className="hover:text-emerald-400 transition">الخدمة الذاتية</a>
              <a href="#roi-calculator" className="hover:text-emerald-400 transition">حاسبة التوفير</a>
              <a href="#gov-matrix" className="hover:text-emerald-400 transition">التكامل الحكومي</a>
              <button onClick={() => setLocation("/login")} className="hover:text-emerald-400 transition cursor-pointer text-emerald-400">
                دخول المنصة
              </button>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} HBS 2030. جميع الحقوق محفوظة في المملكة العربية السعودية 🇸🇦.</p>
            <div className="flex items-center gap-4 text-[11px] text-emerald-500/80 font-mono">
              <span>NCA CLASS A CERTIFIED</span>
              <span>•</span>
              <span>PDPL COMPLIANT</span>
              <span>•</span>
              <span>RIYADH, KSA</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ── 12. Command Palette Quick Actions Dialog (Ctrl+K) ───────────── */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#041712] rounded-3xl border border-emerald-500/50 p-5 shadow-2xl text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono text-emerald-300">أوامر HBS السريعة الذكية (Command Runner)</span>
              </div>
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { title: "تدقيق مسير الرواتب وتوليد ملف مدد SIF", action: () => { setSelectedPromptId("wps_audit"); setCommandPaletteOpen(false); document.getElementById("ai-terminal")?.scrollIntoView({ behavior: "smooth" }); } },
                { title: "احتساب مكافأة نهاية الخدمة (المادة 84 & 85)", action: () => { setSelectedPromptId("eos_calc"); setCommandPaletteOpen(false); document.getElementById("ai-terminal")?.scrollIntoView({ behavior: "smooth" }); } },
                { title: "محاكاة نسبة التوطين ومسار نطاقات", action: () => { setCommandPaletteOpen(false); document.getElementById("saudization-simulator")?.scrollIntoView({ behavior: "smooth" }); } },
                { title: "فتح حاسبة العائد والتوفير المالي", action: () => { setCommandPaletteOpen(false); document.getElementById("roi-calculator")?.scrollIntoView({ behavior: "smooth" }); } },
                { title: "طلب عرض تجريبي مباشر لمنشأتك", action: () => { setCommandPaletteOpen(false); document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" }); } }
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={cmd.action}
                  className="w-full p-3 rounded-xl bg-[#020B09] hover:bg-emerald-950/80 border border-emerald-900/50 hover:border-emerald-500 text-right text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span>{cmd.title}</span>
                  <ChevronLeft className="size-4 text-emerald-400" />
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex justify-between pt-2 border-t border-emerald-900/40">
              <span>انقر على أي أمر لتنفيذه فوراً</span>
              <kbd className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-800">ESC للإغلاق</kbd>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
