import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPLETE_ENTERPRISE_TEAM, TeamMember } from "@/components/CinematicExecutiveIntro";
import {
  Users,
  Award,
  Scale,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  BotMessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ChevronLeft,
  FileText,
  Send,
  Building2,
  Coins,
  Clock3,
  Flame,
  Check,
  Layers,
  Zap,
  TrendingUp,
  Sliders,
  Copy,
  ExternalLink,
  MessageSquareQuote
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Pre-built expert consultation presets for quick interactive answers
const EXPERT_PRESETS: Record<string, { question: string; answer: string; articles: string[]; tip: string }> = {
  legal: {
    question: "كيف يتم تطبيق المادة 77 و 84 في إنهاء العقود غير محددة المدة وحساب مكافأة نهاية الخدمة؟",
    answer: "وفقاً لنظام العمل السعودي، في حال إنهاء العقد لسبب غير مشروع (م 77)، يستحق الطرف المتضرر أجر 15 يوماً عن كل سنة خدمة في العقود غير محددة المدة (بحد أدنى أجر شهرين). أما مكافأة نهاية الخدمة (م 84)، فتُحسب على أساس أجر نصف شهر عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة تالية، محسوبة على الأجر الفعلي الأخير.",
    articles: ["مادة 77 (التعويض عن الإنهاء غير المشروع)", "مادة 84 (احتساب مكافأة نهاية الخدمة)", "مادة 85 (حالات الاستقالة وتدرج الاستحقاق)"],
    tip: "يُنصح دائماً بتوثيق إشعار الإنهاء عبر منصة قوى لتفادي الدعاوى العمالية والنزاعات أمام المحاكم العمالية."
  },
  wps: {
    question: "ما هي شروط الامتثال لملف حماية الأجور WPS 3.0 عبر منصة مدد لتفادي حظر الخدمات؟",
    answer: "تشترط منصة مدد رفع ملف مسير الرواتب بصيغة SIF المعتمدة بحد أقصى اليوم العاشر من كل شهر ميلادي، مع ألا يقل الراتب المحول عن 80% من الراتب الموثق في عقد قوى، وألا تتجاوز نسبة الملاحظات 20%. نظام HBS يقوم بفحص الملف آلياً ومقارنته مع التأمينات قبل الرفع لضمان نسبة قبول 100%.",
    articles: ["لائحة برنامج حماية الأجور الوزارية", "ضوابط منصة مدد للتحقق البنكي", "نظام التأمينات الاجتماعية (الأجر الخاضع للاشتراك)"],
    tip: "احرص على مطابقة رقم الهوية أو الإقامة مع رقم الآيبان البنكي المعتمد لكل موظف قبل توليد الملف."
  },
  gro: {
    question: "ما هو الجدول الزمني المثالي لتجديد رخص العمل والإقامات لتفادي الغرامات؟",
    answer: "يعتمد رادار HBS ذو الـ 7 مستويات على إطلاق الإنذار الأول قبل 120 يوماً من الانتهاء، ثم 90 و 60 يوماً لتأمين المقابل المالي، و 30 يوماً للإشعار العاجل. تجديد الإقامة قبل 3 أيام على الأقل من تاريخ الانتهاء يمنع الغرامة المضاعفة (500 ريال للمرة الأولى و 1000 للمرة الثانية).",
    articles: ["نظام الإقامة وجوازات السفر", "ضوابط رخص العمل - وزارة الموارد البشرية", "منصة مقيم الإلكترونية"],
    tip: "الربط الآلي بين منصة مقيم وHBS يتيح تجديد رخص العمل فور سداد سداد دون الحاجة للتدخل اليدوي."
  },
  "gosi-spec": {
    question: "كيف يؤثر توظيف المواطنين وذوي الاحتياجات الخاصة على نسبة نطاقات والتأمينات؟",
    answer: "يُحسب الموظف السعودي بدوام كامل بواحد صحيح في نطاقات إذا كان أجره المسجل في التأمينات 4,000 ريال فأكثر، وبنصف موظف إذا كان بين 3,000 و 4,000 ريال. أما الموظف من ذوي الإعاقة القادر على العمل، فيُحسب بـ 4 موظفين في نطاقات بشرط عدم تجاوز نسبة 10% من إجمالي العاملين بالمنشأة.",
    articles: ["دليل برنامج نطاقات المطور", "لائحة التسجيل والاشتراكات في التأمينات (GOSI)", "حساب المعامل النسبي للتوطين"],
    tip: "تأكد من تسجيل الموظف في التأمينات قبل نهاية الشهر الميلادي لاحتسابه فورياً في مؤشر المنشأة بقوى."
  },
  "ai-lead": {
    question: "كيف يستنبط المساعد الذكي «حامد» القرارات الإدارية بأمان وموثوقية؟",
    answer: "تم تدريب «حامد» بنموذج لغوي تفسيري صارم يستند إلى نصوص نظام العمل السعودي ولائحة تنظيم العمل الداخلية المعتمدة للمنشأة. يقوم حامد بتحليل سياق الطلب واقتراح القرار مدعوماً برقم المادة القانونية، مع وضع زر «تأكيد المسؤول البشري» كشرط لا يمكن تجاوزه لتنفيذ أي معاملة.",
    articles: ["مبادئ حوكمة الذكاء الاصطناعي الوطنية (SDAIA)", "سياسة العزل التام لبيانات المنشآت", "الأتمتة الموجهة بالإشراف البشري"],
    tip: "يمكنك استخدام حامد لكتابة خطابات التكليف والإنذارات الرسمية وصياغة مذكرات الترقية بنقرة واحدة."
  },
  talent: {
    question: "ما هي أفضل ممارسة لبناء رحلة تهيئة الموظف الجديد (Onboarding) وقياس الأداء KPI؟",
    answer: "تبدأ رحلة التهيئة الناجحة قبل اليوم الأول بإرسال العقد الرقمي والترحيب عبر البوابة الذاتية، وتحديد أهداف الأشهر الثلاثة الأولى (فترة التجربة وفق م 53). يوفر HBS قوالب جاهزة لتقييم الأداء الربعي وربطه بحوافز مسير الرواتب تلقائياً.",
    articles: ["مادة 53 (ضوابط فترة التجربة والإنهاء)", "مصفوفة مؤشرات الأداء الوظيفي OKR/KPI", "برنامج ولاء واستبقاء الكفاءات"],
    tip: "وثّق تقييم فترة التجربة كتابياً قبل نهاية اليوم الـ 90 (أو 180 في حال تمديدها باتفاق مكتوب)."
  },
  legal_default: {
    question: "استفسار تنفيذي عام في الامتثال والموارد البشرية",
    answer: "فريق الخبراء في HBS يقدم استشارات شاملة تغطي لوائح العمل، حوكمة العقود الرقمية، التدقيق المالي ومطابقة الرواتب، والأمن السيبراني السحابي. يمكنك طرح أي تساؤل خاص بمنشأتك لتلقي توجيه فوري.",
    articles: ["نظام العمل واللوائح التنفيذية", "منظومة قوى ومدد والتأمينات", "معايير الأمن السيبراني NCA"],
    tip: "يمكنك إرفاق المذكرات وتصدير مخرجات الاستشارة كوثيقة رسمية موقعة من الفريق الاستشاري."
  }
};

export default function ExecutiveAdvisoryBoard() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConsultant, setActiveConsultant] = useState<TeamMember | null>(null);
  const [consultationQuery, setConsultationQuery] = useState("");
  const [consultationResponse, setConsultationResponse] = useState<{
    answer: string;
    articles: string[];
    tip: string;
    expertName: string;
    expertRole: string;
  } | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  // Active Comparison Tab for "HBS vs Jisr vs Traditional"
  const [comparisonMetric, setComparisonMetric] = useState<"ai" | "wps" | "gov" | "team" | "security">("ai");

  const filteredMembers = useMemo(() => {
    return COMPLETE_ENTERPRISE_TEAM.filter((m) => {
      const matchCategory = selectedCategory === "all" || m.category === selectedCategory;
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleStartConsultation = (member: TeamMember) => {
    setActiveConsultant(member);
    const preset = EXPERT_PRESETS[member.id] || EXPERT_PRESETS[member.category] || EXPERT_PRESETS.legal_default;
    setConsultationQuery(preset.question);
    setConsultationResponse(null);
  };

  const handleRunConsultation = () => {
    if (!activeConsultant) return;
    setIsConsulting(true);

    setTimeout(() => {
      const preset = EXPERT_PRESETS[activeConsultant.id] || EXPERT_PRESETS[activeConsultant.category] || EXPERT_PRESETS.legal_default;
      setConsultationResponse({
        answer: preset.answer,
        articles: preset.articles,
        tip: preset.tip,
        expertName: activeConsultant.name,
        expertRole: activeConsultant.role,
      });
      setIsConsulting(false);
      toast.success(`تم استلام التوجيه الاستشاري المعتمد من ${activeConsultant.name}`);
    }, 600);
  };

  const handleCopyConsultation = () => {
    if (!consultationResponse) return;
    const text = `استشارة معتمدة من: ${consultationResponse.expertName} (${consultationResponse.expertRole})\n\nالتوجيه:\n${consultationResponse.answer}\n\nالمستندات النظامية:\n- ${consultationResponse.articles.join("\n- ")}\n\nالتوصية:\n${consultationResponse.tip}`;
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ المذكرة الاستشارية إلى الحافظة");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8" dir="rtl">
        
        {/* ── Top Header Section (Jisr-style Ultra-Clean Bright Look) ──── */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <Users className="size-3.5 text-emerald-600" />
                <span>فريق العمل الاستشاري والتقني السيادي (10 خبراء ومستشارين)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                مركز الخبراء والاستشارات التنفيذية
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                يقف خلف منظومة HBS 2030 فريق متكامل يضم نخبة الكفاءات الوطنية المعتمدة في أنظمة العمل السعودي، حماية الأجور (WPS)، منصات قوى ومقيم والتأمينات، والذكاء الاصطناعي السيادي لمساعدتك في كل قرار.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleStartConsultation(COMPLETE_ENTERPRISE_TEAM[3])} // Dr. Ibrahim legal
                className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Scale className="ml-2 size-4" />
                طلب استشارة قانونية فورية
              </Button>
              <Button
                onClick={() => setLocation("/assistant")}
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs"
              >
                <BotMessageSquare className="ml-2 size-4 text-emerald-600" />
                استشارة الوكيل «حامد»
              </Button>
            </div>
          </div>

          {/* Quick Pillars Metric Badges */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5">
              <p className="text-[11px] font-bold text-slate-500">الخبراء المعتمدون</p>
              <p className="text-xl font-black text-slate-900 mt-1">10 مستشارين</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">جاهزية 24/7 داخل النظام</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5">
              <p className="text-[11px] font-bold text-slate-500">تغطية الامتثال السعودي</p>
              <p className="text-xl font-black text-slate-900 mt-1">100% متوافق</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">قوى · مدد · مقيم · التأمينات</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5">
              <p className="text-[11px] font-bold text-slate-500">حماية الأجور (WPS)</p>
              <p className="text-xl font-black text-slate-900 mt-1">تدقيق استباقي</p>
              <p className="text-[10px] text-blue-700 font-semibold mt-0.5">كشف الفروقات قبل البنك</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5">
              <p className="text-[11px] font-bold text-slate-500">أمن البيانات والسيادة</p>
              <p className="text-xl font-black text-slate-900 mt-1">AES-256 NCA</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">نظام حماية البيانات PDPL</p>
            </div>
          </div>
        </div>

        {/* ── Superior Model Comparison (HBS 2030 vs Jisr vs Legacy) ─── */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
                <Flame className="size-3.5 text-blue-600" />
                <span>النموذج المطور: HBS 2030 مقابل الأنظمة التقليدية (جسر / بيزات / إكسل)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                لماذا يعتبر نموذج HBS 2030 هو الخيار الأكثر تطوراً للمنشآت السعودية؟
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Feature 1: AI & Explanation */}
            <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <BotMessageSquare className="size-5" />
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  متفوق 10x
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">الذكاء التفسيري «حامد»</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                بينما تكتفي أنظمة مثل <strong className="text-slate-800">جسر</strong> بنماذج إدخال صامتة؛ يقوم <strong className="text-emerald-700">«حامد»</strong> بتحليل أي معاملة، توجيهها وفق مواد نظام العمل، وصياغة الخطابات الرسمية فورياً.
              </p>
              <div className="pt-2 border-t border-emerald-100 text-[11px] text-emerald-900 font-semibold space-y-1">
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  <span>تفسير مدعوم بنصوص نظام العمل</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  <span>موافقة بشرية إلزامية للأمان التام</span>
                </div>
              </div>
            </div>

            {/* Feature 2: WPS 3.0 & Zero Penalty */}
            <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-b from-blue-50/40 via-white to-white p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <FileSpreadsheet className="size-5" />
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  صفر غرامات
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">محرك WPS ومدد المسبق</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تدقيق ملفات حماية الأجور ومطابقة نسب التأمينات الاجتماعية (GOSI) تلقائياً واكتشاف الفروقات قبل رفع الملف للمصارف لتفادي رفض الملفات أو إيقاف الخدمات.
              </p>
              <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-900 font-semibold space-y-1">
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-blue-600" />
                  <span>توليد ملفات SIF متوافقة 100% مع مدد</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-blue-600" />
                  <span>مطابقة آلية لبيانات الآيبان والهوية</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Integrated 10-Expert Team */}
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/40 via-white to-white p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#D4AF37] text-slate-950 font-bold shadow-sm">
                  <Award className="size-5" />
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  فريق معتمد
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">فريق استشاري 10 خبراء</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                لا تتركك HBS لوحدك مع البرنامج؛ بل يرافقك فريق استشاري يضم خبراء قانون العمل، التأمينات، حماية الأجور، والعلاقات الحكومية لتقديم التوجيه المعتمد.
              </p>
              <div className="pt-2 border-t border-amber-100 text-[11px] text-amber-900 font-semibold space-y-1">
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-amber-700" />
                  <span>استشارات فورية مسندة للوائح</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-amber-700" />
                  <span>نماذج قرارات ومذكرات رسمية موقعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Interactive Consultation Terminal (When an expert is selected) ─ */}
        {activeConsultant && (
          <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-950 via-[#0A221A] to-[#061812] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl border flex items-center justify-center font-bold text-lg shadow-inner ${activeConsultant.avatarBg}`}>
                  <Users className="size-7 text-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{activeConsultant.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                      {activeConsultant.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">{activeConsultant.role}</p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">{activeConsultant.nationalIdRef}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveConsultant(null)}
                  className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
                >
                  إغلاق الجلسة
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-xs font-bold text-slate-200">
                موضوع الاستشارة أو السؤال التنفيذي:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={consultationQuery}
                  onChange={(e) => setConsultationQuery(e.target.value)}
                  placeholder="اكتب استفسارك هنا أو استخدم الاستفسار المقترح..."
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-xs flex-1 focus:border-emerald-400"
                />
                <Button
                  onClick={handleRunConsultation}
                  disabled={isConsulting || !consultationQuery.trim()}
                  className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs px-6 shadow-md hover:from-emerald-400 hover:to-teal-400 cursor-pointer"
                >
                  {isConsulting ? (
                    <span>جارٍ معالجة التوجيه الاستشاري...</span>
                  ) : (
                    <>
                      <Send className="ml-2 size-4" />
                      إرسال وتوليد التوجيه
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Consultation Output */}
              {consultationResponse && (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-black/40 p-5 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="size-4 text-emerald-400" />
                      <p className="text-xs font-bold text-emerald-300">
                        التوجيه الاستشاري الصادر عن {consultationResponse.expertName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyConsultation}
                      className="h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold"
                    >
                      <Copy className="ml-1.5 size-3.5" />
                      نسخ المذكرة الرسمية
                    </Button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-100 bg-white/5 p-3.5 rounded-xl border border-white/5">
                    {consultationResponse.answer}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                      <p className="text-[11px] font-bold text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
                        <Scale className="size-3.5" />
                        المستندات والمواد النظامية ذات العلاقة:
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {consultationResponse.articles.map((art, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                            <span>{art}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                      <p className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="size-3.5" />
                        توصية تنفيذية للمنشأة:
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {consultationResponse.tip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 10 Experts Grid & Interactive Directory ─────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">دليل أعضاء الفريق الاستشاري والتقني (10)</h2>
              <p className="text-xs text-slate-500">اختر أي مستشار لبدء جلسة استشارية فورية أو استعراض اختصاصاته</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-3 size-4 text-slate-400 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، التخصص أو المنصب..."
                className="h-10 pr-9 rounded-xl border-slate-200 bg-white text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Team Cards Grid (Jisr-style Ultra-Clean Bright Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-13 rounded-2xl border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${member.avatarBg}`}>
                        <Users className="size-6 text-current" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                          {member.name}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">{member.role}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{member.nationalIdRef}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {member.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {member.bio}
                  </p>

                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-700">
                    {member.credentials.map((cred, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Award className="size-3.5 text-emerald-600 shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    {member.titleEn}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleStartConsultation(member)}
                    className="h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 cursor-pointer"
                  >
                    استشارة فورية
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
