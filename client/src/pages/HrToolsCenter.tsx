import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  ArrowLeft,
  BotMessageSquare,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Coins,
  Compass,
  Copy,
  Download,
  FileChartColumn,
  FileCode,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  ListChecks,
  Play,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  buildReadinessPriorities,
  resolveHrToolFromSearch,
  serviceGuideRoutes,
  type CompanySize,
  type HrChallenge,
  type HrToolId,
  type TeamStructure,
} from "@shared/hrTools";
import {
  resolveSaudiReviewedFromSearch,
  saudiComplianceChecklist,
  saudiComplianceReviewProgress,
  saudiComplianceSources,
} from "@shared/saudiCompliance";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { FormField } from "@/components/design-system";

type Tool = HrToolId | "wps-generator" | "gosi-calc" | "eosb-calc" | "nitaqat-sim" | "expiry-scanner" | null;

const toolCards = [
  {
    id: "wps-generator" as const,
    icon: FileSpreadsheet,
    title: "مولد ملفات حماية الأجور (WPS SIF)",
    text: "توليد ملفات الرواتب القياسية SIF 3.0 المعتمدة لدى منصة مدد وبنوك المملكة.",
    tone: "bg-ds-success-soft text-ds-emerald border-ds-success-border",
    label: "سكربت تشغيلي",
  },
  {
    id: "gosi-calc" as const,
    icon: Coins,
    title: "محرك اشتراكات التأمينات (GOSI)",
    text: "حساب دقيق لخصومات المعاشات وساند والأخطار المهنية وتطبيق سقف 45 ألف ر.س.",
    tone: "bg-ds-gold-soft text-ds-warning-deep border-ds-gold/30",
    label: "حاسبة تأمينات",
  },
  {
    id: "eosb-calc" as const,
    icon: Scale,
    title: "حاسبة نهاية الخدمة (مادتين 84 و85)",
    text: "احتساب مكافأة نهاية الخدمة بدقة الأيام وحالات الاستقالة أو إنهاء العقد.",
    tone: "bg-ds-brand-50 text-ds-brand-800 border-ds-brand-200",
    label: "نظام العمل السعودي",
  },
  {
    id: "nitaqat-sim" as const,
    icon: TrendingUp,
    title: "محاكي نطاقات والتوطين الذكي",
    text: "احتساب نقاط التوطين، أوزان ذوي الإعاقة (4x)، واكتشاف متطلبات النطاق البلاتيني.",
    tone: "bg-ds-brand-100 text-ds-brand-900 border-ds-brand-300",
    label: "محرك نطاقات",
  },
  {
    id: "expiry-scanner" as const,
    icon: ShieldAlert,
    title: "راصد الوثائق ذو الـ 7 مستويات",
    text: "فحص استباقي للإقامات والسجلات والتراخيص وتقدير رسوم المقابل المالي وسداد.",
    tone: "bg-ds-neutral-100 text-ds-neutral-900 border-ds-neutral-300",
    label: "علاقات حكومية",
  },
  {
    id: "readiness" as const,
    icon: Compass,
    title: "تشخيص جاهزية العمليات",
    text: "قيّم وضع العمليات الحالي وحدد أهم نقاط البداية لفريق الموارد البشرية.",
    tone: "bg-ds-brand-100 text-ds-brand-700 border-ds-brand-200",
    label: "تشخيص سريع",
  },
];

export default function HrToolsCenter() {
  const [active, setActive] = useState<Tool>(() =>
    resolveHrToolFromSearch(typeof window === "undefined" ? "" : window.location.search)
  );

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-7xl space-y-8 pb-12">
        
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ds-brand-950 via-ds-brand-900 to-ds-neutral-950 px-6 py-10 text-white md:px-10 shadow-xl">
          <div className="absolute -left-10 -top-16 size-52 rounded-full border-[22px] border-ds-brand-500/10" />
          <div className="absolute top-1/2 right-10 size-64 rounded-full bg-ds-gold/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-ds-gold-soft border border-white/10 mb-4">
              <Terminal className="size-3.5 text-ds-gold" />
              <span>مركز البرمجيات والأدوات التنفيذية · HBS 2030 Enterprise Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              أدوات تشغيلية، سكربتات أتمتة، وقرارات دقيقة.
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
              مكتبة متكاملة من حاسبات نظام العمل السعودي، مولدات ملفات حماية الأجور (WPS SIF 3.0)، محركات التأمينات، وسكربتات Python القابلة للتشغيل المباشر داخل منشأتك.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-ds-brand-700">الأدوات والسكربتات الفورية</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">اختر أداة أو شغّل سكربت التنفيذ</h2>
            </div>
            <span className="rounded-full bg-ds-brand-50 border border-ds-brand-200 px-3.5 py-1 text-xs font-bold text-ds-brand-800">
              6 أدوات ومحركات برمجية نشطة
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setActive(card.id)}
                className={`group rounded-3xl border text-right p-6 transition transform hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between ${
                  active === card.id
                    ? "border-ds-brand-600 bg-ds-brand-50/40 shadow-md ring-2 ring-ds-brand-500/20"
                    : "border-slate-200 bg-white hover:border-ds-brand-300 hover:shadow-md shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex size-11 items-center justify-center rounded-2xl ${card.tone}`}>
                      <card.icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {card.label}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold text-base text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{card.text}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-ds-brand-700">
                  <span>فتح وتشغيل الأداة</span>
                  <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Active Tool Dynamic Screen */}
        {active && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-5 text-ds-brand-600" />
                <div>
                  <p className="text-xs font-bold text-ds-brand-700">الأداة التنفيذية النشطة</p>
                  <h3 className="text-lg font-black text-slate-900">
                    {toolCards.find((t) => t.id === active)?.title || "أداة العمل"}
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActive(null)}
                className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                إغلاق الأداة
              </Button>
            </div>

            <div className="mt-6">
              {active === "wps-generator" && <WpsGeneratorTool />}
              {active === "gosi-calc" && <GosiCalculatorTool />}
              {active === "eosb-calc" && <EosbCalculatorTool />}
              {active === "nitaqat-sim" && <NitaqatSimulatorTool />}
              {active === "expiry-scanner" && <ExpiryScannerTool />}
              {active === "readiness" && <ReadinessTool />}
            </div>
          </section>
        )}

        {/* Developer / CLI Scripts Reference Card */}
        <section className="rounded-3xl border border-ds-brand-900 bg-ds-brand-950 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-ds-brand-500/20 text-ds-brand-300 border border-ds-brand-500/30">
                <Code2 className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">مكتبة سكربتات Python و CLI المستقلة</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تم توليد وحفظ كافة السكربتات التنفيذية داخل مجلد <code className="text-ds-gold font-mono">/scripts</code> في بيئة النظام وجاهزة للتشغيل الفوري.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-ds-brand-900 border border-ds-brand-800 text-ds-emerald-bright">
                wps_sif_generator.py
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-ds-brand-900 border border-ds-brand-800 text-ds-gold">
                gosi_contribution_calculator.py
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-ds-brand-900 border border-ds-brand-800 text-ds-brand-300">
                saudi_labor_law_eosb_calculator.py
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-ds-brand-900 border border-ds-brand-800 text-ds-brand-400">
                saudization_nitaqat_evaluator.py
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-ds-brand-900 border border-ds-brand-800 text-rose-400">
                document_expiry_monitor.py
              </span>
            </div>
          </div>
        </section>

        {/* Legal / Operational Notice */}
        <section className="rounded-3xl border border-ds-gold/30 bg-ds-gold-soft/50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 text-ds-warning-deep shrink-0" />
            <p className="text-xs sm:text-sm leading-6 text-ds-warning-deep">
              <strong>تنويه الامتثال والسيادة:</strong> صُممت هذه الأدوات والسكربتات استناداً إلى معايير وأنظمة وزارة الموارد البشرية والتنمية الاجتماعية، المؤسسة العامة للتأمينات الاجتماعية، ولوائح منصة مدد لحماية الأجور (WPS SIF 3.0). يُنصح دوماً بمراجعة مأمور الرواتب المعتمد أو المستشار القانوني للمنشأة قبل الاعتماد المالي النهائي.
            </p>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

// ── 1. WPS SIF 3.0 Generator Tool ─────────────────────────────────────────
function WpsGeneratorTool() {
  const [employerId, setEmployerId] = useState("7001928374");
  const [bankCode, setBankCode] = useState("RJHI");
  const [month, setMonth] = useState("2026-08");
  const [copied, setCopied] = useState(false);

  // Sample batch data
  const [staffList, setStaffList] = useState([
    { id: "EMP001", nationalId: "1089283746", name: "سعود خالد العتيبي", iban: "SA4480000412608010123456", basic: 14000, housing: 3500, other: 1500, deduct: 1852.5 },
    { id: "EMP002", nationalId: "1098472819", name: "فاطمة أحمد السالم", iban: "SA6510000001234567890123", basic: 18500, housing: 4625, other: 2000, deduct: 2446.88 },
    { id: "EMP003", nationalId: "2489281726", name: "محمد كمال الدين منصور", iban: "SA2120000009876543210987", basic: 9500, housing: 2375, other: 1000, deduct: 0 },
  ]);

  const generatedSIF = useMemo(() => {
    const totalCount = staffList.length;
    let totalNet = 0;
    let totalBasic = 0;
    let totalHousing = 0;
    let totalOther = 0;
    let totalDeduct = 0;

    const detailLines = staffList.map((s) => {
      const net = s.basic + s.housing + s.other - s.deduct;
      totalNet += net;
      totalBasic += s.basic;
      totalHousing += s.housing;
      totalOther += s.other;
      totalDeduct += s.deduct;
      return `EDR|${s.id}|${s.nationalId}|${s.name}|${s.iban}|${s.basic.toFixed(2)}|${s.housing.toFixed(2)}|${s.other.toFixed(2)}|${s.deduct.toFixed(2)}|${net.toFixed(2)}|PAID`;
    });

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = "1200";

    const header = `SCR|${employerId}|${bankCode}|${dateStr}|${timeStr}|${month}|${totalCount}|${totalNet.toFixed(2)}|SAR`;
    const trailer = `ECR|${totalCount}|${totalBasic.toFixed(2)}|${totalHousing.toFixed(2)}|${totalOther.toFixed(2)}|${totalDeduct.toFixed(2)}|${totalNet.toFixed(2)}`;

    return [header, ...detailLines, trailer].join("\r\n");
  }, [employerId, bankCode, month, staffList]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSIF);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([generatedSIF], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WPS_${employerId}_${month.replace("-", "")}.sif`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="text-xs font-bold text-slate-700">رقم المنشأة / 700</label>
          <Input
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            className="mt-1 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">رمز البنك المحول منه (Routing Code)</label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger className="mt-1 h-10 bg-white font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RJHI">RJHI — مصرف الراجحي</SelectItem>
              <SelectItem value="NCBK">NCBK — البنك الأهلي السعودي (SNB)</SelectItem>
              <SelectItem value="RIBL">RIBL — بنك الرياض</SelectItem>
              <SelectItem value="ALBI">ALBI — مصرف الإنماء</SelectItem>
              <SelectItem value="BJAZ">BJAZ — بنك الجزيرة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">شهر مسير الرواتب</label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 font-mono text-sm h-10 bg-white"
          />
        </div>
      </div>

      {/* Output Console */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <FileCode className="size-4" />
            WPS_{employerId}_{month.replace("-", "")}.sif (Mudad SIF 3.0 Format)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={copyToClipboard}
              variant="outline"
              className="h-8 rounded-lg text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            >
              {copied ? <Check className="size-3.5 text-emerald-400 ml-1" /> : <Copy className="size-3.5 ml-1" />}
              {copied ? "تم النسخ!" : "نسخ النص"}
            </Button>
            <Button
              size="sm"
              onClick={downloadFile}
              className="h-8 rounded-lg text-xs bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            >
              <Download className="size-3.5 ml-1" />
              تنزيل ملف .SIF
            </Button>
          </div>
        </div>

        <pre className="p-3 bg-black/50 rounded-xl overflow-x-auto text-[11px] leading-6 text-emerald-300 selection:bg-emerald-700">
          {generatedSIF}
        </pre>
      </div>
    </div>
  );
}

// ── 2. GOSI Contribution Calculator Tool ───────────────────────────────────
function GosiCalculatorTool() {
  const [isSaudi, setIsSaudi] = useState(true);
  const [basic, setBasic] = useState(12000);
  const [housing, setHousing] = useState(3000);

  const result = useMemo(() => {
    const subject = Math.min(basic + housing, 45000);
    const isCapped = basic + housing > 45000;

    if (isSaudi) {
      const empAnnuities = subject * 0.09;
      const empSaned = subject * 0.0075;
      const empTotal = empAnnuities + empSaned;

      const orgAnnuities = subject * 0.09;
      const orgSaned = subject * 0.0075;
      const orgHazards = subject * 0.02;
      const orgTotal = orgAnnuities + orgSaned + orgHazards;

      const poolTotal = empTotal + orgTotal;
      const nitaqatPoint = subject >= 4000 ? 1.0 : subject >= 3000 ? 0.5 : 0.0;

      return {
        subject,
        isCapped,
        empTotal,
        orgTotal,
        poolTotal,
        nitaqatPoint,
        empRate: "9.75%",
        orgRate: "11.75%",
        totalRate: "21.50%",
      };
    } else {
      const orgHazards = subject * 0.02;
      return {
        subject,
        isCapped,
        empTotal: 0,
        orgTotal: orgHazards,
        poolTotal: orgHazards,
        nitaqatPoint: 0,
        empRate: "0.00%",
        orgRate: "2.00%",
        totalRate: "2.00%",
      };
    }
  }, [isSaudi, basic, housing]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="text-xs font-bold text-slate-700">الجنسية ونوع الاشتراك</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsSaudi(true)}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isSaudi ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              مواطن سعودي
            </button>
            <button
              onClick={() => setIsSaudi(false)}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                !isSaudi ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              مقيم / وافد
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700">الراتب الأساسي (SAR)</label>
          <Input
            type="number"
            value={basic}
            onChange={(e) => setBasic(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700">بدل السكن الشهري (SAR)</label>
          <Input
            type="number"
            value={housing}
            onChange={(e) => setHousing(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-500">الأجر الخاضع للاشتراك</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{result.subject.toLocaleString("ar-SA")} ر.س</p>
          <p className="text-[11px] text-slate-500 mt-1">{result.isCapped ? "تم تطبيق السقف الأعلى (45,000 ر.س)" : "الأساسي + بدل السكن"}</p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
          <p className="text-xs font-bold text-amber-900">خصم الموظف ({result.empRate})</p>
          <p className="text-2xl font-black text-amber-900 mt-1 font-mono">{result.empTotal.toLocaleString("ar-SA")} ر.س</p>
          <p className="text-[11px] text-amber-700 mt-1">يُخصم شهرياً من مسير راتب الموظف</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-900">مساهمة المنشأة ({result.orgRate})</p>
          <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">{result.orgTotal.toLocaleString("ar-SA")} ر.س</p>
          <p className="text-[11px] text-emerald-700 mt-1">تتحملها المنشأة + الأخطار المهنية</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">إجمالي السداد الشهري للمؤسسة العامة للتأمينات الاجتماعية (GOSI)</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5 font-mono">{result.poolTotal.toLocaleString("ar-SA")} ر.س ({result.totalRate})</p>
        </div>
        {isSaudi && (
          <div className="text-left">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold">
              وزن نقطة التوطين (نطاقات): {result.nitaqatPoint}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Saudi EOSB Calculator Tool (Articles 84 & 85) ───────────────────────
function EosbCalculatorTool() {
  const [serviceYears, setServiceYears] = useState(6.5);
  const [lastWage, setLastWage] = useState(14000);
  const [reason, setReason] = useState<"termination" | "resignation" | "force_majeure">("termination");

  const calculation = useMemo(() => {
    let baseAward = 0;
    if (serviceYears <= 5.0) {
      baseAward = lastWage * 0.5 * serviceYears;
    } else {
      baseAward = lastWage * 0.5 * 5.0 + lastWage * 1.0 * (serviceYears - 5.0);
    }

    let multiplier = 1.0;
    let reasonText = "استحقاق كامل 100% (المادة 84)";

    if (reason === "resignation") {
      if (serviceYears < 2.0) {
        multiplier = 0.0;
        reasonText = "استقالة قبل إكمال سنتين (لا يستحق مكافأة - المادة 85)";
      } else if (serviceYears <= 5.0) {
        multiplier = 1 / 3;
        reasonText = "استقالة بين سنتين و5 سنوات (ثلث المكافأة 33.3% - المادة 85)";
      } else if (serviceYears <= 10.0) {
        multiplier = 2 / 3;
        reasonText = "استقالة بين 5 و10 سنوات (ثلثا المكافأة 66.6% - المادة 85)";
      } else {
        multiplier = 1.0;
        reasonText = "استقالة بعد إكمال 10 سنوات (استحقاق كامل 100% - المادة 85)";
      }
    } else if (reason === "force_majeure") {
      multiplier = 1.0;
      reasonText = "استحقاق كامل استناداً للمادة 87 (قوة قاهرة / ترك عمل مبرر)";
    }

    const payableAward = baseAward * multiplier;

    return {
      baseAward,
      multiplier,
      payableAward,
      reasonText,
    };
  }, [serviceYears, lastWage, reason]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="text-xs font-bold text-slate-700">مدة الخدمة الإجمالية (بالسنوات)</label>
          <Input
            type="number"
            step="0.5"
            value={serviceYears}
            onChange={(e) => setServiceYears(Math.max(0.1, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">آخر أجر فعلي شهري (الأساسي + البدلات)</label>
          <Input
            type="number"
            value={lastWage}
            onChange={(e) => setLastWage(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">سبب إنهاء العلاقة التعاقدية</label>
          <Select value={reason} onValueChange={(v: any) => setReason(v)}>
            <SelectTrigger className="mt-2 h-10 bg-white text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="termination">إنهاء العقد من المنشأة / انتهاء المدة (م 84)</SelectItem>
              <SelectItem value="resignation">استقالة الموظف (م 85)</SelectItem>
              <SelectItem value="force_majeure">قوة قاهرة / زواج / وضع (م 87)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase">النتيجة والسند النظامي</p>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5">{calculation.reasonText}</h4>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-white/10 rounded-lg text-amber-300">
            نسبة الاستحقاق: {(calculation.multiplier * 100).toFixed(1)}%
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-2">
          <span className="text-sm text-slate-300">قيمة مكافأة نهاية الخدمة المستحقة للصرف:</span>
          <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 font-mono">
            {calculation.payableAward.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} <span className="text-base text-slate-300 font-sans">ر.س</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 4. Nitaqat Simulator Tool ──────────────────────────────────────────────
function NitaqatSimulatorTool() {
  const [fullSaudis, setFullSaudis] = useState(48);
  const [partSaudis, setPartSaudis] = useState(4);
  const [disabledSaudis, setDisabledSaudis] = useState(2);
  const [expats, setExpats] = useState(22);

  const evaluation = useMemo(() => {
    const rawSaudis = fullSaudis + partSaudis + disabledSaudis;
    const total = rawSaudis + expats;
    const maxDisabled4x = Math.max(1, Math.floor(rawSaudis * 0.1));
    const credited4x = Math.min(disabledSaudis, maxDisabled4x);
    const excess1x = disabledSaudis - credited4x;

    const points = fullSaudis * 1.0 + partSaudis * 0.5 + credited4x * 4.0 + excess1x * 1.0;
    const pct = total > 0 ? (points / total) * 100 : 0;

    let tier = "النطاق البلاتيني (Platinum)";
    let tierColor = "bg-amber-100 text-amber-900 border-amber-300";
    if (pct < 15) {
      tier = "النطاق الأحمر (غير ممتثل)";
      tierColor = "bg-rose-100 text-rose-900 border-rose-300";
    } else if (pct < 40) {
      tier = "النطاق الأخضر المنخفض";
      tierColor = "bg-yellow-100 text-yellow-900 border-yellow-300";
    } else if (pct < 60) {
      tier = "النطاق الأخضر المرتفع";
      tierColor = "bg-emerald-100 text-emerald-900 border-emerald-300";
    }

    return {
      rawSaudis,
      total,
      points,
      pct: pct.toFixed(2),
      tier,
      tierColor,
    };
  }, [fullSaudis, partSaudis, disabledSaudis, expats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="text-xs font-bold text-slate-700">سعوديين دوام كامل (1.0)</label>
          <Input
            type="number"
            value={fullSaudis}
            onChange={(e) => setFullSaudis(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">سعوديين دوام جزئي (0.5)</label>
          <Input
            type="number"
            value={partSaudis}
            onChange={(e) => setPartSaudis(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">ذوي الاحتياجات الخاصة (4.0)</label>
          <Input
            type="number"
            value={disabledSaudis}
            onChange={(e) => setDisabledSaudis(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700">الموظفين غير السعوديين</label>
          <Input
            type="number"
            value={expats}
            onChange={(e) => setExpats(Math.max(0, Number(e.target.value)))}
            className="mt-2 font-mono text-sm h-10 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500">إجمالي القوى العاملة</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{evaluation.total} موظفاً</p>
          <p className="text-xs text-slate-500 mt-1">سعوديين: {evaluation.rawSaudis} | وافدين: {expats}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500">نقاط التوطين المحتسبة</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{evaluation.points} نقطة</p>
          <p className="text-xs text-emerald-600 mt-1">نسبة التوطين: {evaluation.pct}%</p>
        </div>
        <div className={`p-5 rounded-2xl border ${evaluation.tierColor}`}>
          <p className="text-xs font-bold">النطاق المحقق للمنشأة</p>
          <p className="text-lg font-black mt-1">{evaluation.tier}</p>
          <p className="text-xs mt-1">تسهيلات حكومية وتأشيرات فورية</p>
        </div>
      </div>
    </div>
  );
}

// ── 5. Expiry Scanner Tool (7-Tier Monitor) ────────────────────────────────
function ExpiryScannerTool() {
  const sampleDocs = [
    { name: "إقامة مهندس نظم", owner: "م. أحمد الشربيني", days: 14, tier: "حرج جداً (داهم)", fee: 19850, color: "text-rose-700 bg-rose-50 border-rose-200" },
    { name: "رخصة بلدي - الرياض", owner: "مبنى الإدارة العامة", days: 4, tier: "حرج جداً (داهم)", fee: 1200, color: "text-rose-700 bg-rose-50 border-rose-200" },
    { name: "إقامة مستشار مالي", owner: "أ. حازم رضوان", days: 37, tier: "إشعار التجديد", fee: 10250, color: "text-amber-700 bg-amber-50 border-amber-200" },
    { name: "السجل التجاري الرئيسي", owner: "شركة حلول الغد", days: 83, tier: "تجهيز المخصصات", fee: 700, color: "text-sky-700 bg-sky-50 border-sky-200" },
    { name: "عقد قوى موثق", owner: "م. خالد القحطاني", days: 170, tier: "مستقر وممتد", fee: 0, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs font-bold text-slate-600">نتائج الفحص الاستباقي ذو الـ 7 مستويات للوثائق الحكومية:</p>
        <span className="text-xs font-bold text-emerald-700">5 وثائق مرصودة</span>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
        {sampleDocs.map((doc, idx) => (
          <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 transition">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${doc.color}`}>
                متبقي {doc.days} يوماً
              </span>
              <div>
                <p className="font-bold text-sm text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-500">الجهة / الموظف: {doc.owner}</p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs font-bold text-slate-700 block">{doc.tier}</span>
              {doc.fee > 0 ? (
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  سداد: {doc.fee.toLocaleString("ar-SA")} ر.س
                </span>
              ) : (
                <span className="text-xs text-slate-400">لا توجد رسوم</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 6. Legacy / Core Diagnosis Tools (Preserved) ───────────────────────────
function ReadinessTool() {
  const [, setLocation] = useLocation();
  const [size, setSize] = useState<CompanySize | "">("");
  const [structure, setStructure] = useState<TeamStructure | "">("");
  const [challenge, setChallenge] = useState<HrChallenge | "">("");
  const [result, setResult] = useState<string[] | null>(null);

  const assess = () => {
    if (!size || !structure || !challenge) return;
    setResult(buildReadinessPriorities({ size, structure, challenge }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-700">
          أجب عن ثلاث نقاط عامة للحصول على توصيات أولية قابلة للتنفيذ. التشخيص لا يقيّم الامتثال النظامي.
        </p>
        <FormField label="حجم الفريق">
          <Select value={size} onValueChange={(value) => setSize(value as CompanySize)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="اختر الحجم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">حتى 50 موظفاً</SelectItem>
              <SelectItem value="medium">51–200 موظف</SelectItem>
              <SelectItem value="large">أكثر من 200 موظف</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="نمط الفريق">
          <Select value={structure} onValueChange={(value) => setStructure(value as TeamStructure)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="اختر النمط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central">موقع أو فريق مركزي</SelectItem>
              <SelectItem value="distributed">فريق موزع أو متعدد المواقع</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="أبرز التحديات">
          <Select value={challenge} onValueChange={(value) => setChallenge(value as HrChallenge)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="اختر التحدي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="growth">النمو والتوظيف</SelectItem>
              <SelectItem value="visibility">وضوح الطلبات والمتابعة</SelectItem>
              <SelectItem value="consistency">توحيد العمليات والسياسات</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <Button
          onClick={assess}
          disabled={!size || !structure || !challenge}
          className="h-11 w-full rounded-xl bg-emerald-800 font-bold hover:bg-emerald-950 text-white"
        >
          <Compass className="ml-2 size-4" />
          إنشاء أولويات البداية
        </Button>
      </div>
      <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
        {result ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">أولويات مقترحة لفريقك</h3>
            </div>
            <div className="mt-5 space-y-3">
              {result.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white p-4 border border-slate-200">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setLocation("/hr-system")}
              variant="outline"
              className="mt-5 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              انتقل إلى مصمم نظام HR <ArrowLeft className="mr-2 size-4" />
            </Button>
          </>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Compass className="size-8 text-slate-400" />
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              ستظهر هنا أولويات مبدئية تساعدك على تحديد الخطوة التالية، ثم يمكنك تحويلها إلى خطة موارد بشرية مخصصة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
