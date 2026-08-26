import { Database, FileWarning, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const filters = [
  { id: "all", label: "الكل" },
  { id: "identity", label: "الهوية" },
  { id: "employment", label: "الموظف" },
  { id: "workflow", label: "سير العمل" },
  { id: "document", label: "الوثائق" },
  { id: "operational", label: "التشغيل" },
] as const;

export default function DataInventory() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const { data, isLoading, isError, error, refetch, isFetching } = trpc.system.dataInventory.useQuery();
  const domains = useMemo(() => data?.domains.filter(domain => filter === "all" || domain.category === filter) ?? [], [data, filter]);

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold text-[#5e8970]">حوكمة البيانات</p><h1 className="mt-2 text-3xl font-bold text-[#173e30]">جرد بيانات المنصة</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#748279]">كتالوج إداري لسطوح البيانات ومالكيها ونطاق الوصول. لا يعرض سجلات موظفين أو طلبات أو محتوى وثائق.</p></div>
      <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-10 rounded-xl border-[#d6e2d8] text-[#2f694e]"><RefreshCw className={`ml-2 size-4 ${isFetching ? "animate-spin" : ""}`} />تحديث</Button>
    </div>
    <section className="mt-7 rounded-3xl border border-[#f0dcb9] bg-[#fffaf1] p-5"><div className="flex gap-3"><FileWarning className="mt-0.5 size-5 shrink-0 text-[#a36a22]" /><div><h2 className="font-bold text-[#704514]">حدود الجرد</h2><p className="mt-1 text-sm leading-6 text-[#86623a]">{data?.policyNotice ?? "هذا الجرد تقني داخلي؛ لا يحل محل سياسة احتفاظ أو اعتماد قانوني."}</p></div></div></section>
    <div className="mt-7 flex flex-wrap gap-2">{filters.map(item => <Button key={item.id} variant={filter === item.id ? "default" : "outline"} size="sm" onClick={() => setFilter(item.id)} className={filter === item.id ? "rounded-xl bg-[#1f5b45] hover:bg-[#174735]" : "rounded-xl border-[#d6e2d8] text-[#426a55]"}>{item.label}</Button>)}</div>
    {isLoading ? <div className="mt-6 grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-52 rounded-3xl" />)}</div> : isError ? <section className="mt-8 rounded-3xl border border-[#f1d4d1] bg-[#fff8f7] p-7 text-center"><ShieldCheck className="mx-auto size-9 text-[#b2514d]" /><h2 className="mt-4 text-lg font-bold text-[#6f332f]">لا تتوفر صلاحية عرض الجرد</h2><p className="mt-2 text-sm text-[#855a55]">{error.message}</p></section> : <div className="mt-6 grid gap-4 md:grid-cols-2">{domains.map(domain => <article key={domain.id} className="rounded-3xl border border-[#e1e9e2] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#e7f3eb] text-[#317a53]"><Database className="size-5" /></span><Badge className="bg-[#fff0d9] text-[#9a651f] hover:bg-[#fff0d9]">سياسة الاحتفاظ: بانتظار اعتماد</Badge></div><h2 className="mt-5 text-lg font-bold text-[#274333]">{domain.title}</h2><p className="mt-2 text-sm leading-6 text-[#68776e]">{domain.scope}</p><dl className="mt-5 grid gap-3 border-t border-[#edf1ed] pt-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#829088]">المالك التشغيلي</dt><dd className="font-semibold text-[#355441]">{domain.owner}</dd></div><div><dt className="text-[#829088]">نطاق الوصول</dt><dd className="mt-1 leading-6 text-[#51655a]">{domain.accessSummary}</dd></div></dl></article>)}</div>}
    {data && <p className="mt-6 text-xs text-[#829088]">آخر توليد للكتالوج: {new Date(data.generatedAt).toLocaleString("ar-SA")}</p>}
  </div></DashboardLayout>;
}
