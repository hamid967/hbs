import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";
import { dsColors } from "./design-system/tokens";

// Realistic 6-month corporate performance dataset
const payrollTrendData = [
  {
    month: "أكتوبر",
    grossPayroll: 420000,
    netTransferred: 385000,
    wpsComplianceRate: 98.2,
    employeeCount: 42,
  },
  {
    month: "نوفمبر",
    grossPayroll: 435000,
    netTransferred: 398000,
    wpsComplianceRate: 99.1,
    employeeCount: 44,
  },
  {
    month: "ديسمبر",
    grossPayroll: 460000,
    netTransferred: 421000,
    wpsComplianceRate: 100.0,
    employeeCount: 46,
  },
  {
    month: "يناير",
    grossPayroll: 475000,
    netTransferred: 434000,
    wpsComplianceRate: 99.5,
    employeeCount: 48,
  },
  {
    month: "فبراير",
    grossPayroll: 480000,
    netTransferred: 439000,
    wpsComplianceRate: 100.0,
    employeeCount: 48,
  },
  {
    month: "مارس",
    grossPayroll: 492000,
    netTransferred: 451000,
    wpsComplianceRate: 100.0,
    employeeCount: 50,
  },
];

const attendanceTrendData = [
  {
    month: "أكتوبر",
    complianceRate: 94.2,
    punctualityRate: 92.5,
    leaveDaysTaken: 28,
    lateArrivalsRate: 5.8,
  },
  {
    month: "نوفمبر",
    complianceRate: 95.8,
    punctualityRate: 94.0,
    leaveDaysTaken: 22,
    lateArrivalsRate: 4.2,
  },
  {
    month: "ديسمبر",
    complianceRate: 96.5,
    punctualityRate: 95.1,
    leaveDaysTaken: 35,
    lateArrivalsRate: 3.5,
  },
  {
    month: "يناير",
    complianceRate: 97.4,
    punctualityRate: 96.2,
    leaveDaysTaken: 19,
    lateArrivalsRate: 2.6,
  },
  {
    month: "فبراير",
    complianceRate: 97.8,
    punctualityRate: 96.9,
    leaveDaysTaken: 16,
    lateArrivalsRate: 2.2,
  },
  {
    month: "مارس",
    complianceRate: 98.6,
    punctualityRate: 97.5,
    leaveDaysTaken: 14,
    lateArrivalsRate: 1.4,
  },
];

export default function PerformanceTrendsChart() {
  const [activeTab, setActiveTab] = useState<"payroll" | "attendance">("payroll");

  return (
    <section className="rounded-3xl border border-ds-neutral-200 bg-white p-6 shadow-xs space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ds-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-ds-brand-100 text-ds-brand-800">
              <TrendingUp className="size-4" />
            </span>
            <span className="text-xs font-bold text-ds-brand-500">تحليلات الأداء والامتثال</span>
          </div>
          <h2 className="mt-1 text-lg font-black text-ds-neutral-950">
            مؤشرات واتجاهات الأداء المؤسسي (Performance Trends)
          </h2>
          <p className="mt-0.5 text-xs text-ds-neutral-600">
            رسم بياني تفاعلي لكتلة الأجور وحماية الأجور (WPS مدد) ومعدلات الامتثال للدوام لآخر 6 أشهر.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-2xl bg-ds-neutral-100 p-1 border border-ds-neutral-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("payroll")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "payroll"
                ? "bg-white text-ds-brand-900 shadow-xs"
                : "text-ds-neutral-600 hover:text-ds-neutral-900"
            }`}
          >
            <Coins className="size-3.5" />
            مسارات الرواتب وWPS
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "attendance"
                ? "bg-white text-ds-brand-900 shadow-xs"
                : "text-ds-neutral-600 hover:text-ds-neutral-900"
            }`}
          >
            <Clock className="size-3.5" />
            انضباط الدوام والالتزام
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {activeTab === "payroll" ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <KPIBox
            title="إجمالي مسير الرواتب (مارس)"
            value="492,000 ر.س"
            change="+2.5%"
            trend="up"
            subtext="مقارنة بالشهر السابق"
          />
          <KPIBox
            title="المحوّل البنكي الصافي"
            value="451,000 ر.س"
            change="+2.7%"
            trend="up"
            subtext="عبر نظام سريع / البنوك"
          />
          <KPIBox
            title="نسبة حماية الأجور (WPS)"
            value="100.0%"
            change="مطابق تماماً"
            trend="neutral"
            subtext="اعتماد كامل من منصة مدد"
          />
          <KPIBox
            title="إجمالي الكادر المستلم"
            value="50 موظفاً"
            change="+2 موظف"
            trend="up"
            subtext="نمو القوة العاملة"
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-4">
          <KPIBox
            title="معدل الامتثال للدوام (مارس)"
            value="98.6%"
            change="+0.8%"
            trend="up"
            subtext="أعلى معدل فصلي"
          />
          <KPIBox
            title="نسبة الانضباط الزمني"
            value="97.5%"
            change="+0.6%"
            trend="up"
            subtext="حضور دون تأخير"
          />
          <KPIBox
            title="معدل التأخير والانحرافات"
            value="1.4%"
            change="-0.8%"
            trend="up"
            subtext="انخفاض قياسي في التأخير"
          />
          <KPIBox
            title="إجمالي أيام الإجازات"
            value="14 يوماً"
            change="-2 يوم"
            trend="up"
            subtext="خلال الشهر الحالي"
          />
        </div>
      )}

      {/* Main Chart Canvas */}
      <div className="rounded-2xl border border-ds-neutral-100 bg-ds-neutral-50/40 p-4">
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "payroll" ? (
              <AreaChart data={payrollTrendData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dsColors["brand-700"]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dsColors["brand-700"]} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dsColors.gold} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dsColors.gold} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dsColors["neutral-200"]} />
                <XAxis dataKey="month" tick={{ fill: dsColors["neutral-600"], fontSize: 12 }} axisLine={{ stroke: dsColors["neutral-200"] }} />
                <YAxis
                  tickFormatter={val => `${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: dsColors["neutral-600"], fontSize: 11 }}
                  axisLine={{ stroke: dsColors["neutral-200"] }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-2xl border border-ds-neutral-200 bg-white p-3.5 shadow-lg text-right font-sans" dir="rtl">
                        <p className="font-bold text-ds-neutral-900 border-b border-ds-neutral-100 pb-1.5 text-xs">
                          دورة شهر: {label}
                        </p>
                        <div className="mt-2 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ds-neutral-600 flex items-center gap-1">
                              <span className="size-2 rounded-full bg-ds-brand-700" />
                              إجمالي الرواتب:
                            </span>
                            <span className="font-bold text-ds-neutral-950 font-mono">
                              {Number(payload[0]?.value).toLocaleString("ar-SA")} ر.س
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ds-neutral-600 flex items-center gap-1">
                              <span className="size-2 rounded-full bg-ds-gold" />
                              الصافي المحول:
                            </span>
                            <span className="font-bold text-ds-neutral-950 font-mono">
                              {Number(payload[1]?.value).toLocaleString("ar-SA")} ر.س
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                  formatter={value => (value === "grossPayroll" ? "إجمالي الرواتب (Gross)" : "الصافي المحول للبنوك (Net)")}
                />
                <Area
                  type="monotone"
                  dataKey="grossPayroll"
                  stroke={dsColors["brand-700"]}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#grossGrad)"
                  name="grossPayroll"
                />
                <Area
                  type="monotone"
                  dataKey="netTransferred"
                  stroke={dsColors.gold}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#netGrad)"
                  name="netTransferred"
                />
              </AreaChart>
            ) : (
              <ComposedChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dsColors["neutral-200"]} />
                <XAxis dataKey="month" tick={{ fill: dsColors["neutral-600"], fontSize: 12 }} axisLine={{ stroke: dsColors["neutral-200"] }} />
                <YAxis
                  domain={[80, 100]}
                  tickFormatter={val => `${val}%`}
                  tick={{ fill: dsColors["neutral-600"], fontSize: 11 }}
                  axisLine={{ stroke: dsColors["neutral-200"] }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-2xl border border-ds-neutral-200 bg-white p-3.5 shadow-lg text-right font-sans" dir="rtl">
                        <p className="font-bold text-ds-neutral-900 border-b border-ds-neutral-100 pb-1.5 text-xs">
                          شهر: {label}
                        </p>
                        <div className="mt-2 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ds-neutral-600 flex items-center gap-1">
                              <span className="size-2 rounded-full bg-ds-brand-700" />
                              نسبة الامتثال للدوام:
                            </span>
                            <span className="font-bold text-ds-brand-900 font-mono">
                              {payload[0]?.value}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ds-neutral-600 flex items-center gap-1">
                              <span className="size-2 rounded-full bg-ds-emerald-bright" />
                              نسبة الانضباط الزمني:
                            </span>
                            <span className="font-bold text-ds-neutral-950 font-mono">
                              {payload[1]?.value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                  formatter={value => (value === "complianceRate" ? "معدل الامتثال العام %" : "الانضباط الزمني %")}
                />
                <Bar
                  dataKey="complianceRate"
                  fill={dsColors["brand-700"]}
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  name="complianceRate"
                />
                <Line
                  type="monotone"
                  dataKey="punctualityRate"
                  stroke={dsColors["emerald-bright"]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: dsColors["emerald-bright"] }}
                  name="punctualityRate"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function KPIBox({
  title,
  value,
  change,
  trend,
  subtext,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50/50 p-3.5 space-y-1">
      <p className="text-[11px] font-semibold text-ds-neutral-500">{title}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-base font-black text-ds-neutral-950">{value}</span>
        <span
          className={`flex items-center text-[10px] font-black ${
            trend === "up"
              ? "text-ds-brand-700"
              : trend === "down"
              ? "text-ds-danger"
              : "text-ds-gold"
          }`}
        >
          {trend === "up" && <ArrowUpRight className="size-3 ml-0.5" />}
          {trend === "down" && <ArrowDownRight className="size-3 ml-0.5" />}
          {change}
        </span>
      </div>
      <p className="text-[10px] text-ds-neutral-600">{subtext}</p>
    </div>
  );
}
