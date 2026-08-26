import { Activity, Database, GitCommitHorizontal, RefreshCw, ShieldAlert } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const signalIcon = { application: Activity, database: Database, build: GitCommitHorizontal };

export default function OperationalHealth() {
  const { data, isLoading, isError, error, refetch, isFetching } = trpc.system.operationalStatus.useQuery();

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#5e8970]">المراقبة التشغيلية</p>
            <h1 className="mt-2 text-3xl font-bold text-[#173e30]">صحة التطبيق</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#748279]">فحص إداري محدود لحالة التطبيق واتصال قاعدة البيانات ومصدر البناء، من دون عرض سجلات موظفين أو إرسال تنبيهات خارجية.</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-10 rounded-xl border-[#d6e2d8] text-[#2f694e]"><RefreshCw className={`ml-2 size-4 ${isFetching ? "animate-spin" : ""}`} />تحديث الفحص</Button>
        </div>

        {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-3">{[1, 2, 3].map(item => <Skeleton key={item} className="h-44 rounded-3xl" />)}</div> : isError ? (
          <section className="mt-8 rounded-3xl border border-[#f1d4d1] bg-[#fff8f7] p-7 text-center"><ShieldAlert className="mx-auto size-9 text-[#b2514d]" /><h2 className="mt-4 text-lg font-bold text-[#6f332f]">تعذر تنفيذ الفحص الإداري</h2><p className="mt-2 text-sm text-[#855a55]">{error.message}</p></section>
        ) : data ? (
          <>
            <div className="mt-8 flex items-center justify-between border-y border-[#dfe8e0] py-4"><div className="flex items-center gap-3"><span className={`size-3 rounded-full ${data.overall === "available" ? "bg-[#3c9b6a]" : "bg-[#c88d36]"}`} /><strong className="text-lg text-[#244334]">{data.overall === "available" ? "الحالة التشغيلية متاحة" : "تحتاج متابعة تشغيلية"}</strong></div><span className="text-xs text-[#78867e]">آخر فحص: {new Date(data.checkedAt).toLocaleString("ar-SA")}</span></div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">{data.signals.map(signal => { const Icon = signalIcon[signal.id]; const available = signal.state === "available"; return <article key={signal.id} className="rounded-3xl border border-[#e3e9e3] bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><span className={`flex size-10 items-center justify-center rounded-2xl ${available ? "bg-[#e7f3eb] text-[#317a53]" : "bg-[#fff0d9] text-[#a66b20]"}`}><Icon className="size-5" /></span><Badge className={available ? "bg-[#e7f3eb] text-[#317a53] hover:bg-[#e7f3eb]" : "bg-[#fff0d9] text-[#a66b20] hover:bg-[#fff0d9]"}>{available ? "متاح" : "متابعة"}</Badge></div><h2 className="mt-6 font-bold text-[#294435]">{signal.label}</h2><p className="mt-2 text-sm leading-6 text-[#6d7c73]">{signal.detail}</p></article>; })}</div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
