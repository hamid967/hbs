import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileCheck2,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";

export default function SmartNotificationsBanner() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError, refetch, isFetching } = trpc.notifications.smartUrgent.useQuery(undefined, {
    refetchInterval: 60000, // Auto refresh every 60s
  });

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-ds-neutral-200 bg-white p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-ds-neutral-200 rounded-lg" />
          <div className="h-5 w-20 bg-ds-neutral-200 rounded-lg" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-ds-neutral-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const { items, totalCount, criticalCount, warningCount } = data;

  if (totalCount === 0) {
    return (
      <div className="rounded-3xl border border-ds-success-border bg-ds-success-soft/30 p-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-xl bg-ds-success-soft text-ds-brand-800">
              <CheckCircle2 className="size-4" />
            </span>
            <div>
              <p className="font-bold text-ds-brand-950">النظام في حالة امتثال تشغيلي كامل</p>
              <p className="text-ds-neutral-600 text-[11px] mt-0.5">
                لا توجد مهام أو عقود حرجة متأخرة أو مسيرات معلقة تتطلب تدخلاً فورياً.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1 text-[11px] font-bold text-ds-brand-700 hover:text-ds-brand-900 cursor-pointer"
          >
            <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-ds-warning-border bg-gradient-to-br from-ds-ivory via-white to-ds-gold-soft/30 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-warning-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-9 items-center justify-center rounded-2xl bg-ds-warning-deep text-white shadow-xs">
            <BellRing className="size-4" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-ds-danger text-[9px] font-black text-white ring-2 ring-white">
              {totalCount}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-ds-warning-strong">
                التنبيهات الذكية والإجراءات العاجلة
              </h2>
              {criticalCount > 0 && (
                <span className="rounded-full bg-ds-danger text-white px-2 py-0.5 text-[10px] font-bold">
                  {criticalCount} حرج
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-ds-warning-soft text-ds-warning-deep border border-ds-warning-border px-2 py-0.5 text-[10px] font-bold">
                  {warningCount} تنبيه
                </span>
              )}
            </div>
            <p className="text-[11px] text-ds-neutral-600 mt-0.5">
              مهام تتطلب مراجعة أو اعتماد المسؤول لتفادي الغرامات أو تأخر الإجراءات النظامية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-ds-warning-border bg-white px-2.5 py-1.5 text-[11px] font-bold text-ds-neutral-700 hover:bg-ds-warning-soft/30 cursor-pointer transition"
          >
            <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
            تحديث التنبيهات
          </button>
        </div>
      </div>

      {/* Grid of urgent items */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const isCrit = item.severity === "critical";
          const isWarn = item.severity === "warning";

          return (
            <div
              key={item.id}
              onClick={() => setLocation(item.actionUrl)}
              className={`group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                isCrit
                  ? "bg-white border-ds-danger-border hover:border-ds-danger"
                  : isWarn
                  ? "bg-white border-ds-warning-border hover:border-ds-warning-deep"
                  : "bg-white border-ds-neutral-200 hover:border-ds-brand-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      isCrit
                        ? "bg-ds-danger-soft text-ds-danger"
                        : isWarn
                        ? "bg-ds-gold-soft text-ds-warning-deep"
                        : "bg-ds-brand-50 text-ds-brand-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                  <span
                    className={`flex size-6 items-center justify-center rounded-lg ${
                      isCrit
                        ? "bg-ds-danger-soft text-ds-danger"
                        : isWarn
                        ? "bg-ds-gold-soft text-ds-warning-deep"
                        : "bg-ds-brand-50 text-ds-brand-700"
                    }`}
                  >
                    {item.category === "contract_expiring" && <CalendarClock className="size-3.5" />}
                    {item.category === "payroll_pending" && <CreditCard className="size-3.5" />}
                    {item.category === "approval_required" && <FileCheck2 className="size-3.5" />}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-ds-neutral-950 font-mono">
                    {item.count}
                  </span>
                  <h3 className="text-xs font-bold text-ds-neutral-900">{item.title}</h3>
                </div>

                <p className="mt-1.5 text-[11px] text-ds-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-ds-neutral-100 pt-2 text-[11px] font-bold">
                <span
                  className={`group-hover:underline ${
                    isCrit
                      ? "text-ds-danger"
                      : isWarn
                      ? "text-ds-warning-deep"
                      : "text-ds-brand-800"
                  }`}
                >
                  معالجة الإجراء الآن
                </span>
                <ChevronLeft className="size-3.5 text-ds-neutral-400 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
