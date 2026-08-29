import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, FileText, TrendingUp, Users } from "lucide-react";
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
          <h2 className="mt-1 text-xl font-bold text-ds-brand-1000">مؤشرات الشركة الحالية</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-ds-neutral-200 bg-ds-neutral-50 px-3.5 py-1 text-xs font-semibold text-ds-neutral-700">
          <span className="size-2 rounded-full bg-ds-emerald" />
          <span>{companyName}</span>
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
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600">
                إجمالي الموظفين
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold">{totalEmployees}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-ds-neutral-500">
              حسابات مفعلة ضمن المنشأة
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-brand-100 text-ds-brand-800 transition group-hover:scale-110">
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
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600">
                الطلبات النشطة
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold">{activeRequests}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-ds-neutral-500">
              قيد الاستلام أو المراجعة
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-warning-soft text-ds-warning transition group-hover:scale-110">
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
              <p className="ds-kpi-label flex items-center gap-1.5 text-ds-neutral-600">
                الموافقات المعلقة
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20 rounded-lg" />
              ) : (
                <p className="ds-kpi-value text-ds-neutral-950 font-bold">{pendingApprovals}</p>
              )}
            </div>
            <p className="ds-kpi-detail text-ds-neutral-500">
              بانتظار اتخاذ القرار الإداري
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ds-success-soft text-ds-brand-600 transition group-hover:scale-110">
            <Clock className="size-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
