import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CalendarClock, Plus, ShieldAlert, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/design-system";

const eventLabels = { joined: "الانضمام", profile_updated: "تحديث الملف", status_changed: "تغيير الحالة", role_changed: "تغيير الدور", department_changed: "تغيير القسم", designation_changed: "تغيير المسمى المنظم", manager_changed: "تغيير المدير", offboarding_started: "بدء إنهاء الخدمة", offboarding_completed: "إكمال إنهاء الخدمة", exit_interview_recorded: "تسجيل مقابلة خروج" } as const;
type LifecycleEventType = keyof typeof eventLabels;
type ManualLifecycleEventType = Exclude<LifecycleEventType, "exit_interview_recorded">;

export default function EmployeeLifecycle() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError, error } = trpc.employees.lifecycle.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("none");
  const [eventType, setEventType] = useState<ManualLifecycleEventType>("joined");
  const [effectiveAt, setEffectiveAt] = useState("");
  const [note, setNote] = useState("");
  const employeeNames = useMemo(() => new Map(data?.employees.map(employee => [employee.id, employee.name || "موظف"]) ?? []), [data?.employees]);
  const createEvent = trpc.employees.createLifecycleEvent.useMutation({ onSuccess: () => { toast.success("تم حفظ حدث دورة الحياة"); setDialogOpen(false); setNote(""); setEffectiveAt(""); utils.employees.lifecycle.invalidate(); }, onError: issue => toast.error("تعذر حفظ الحدث", { description: issue.message }) });
  const submit = () => createEvent.mutate({ employeeUserId: Number(employeeId), eventType, effectiveAt: new Date(`${effectiveAt}T00:00:00`), ...(note.trim() ? { note: note.trim() } : {}) });
  const formatDate = (value: Date) => new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(value));

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-ds-brand-400">HR Core · إدارة الموظفين</p><h1 className="mt-2 text-3xl font-bold text-ds-brand-950">دورة حياة الموظف</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-ds-neutral-600">سجل تشغيلي داخلي لتوثيق محطات العمل المصرح بها. لا يمثل عقداً أو مستنداً قانونياً ولا يحفظ ملفات أو بيانات هوية إضافية.</p></div><Button onClick={() => setDialogOpen(true)} className="rounded-xl bg-ds-brand-800"><Plus className="ml-2 size-4" />حدث جديد</Button></div>
    {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-32 rounded-3xl" />)}</div> : isError ? <StateCard title="تعذر تحميل دورة حياة الموظفين" text={error.message} error /> : data?.events.length ? <section className="mt-8 grid gap-4 md:grid-cols-2">{data.events.map(event => <article key={event.id} className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-ds-brand-100 text-ds-brand-600"><CalendarClock className="size-5" /></span><span className="rounded-full bg-ds-brand-50 px-3 py-1 text-xs font-bold text-ds-brand-600">{eventLabels[event.eventType]}</span></div><h2 className="mt-4 font-bold text-ds-neutral-950">{employeeNames.get(event.employeeUserId) || "موظف ضمن الشركة"}</h2><p className="mt-1 text-xs text-ds-neutral-600">تاريخ الأثر: {formatDate(event.effectiveAt)}</p>{event.note && <p className="mt-4 text-sm leading-7 text-ds-neutral-700">{event.note}</p>}</article>)}</section> : <StateCard title="لا توجد أحداث مسجلة بعد" text="يمكن لفريق الموارد البشرية توثيق الانضمام أو التغييرات الداخلية أو مراحل إنهاء الخدمة دون مرفقات أو عقود." />}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>حدث دورة حياة جديد</DialogTitle><DialogDescription>يُحفظ الحدث داخل الشركة الحالية ويظهر لفريق HR والمسؤول فقط.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormField label="الموظف"><Select value={employeeId} onValueChange={setEmployeeId}><SelectTrigger><SelectValue placeholder="اختر موظفاً" /></SelectTrigger><SelectContent>{data?.employees.map(employee => <SelectItem key={employee.id} value={String(employee.id)}>{employee.name || "موظف"}</SelectItem>)}</SelectContent></Select></FormField><FormField label="نوع الحدث"><Select value={eventType} onValueChange={value => setEventType(value as ManualLifecycleEventType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(eventLabels).filter(([value]) => value !== "exit_interview_recorded").map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></FormField><FormField label="التاريخ الفعلي"><Input type="date" value={effectiveAt} onChange={event => setEffectiveAt(event.target.value)} /></FormField><FormField label="ملاحظة داخلية مختصرة"><Textarea value={note} onChange={event => setNote(event.target.value)} maxLength={500} /></FormField></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button><Button onClick={submit} disabled={createEvent.isPending || employeeId === "none" || !effectiveAt} className="bg-ds-brand-800">حفظ الحدث</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}

function StateCard({ title, text, error = false }: { title: string; text: string; error?: boolean }) { return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-ds-neutral-200 bg-white px-6 text-center"><span className={`flex size-14 items-center justify-center rounded-3xl ${error ? "bg-ds-danger-soft text-ds-danger" : "bg-ds-success-soft text-ds-brand-600"}`}>{error ? <ShieldAlert className="size-6" /> : <UsersRound className="size-6" />}</span><h2 className="mt-5 font-bold text-ds-neutral-950">{title}</h2><p className="mt-2 max-w-md text-sm leading-7 text-ds-neutral-600">{text}</p></div>; }
