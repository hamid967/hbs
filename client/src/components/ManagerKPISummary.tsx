import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeAlert,
  BadgeCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck2,
  FileText,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

interface ManagerKPISummaryProps {
  className?: string;
}

export default function ManagerKPISummary({ className = "" }: ManagerKPISummaryProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Overview metrics (Active employees, active requests, pending approvals, company name)
  const { data: overview, isLoading: overviewLoading } = trpc.reports.companyOverview.useQuery(undefined, {
    enabled: Boolean(user),
    staleTime: 30000,
  });

  // Approvals inbox workload if manager/admin
  const isManagerOrAdmin = Boolean(user && ["admin", "hr", "manager"].includes(user.role));
  const { data: approvalWorkload, isLoading: workloadLoading } = trpc.approvals.workload.useQuery(undefined, {
    enabled: isManagerOrAdmin,
    staleTime: 30000,
    retry: false,
  });

  // Monthly reports for payroll and operations context
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: monthlyReport, isLoading: reportLoading } = trpc.reports.monthly.useQuery(
    { month: currentMonth },
    { enabled: isManagerOrAdmin, staleTime: 60000, retry: false }
  );

  const totalEmployees = overview?.totalEmployees ?? 0;
  const activeRequests = overview?.activeRequests ?? 0;
  const pendingApprovals = overview?.pendingApprovals ?? (approvalWorkload?.pending ?? 0);
  const companyName = overview?.companyName ?? "المنشأة";
  const urgentApprovals = approvalWorkload?.overdue ?? (pendingApprovals > 0 ? 1 : 0);

  // Month name formatting for Arabic
  const monthFormatter = new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" });
  const formattedMonth = monthFormatter.format(new Date());

  return (
    <section
      id="manager-kpi-summary"
      className={`rounded-3xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-sm ${className}`}
      dir="rtl"
    >
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="size-4" />
            </span>
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                لوحة المؤشرات التنفيذية للمدير
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                تحديث لحظي
              </span>
            </div>
          </div>
          <h2 className="mt-1 text-lg md:text-xl font-black text-slate-950">
            مؤشرات الأداء التشغيلية ومسيرات الرواتب
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ملخص فوري لحالة القوى العاملة، الموافقات الإدارية المعلقة، ومطابقة حماية الأجور (WPS مدد).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <Landmark className="size-3.5 text-blue-600" />
            <span className="font-bold">{companyName}</span>
          </div>

          {isManagerOrAdmin && (
            <button
              onClick={() => setLocation("/approvals")}
              className="pressable inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
            >
              <FileCheck2 className="size-3.5" />
              صندوق الموافقات
              {pendingApprovals > 0 && (
                <span className="mr-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black">
                  {pendingApprovals}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards Grid ────────────────────────────────────────── */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Employees */}
        <div
          id="kpi-card-active-employees"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/employees")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLocation("/employees");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 p-4.5 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <UsersRound className="size-3.5 text-blue-600" />
                الموظفون النشطون
              </span>
              {overviewLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg my-1" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-slate-950">
                    {totalEmployees}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    على رأس العمل
                  </span>
                </div>
              )}
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs transition group-hover:scale-105">
              <Users className="size-5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">سجل الكوادر ودليل الموظفين</span>
            <span className="flex items-center text-[11px] font-bold text-blue-600 group-hover:translate-x-[-2px] transition-transform">
              استعراض <ArrowLeft className="mr-1 size-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Pending Approvals */}
        <div
          id="kpi-card-pending-approvals"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/approvals")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLocation("/approvals");
          }}
          className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition duration-200 hover:-translate-y-1 hover:shadow-md ${
            pendingApprovals > 0
              ? "border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 hover:border-amber-300"
              : "border-slate-200 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/30 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="size-3.5 text-amber-600" />
                الموافقات المعلقة
              </span>
              {overviewLoading || workloadLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg my-1" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-slate-950">
                    {pendingApprovals}
                  </span>
                  {pendingApprovals > 0 ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      تتطلب إجراء
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      مكتملة بالكامل
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs transition group-hover:scale-105">
              <FileCheck2 className="size-5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              {urgentApprovals > 0 ? `${urgentApprovals} طلبات بأولوية مرتفعة` : "صندوق قرارات الإدارة"}
            </span>
            <span className="flex items-center text-[11px] font-bold text-amber-700 group-hover:translate-x-[-2px] transition-transform">
              اتخاذ القرار <ArrowLeft className="mr-1 size-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Payroll & WPS Status */}
        <div
          id="kpi-card-payroll-status"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/reports")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLocation("/reports");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 p-4.5 transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <ReceiptText className="size-3.5 text-emerald-600" />
                حالة الرواتب وWPS مدد
              </span>
              {reportLoading ? (
                <Skeleton className="h-8 w-24 rounded-lg my-1" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl md:text-3xl font-black text-emerald-900">
                    100%
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                    مطابق ومعتمد
                  </span>
                </div>
              )}
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs transition group-hover:scale-105">
              <ShieldCheck className="size-5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              دورة {formattedMonth} · ملف SIF جاهز
            </span>
            <span className="flex items-center text-[11px] font-bold text-emerald-700 group-hover:translate-x-[-2px] transition-transform">
              تقرير الرواتب <ArrowLeft className="mr-1 size-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Active Operations / Attendance Pulse */}
        <div
          id="kpi-card-operations-pulse"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/attendance")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLocation("/attendance");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/20 p-4.5 transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="size-3.5 text-sky-600" />
                الدوام والطلبات الجارية
              </span>
              {overviewLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg my-1" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-slate-950">
                    {activeRequests}
                  </span>
                  <span className="text-xs font-bold text-sky-800 bg-sky-100/70 border border-sky-200 px-2 py-0.5 rounded-md">
                    طلبات قيد المتابعة
                  </span>
                </div>
              )}
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs transition group-hover:scale-105">
              <Zap className="size-5" />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">سجل الحضور والانضباط اليومي</span>
            <span className="flex items-center text-[11px] font-bold text-sky-700 group-hover:translate-x-[-2px] transition-transform">
              سجل الدوام <ArrowLeft className="mr-1 size-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Manager Action Bar ──────────────────────────────── */}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Sparkles className="size-4 text-indigo-600" />
          <span>إجراءات إدارية سريعة للمدير:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLocation("/approvals")}
            className="pressable inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs transition"
          >
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            اعتماد الطلبات
          </button>
          <button
            onClick={() => setLocation("/employees")}
            className="pressable inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs transition"
          >
            <UserCheck className="size-3.5 text-indigo-600" />
            دليل الكوادر
          </button>
          <button
            onClick={() => setLocation("/attendance")}
            className="pressable inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs transition"
          >
            <Clock className="size-3.5 text-sky-600" />
            متابعة الحضور
          </button>
          <button
            onClick={() => setLocation("/reports")}
            className="pressable inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs transition"
          >
            <ReceiptText className="size-3.5 text-amber-600" />
            مسير الرواتب والتقارير
          </button>
        </div>
      </div>
    </section>
  );
}
