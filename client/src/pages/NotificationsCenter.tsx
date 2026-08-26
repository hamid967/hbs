import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BellRing, Check, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type Filter = "all" | "action" | "decision" | "unread";

const filterLabels: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "action", label: "تحتاج إجراء" },
  { value: "decision", label: "قرارات مكتملة" },
  { value: "unread", label: "غير مقروءة" },
];

export default function NotificationsCenter() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isError, error } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });
  const pending = data?.filter(item => item.type === "approval_required" && !item.readAt) ?? [];
  const decisions = data?.filter(item => item.type === "request_decision") ?? [];
  const visible = (data ?? []).filter(item => filter === "all" || (filter === "action" && item.type === "approval_required") || (filter === "decision" && item.type === "request_decision") || (filter === "unread" && !item.readAt));
  const unreadVisible = visible.filter(item => !item.readAt);
  const markVisibleRead = async () => { await Promise.all(unreadVisible.map(item => markRead.mutateAsync({ id: item.id }))); };

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-4xl"><p className="text-xs font-bold text-[#5d8d70]">التنبيهات</p><h1 className="mt-2 text-3xl font-bold text-[#1d4532]">مركز الإشعارات</h1><p className="mt-3 text-sm leading-7 text-[#748178]">صنّف الإشعارات حسب أهميتها، وافتح ما يتطلب إجراءً ضمن نطاقك المخول.</p>{!isLoading && !isError ? <section aria-label="ملخص الموافقات" className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rounded-3xl border border-[#f0dfbd] bg-[#fffaf0] p-5"><div className="flex items-center gap-3"><span className="rounded-2xl bg-white p-2 text-[#a66d24]"><Clock3 className="size-5" /></span><div><p className="text-xs font-bold text-[#856943]">أولوية عالية · موافقات بانتظارك</p><p className="mt-1 text-3xl font-bold text-[#754d18]">{pending.length}</p></div></div><p className="mt-3 text-xs leading-5 text-[#8a7048]">إشعارات غير مقروءة تحتاج فتح الطلب ضمن دورك المخول.</p></article><article className="rounded-3xl border border-[#cfe5d4] bg-[#f3faf4] p-5"><div className="flex items-center gap-3"><span className="rounded-2xl bg-white p-2 text-[#397657]"><CheckCircle2 className="size-5" /></span><div><p className="text-xs font-bold text-[#5b8168]">معلومات · قرارات مكتملة</p><p className="mt-1 text-3xl font-bold text-[#2d7148]">{decisions.length}</p></div></div><p className="mt-3 text-xs leading-5 text-[#66826d]">آخر تحديثات قرار الطلبات التي تخص حسابك فقط.</p></article></section> : null}{isLoading ? <p className="mt-10 text-sm text-[#728077]">جارٍ تحميل الإشعارات…</p> : isError ? <div className="mt-8 rounded-3xl border border-[#f1d5d2] bg-white p-8 text-center text-[#9a4e49]"><ShieldAlert className="mx-auto size-6" /><p className="mt-3">{error.message}</p></div> : <><section className="mt-7 flex flex-wrap items-center gap-2" aria-label="تصفية الإشعارات">{filterLabels.map(option => <Button key={option.value} variant={filter === option.value ? "default" : "outline"} onClick={() => setFilter(option.value)} className={filter === option.value ? "rounded-xl bg-[#1f5b45]" : "rounded-xl text-[#386f50]"}>{option.label}</Button>)}{unreadVisible.length ? <Button variant="ghost" disabled={markRead.isPending} onClick={markVisibleRead} className="mr-auto rounded-xl text-[#386f50]"><Check className="ml-1 size-4" />تعليم الظاهر كمقروء</Button> : null}</section>{visible.length ? <div className="mt-5 space-y-3">{visible.map(item => <article key={item.id} className={`rounded-2xl border p-5 ${item.readAt ? "border-[#e3ebe4] bg-white" : "border-[#cfe4d4] bg-[#f7fcf8]"}`}><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2">{item.type === "approval_required" ? <Clock3 className="size-4 text-[#a66d24]" /> : <CheckCircle2 className="size-4 text-[#397657]" />}<h2 className="font-bold text-[#294535]">{item.title}</h2></div><p className="mt-2 text-sm leading-6 text-[#66776d]">{item.body}</p><p className="mt-3 text-xs text-[#87938b]">{new Date(item.createdAt).toLocaleString("ar-SA")}</p></div><div className="flex gap-2">{item.href && <Button variant="outline" onClick={() => { if (!item.readAt) markRead.mutate({ id: item.id }); setLocation(item.href!); }} className="rounded-xl text-[#386f50]">عرض</Button>}{!item.readAt && <Button variant="ghost" onClick={() => markRead.mutate({ id: item.id })} className="rounded-xl text-[#386f50]"><Check className="ml-1 size-4" />قرأت</Button>}</div></div></article>)}</div> : <div className="mt-8 rounded-3xl border border-[#dfe9e1] bg-white p-12 text-center"><BellRing className="mx-auto size-7 text-[#387856]" /><h2 className="mt-4 font-bold text-[#294535]">لا توجد إشعارات ضمن هذا التصنيف</h2><p className="mt-2 text-sm text-[#748178]">غيّر التصنيف لعرض تحديثات حسابك الأخرى.</p></div>}</>}</div></DashboardLayout>;
}
