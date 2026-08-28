import { ArchiveRestore, FileWarning, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dataRetentionDomainLabels, dataRetentionDomains, type DataRetentionDomain } from "@shared/dataGovernance";
import { trpc } from "@/lib/trpc";

export default function DataRetentionPolicies() {
  const [domain, setDomain] = useState<DataRetentionDomain>("employees");
  const [ownerLabel, setOwnerLabel] = useState("الموارد البشرية");
  const [retentionDays, setRetentionDays] = useState("");
  const [reviewState, setReviewState] = useState<"draft" | "reviewed">("draft");
  const [policyNote, setPolicyNote] = useState("مسودة داخلية بانتظار مراجعة مالك البيانات.");
  const { data, isLoading, isError, error } = trpc.dataGovernance.listRetentionPolicies.useQuery();
  const utils = trpc.useUtils();
  const save = trpc.dataGovernance.saveRetentionPolicy.useMutation({ onSuccess: () => utils.dataGovernance.listRetentionPolicies.invalidate() });
  const numericDays = retentionDays.trim() ? Number(retentionDays) : undefined;
  const readyToSave = ownerLabel.trim().length >= 2 && policyNote.trim().length >= 4 && (reviewState === "draft" || (numericDays && numericDays > 0));

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl">
    <div><p className="text-xs font-bold text-ds-brand-400">حوكمة البيانات</p><h1 className="mt-2 text-3xl font-bold text-ds-brand-1000">مسودة سياسات الاحتفاظ</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-ds-neutral-600">سجل تشغيلي داخلي لمقترحات ملكية البيانات والاحتفاظ بها. لا ينفذ حذفاً تلقائياً ولا يمثل اعتماداً قانونياً أو سياسة امتثال نهائية.</p></div>
    <section className="mt-7 rounded-3xl border border-ds-warning-border bg-ds-ivory p-5"><div className="flex gap-3"><FileWarning className="mt-0.5 size-5 shrink-0 text-ds-warning" /><div><h2 className="font-bold text-ds-warning-strong">مراجعة مطلوبة</h2><p className="mt-1 text-sm leading-6 text-ds-warning-strong">الحالة «مراجع داخلياً» تعني أن المسؤول راجع المسودة التشغيلية فقط، ولا تُشغّل أي مهمة حذف أو تغيير تلقائي للبيانات.</p></div></div></section>
    {isError ? <section className="mt-7 rounded-3xl border border-ds-danger-border bg-ds-white p-7 text-center"><ShieldCheck className="mx-auto size-9 text-ds-danger" /><h2 className="mt-4 text-lg font-bold text-ds-danger-strong">لا تتوفر صلاحية إدارة السياسات</h2><p className="mt-2 text-sm text-ds-danger-muted">{error.message}</p></section> : <div className="mt-7 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <form onSubmit={event => { event.preventDefault(); if (!readyToSave) return; save.mutate({ dataDomain: domain, ownerLabel: ownerLabel.trim(), retentionDays: numericDays, reviewState, policyNote: policyNote.trim() }); }} className="rounded-3xl border border-ds-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ds-neutral-950">حفظ مسودة نطاق بيانات</h2><div className="mt-5 space-y-4">
          <div><Label>نطاق البيانات</Label><Select value={domain} onValueChange={value => setDomain(value as DataRetentionDomain)}><SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{dataRetentionDomains.map(item => <SelectItem key={item} value={item}>{dataRetentionDomainLabels[item]}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>المالك التشغيلي</Label><Input value={ownerLabel} onChange={event => setOwnerLabel(event.target.value)} className="mt-2 h-11 rounded-xl" maxLength={120} /></div>
          <div><Label>مدة الاحتفاظ المقترحة بالأيام</Label><Input type="number" min="1" max="36500" value={retentionDays} onChange={event => setRetentionDays(event.target.value)} placeholder="اختياري لمسودة غير مراجعة" className="mt-2 h-11 rounded-xl" /></div>
          <div><Label>حالة المراجعة الداخلية</Label><Select value={reviewState} onValueChange={value => setReviewState(value as "draft" | "reviewed")}><SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">مسودة</SelectItem><SelectItem value="reviewed">مراجع داخلياً</SelectItem></SelectContent></Select></div>
          <div><Label>ملاحظة التشغيل</Label><Textarea value={policyNote} onChange={event => setPolicyNote(event.target.value)} className="mt-2 min-h-24 rounded-xl" maxLength={720} /></div>
          <Button type="submit" disabled={!readyToSave || save.isPending} className="h-11 w-full rounded-xl bg-ds-brand-800 hover:bg-ds-brand-950"><Save className="ml-2 size-4" />{save.isPending ? "جارٍ الحفظ…" : "حفظ المسودة"}</Button>
        </div>
      </form>
      <section><h2 className="text-lg font-bold text-ds-neutral-950">السياسات المسجلة</h2>{isLoading ? <p className="mt-5 text-sm text-ds-neutral-600">جارٍ تحميل السجل…</p> : data?.length ? <div className="mt-4 space-y-3">{data.map(policy => <article key={policy.id} className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-ds-neutral-950">{dataRetentionDomainLabels[policy.dataDomain]}</h3><p className="mt-1 text-sm text-ds-neutral-700">المالك: {policy.ownerLabel}</p></div><Badge className={policy.reviewState === "reviewed" ? "bg-ds-success-soft text-ds-brand-600 hover:bg-ds-success-soft" : "bg-ds-warning-soft text-ds-warning hover:bg-ds-warning-soft"}>{policy.reviewState === "reviewed" ? "مراجع داخلياً" : "مسودة"}</Badge></div><p className="mt-4 text-sm leading-6 text-ds-neutral-700">{policy.policyNote}</p><div className="mt-4 flex items-center gap-2 text-xs text-ds-neutral-500"><ArchiveRestore className="size-4" />مدة مقترحة: {policy.retentionDays ? `${policy.retentionDays} يوم` : "لم تحدد بعد"}</div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-ds-brand-200 bg-white p-6 text-sm text-ds-neutral-600">لا توجد سياسات مسجلة بعد. ابدأ بمسودة نطاق واحد.</p>}</section>
    </div>}
  </div></DashboardLayout>;
}
