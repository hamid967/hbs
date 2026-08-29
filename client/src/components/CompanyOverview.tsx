import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, Clock, FilePlus2, FileText, Sparkles, TrendingUp, Users, ShieldCheck, UserPlus, CalendarClock, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

interface CompanyOverviewProps {
  className?: string;
}

export default function CompanyOverview({ className = "" }: CompanyOverviewProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: overview, isLoading } = trpc.reports.companyOverview.useQuery(undefined, {
    enabled: Boolean(user),
    staleTime: 30000,
  });

  const totalEmployees = overview?.totalEmployees ?? 0;
  const activeRequests = overview?.activeRequests ?? 0;
  const pendingApprovals = overview?.pendingApprovals ?? 0;
  const companyName = overview?.companyName ?? "المنشأة";
  const isAdminOrHr = Boolean(user && ["admin", "hr"].includes(user.role));

  return (
    <section className={`rounded-[1.75rem] border border-ds-neutral-200 bg-white p-6 shadow-[0_10px_28px_rgba(21,50,35,0.04)] ${className}`} dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ds-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-ds-brand-100 text-ds-brand-700">
              <TrendingUp className="size-4" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-ds-brand-600">نظرة عامة على المنشأة</p>
          </div>
          <h2 className="mt-1 text-xl font-bold text-ds-brand-1000">مؤشرات الشركة والعمليات اليومية</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-ds-neutral-200 bg-ds-neutral-50 px-3.5 py-1 text-xs font-semibold text-ds-neutral-700">
            <span className="size-2 rounded-full bg-ds-emerald" />
            <span>{companyName}</span>
          </div>
          {isAdminOrHr && (
            <button
              onClick={() => setLocation("/employees")}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-ds-emerald/15 px-3.5 py-1 text-xs font-bold text-ds-brand-800 hover:bg-ds-emerald/25"
            >
              <UserPlus className="size-3.5" />
              إضافة موظف
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI 1: Total Employees */}
        <div
          id="kpi-total-employees"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/employees")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLocation("/employees"); }}
          className="ds-kpi-card group relative cursor-pointer overflow-hidden rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ds-brand-300 hover:bg-white hover:shadow-md"
        >
          <div className="flex flex-col justify-between">
            <div>
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600 font-semibold">
                إجمالي الموظفين
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold text-2xl mt-1">{totalEmployees}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-xs text-ds-neutral-500 mt-2">
              حسابات مفعلة ضمن المنشأة · استعراض الدليل
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-brand-100 text-ds-brand-800 transition group-hover:scale-110 shadow-sm">
            <Users className="size-6" />
          </div>
        </div>

        {/* KPI 2: Active Requests */}
        <div
          id="kpi-active-requests"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/operations")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLocation("/operations"); }}
          className="ds-kpi-card group relative cursor-pointer overflow-hidden rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ds-warning hover:bg-white hover:shadow-md"
        >
          <div className="flex flex-col justify-between">
            <div>
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600 font-semibold">
                الطلبات النشطة
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold text-2xl mt-1">{activeRequests}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-xs text-ds-neutral-500 mt-2">
              قيد الاستلام أو المراجعة · مركز العمليات
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-warning-soft text-ds-warning transition group-hover:scale-110 shadow-sm">
            <FileText className="size-6" />
          </div>
        </div>

        {/* KPI 3: Pending Approvals */}
        <div
          id="kpi-pending-approvals"
          role="button"
          tabIndex={0}
          onClick={() => setLocation("/approvals")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLocation("/approvals"); }}
          className="ds-kpi-card group relative cursor-pointer overflow-hidden rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ds-emerald hover:bg-white hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex flex-col justify-between">
            <div>
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600 font-semibold">
                الموافقات المعلقة
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold text-2xl mt-1">{pendingApprovals}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-xs text-ds-neutral-500 mt-2">
              بانتظار اتخاذ القرار الإداري · صندوق الموافقات
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-success-soft text-ds-brand-600 transition group-hover:scale-110 shadow-sm">
            <Clock className="size-6" />
          </div>
        </div>
      </div>

      {/* Jisr-style Quick Action Hub */}
      <div className="mt-6 rounded-2xl border border-ds-neutral-100 bg-ds-neutral-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-ds-brand-900">
            <Sparkles className="size-3.5 text-ds-emerald" />
            <span>إجراءات وخدمات سريعة:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLocation("/requests/new?type=leave")}
              className="pressable inline-flex items-center gap-1 rounded-xl border border-ds-neutral-200 bg-white px-3 py-1.5 font-medium text-ds-neutral-800 hover:border-ds-brand-300 hover:text-ds-brand-700"
            >
              <CalendarClock className="size-3.5 text-ds-brand-600" />
              طلب إجازة
            </button>
            <button
              onClick={() => setLocation("/requests/new?type=expense")}
              className="pressable inline-flex items-center gap-1 rounded-xl border border-ds-neutral-200 bg-white px-3 py-1.5 font-medium text-ds-neutral-800 hover:border-ds-brand-300 hover:text-ds-brand-700"
            >
              <DollarSign className="size-3.5 text-ds-warning" />
              طلب مصروفات
            </button>
            <button
              onClick={() => setLocation("/attendance")}
              className="pressable inline-flex items-center gap-1 rounded-xl border border-ds-neutral-200 bg-white px-3 py-1.5 font-medium text-ds-neutral-800 hover:border-ds-brand-300 hover:text-ds-brand-700"
            >
              <Clock className="size-3.5 text-ds-brand-500" />
              سجل الدوام
            </button>
            <button
              onClick={() => setLocation("/reports")}
              className="pressable inline-flex items-center gap-1 rounded-xl border border-ds-neutral-200 bg-white px-3 py-1.5 font-medium text-ds-neutral-800 hover:border-ds-brand-300 hover:text-ds-brand-700"
            >
              <TrendingUp className="size-3.5 text-ds-info" />
              التقارير الشهرية
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
