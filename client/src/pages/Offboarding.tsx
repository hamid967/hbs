import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CalendarDays, CheckCircle2, ClipboardList, FileText, Landmark, MessageSquareText, Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const taskIcons = { contracts_review: Landmark, documents_review: FileText, access_review: ShieldAlert, handover_review: ClipboardList } as const;
const statusLabels = { in_progress: "قيد التنفيذ", completed: "مكتملة", cancelled: "ملغاة" } as const;
const interviewStatusLabels = { scheduled: "مجدولة", completed: "مكتملة", declined: "اعتذر الموظف" } as const;
type InterviewStatus = keyof typeof interviewStatusLabels;

export default function Offboarding() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError, error } = trpc.offboarding.overview.useQuery();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("none");
  const [lastWorkingAt, setLastWorkingAt] = useState("");
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewOffboardingId, setInterviewOffboardingId] = useState("");
  const [interviewEmployeeId, setInterviewEmployeeId] = useState("");
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("scheduled");
  const [scheduledAt, setScheduledAt] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);

  const start = trpc.offboarding.start.useMutation({
    onSuccess: () => { toast.success("تم بدء قائمة إنهاء الخدمة"); setOpen(false); setEmployeeId("none"); setLastWorkingAt(""); utils.offboarding.overview.invalidate(); },
    onError: issue => toast.error("تعذر بدء القائمة", { description: issue.message }),
  });
  const setTask = trpc.offboarding.setTask.useMutation({ onSuccess: () => utils.offboarding.overview.invalidate(), onError: issue => toast.error("تعذر تحديث المهمة", { description: issue.message }) });
  const saveExitInterview = trpc.offboarding.saveExitInterview.useMutation({
    onSuccess: () => { toast.success("تم حفظ سجل مقابلة الخروج"); setInterviewOpen(false); utils.offboarding.overview.invalidate(); },
    onError: issue => toast.error("تعذر حفظ مقابلة الخروج", { description: issue.message }),
  });

  const begin = () => start.mutate({ employeeUserId: Number(employeeId), ...(lastWorkingAt ? { lastWorkingAt: new Date(`${lastWorkingAt}T00:00:00`) } : {}) });
  const saveInterview = () => saveExitInterview.mutate({
    offboardingId: Number(interviewOffboardingId), employeeUserId: Number(interviewEmployeeId), status: interviewStatus,
    ...(scheduledAt ? { scheduledAt: new Date(`${scheduledAt}T00:00:00`) } : {}), ...(feedbackCategory.trim() ? { feedbackCategory: feedbackCategory.trim() } : {}), ...(summary.trim() ? { summary: summary.trim() } : {}), followUpRequired,
  });
  const openInterview = (offboarding: { id: number; employeeUserId: number }, interview?: { status: InterviewStatus; scheduledAt: Date | null; feedbackCategory: string | null; summary: string | null; followUpRequired: boolean }) => {
    setInterviewOffboardingId(String(offboarding.id)); setInterviewEmployeeId(String(offboarding.employeeUserId)); setInterviewStatus(interview?.status ?? "scheduled");
    setScheduledAt(interview?.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 10) : ""); setFeedbackCategory(interview?.feedbackCategory ?? ""); setSummary(interview?.summary ?? ""); setFollowUpRequired(interview?.followUpRequired ?? false); setInterviewOpen(true);
  };

  return <DashboardLayout><main dir="rtl" className="mx-auto max-w-6xl"><section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-[#5d8d70]">HR Core · إكمال تشغيلي</p><h1 className="mt-2 text-3xl font-bold text-[#1d4532]">إنهاء الخدمة</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#748178]">قائمة تحقق داخلية تربط مراجعة العقود والوثائق والتسليم. لا تحسب تسويات أو رواتب، ولا تنشئ مستندات قانونية.</p></div><Button onClick={() => setOpen(true)} className="rounded-xl bg-[#1f5b45]"><Plus className="ml-2 size-4" />بدء قائمة</Button></section>
    {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2">{[1, 2].map(item => <Skeleton key={item} className="h-72 rounded-3xl" />)}</div> : isError ? <State title="تعذر تحميل قوائم إنهاء الخدمة" text={error.message} /> : <section className="mt-8 grid gap-5 lg:grid-cols-2">{data?.offboardings.length ? data.offboardings.map(item => {
      const employee = data.employees.find(person => person.id === item.employeeUserId); const tasks = data.tasks.filter(task => task.offboardingId === item.id); const completed = tasks.filter(task => task.status === "completed").length; const contracts = data.contracts.filter(contract => contract.employeeUserId === item.employeeUserId).length; const documents = data.documents.filter(documentItem => documentItem.employeeUserId === item.employeeUserId).length; const interview = data.exitInterviews.find(exitInterview => exitInterview.offboardingId === item.id);
      return <article key={item.id} className="rounded-3xl border border-[#dfe9e1] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#294535]">{employee?.name || "موظف"}</p><p className="mt-1 text-xs text-[#718075]">آخر يوم عمل: {item.lastWorkingAt ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(item.lastWorkingAt)) : "غير محدد"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "completed" ? "bg-[#e5f4e8] text-[#367850]" : "bg-[#fff5df] text-[#946a1a]"}`}>{statusLabels[item.status]}</span></div><div className="mt-4 grid grid-cols-3 gap-2"><Metric label="المهام" value={`${completed}/${tasks.length}`} /><Metric label="العقود" value={String(contracts)} /><Metric label="الوثائق" value={String(documents)} /></div><div className="mt-5 space-y-2">{tasks.map(task => { const Icon = taskIcons[task.taskKey as keyof typeof taskIcons] || ClipboardList; const done = task.status === "completed"; return <button key={task.id} type="button" onClick={() => setTask.mutate({ taskId: task.id, completed: !done })} disabled={setTask.isPending} className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-right transition ${done ? "border-[#cfe5d2] bg-[#f0f8f1]" : "border-[#edf1ed] bg-white hover:bg-[#f8fbf8]"}`}><span className="flex items-center gap-2 text-sm font-medium text-[#3b5545]"><Icon className={`size-4 ${done ? "text-[#3c8a58]" : "text-[#8a9b90]"}`} />{task.label}</span>{done ? <CheckCircle2 className="size-5 text-[#3c8a58]" /> : <span className="size-5 rounded-full border border-[#cddbd0]" />}</button>; })}</div><section className="mt-5 rounded-2xl border border-[#e1ebe2] bg-[#f7faf7] p-4"><div className="flex items-start justify-between gap-3"><div className="flex gap-2"><MessageSquareText className="mt-0.5 size-4 text-[#4d8261]" /><div><p className="text-sm font-bold text-[#385541]">مقابلة الخروج</p><p className="mt-1 text-xs leading-5 text-[#708076]">{interview ? interviewStatusLabels[interview.status] : "لم تُسجل بعد"}{interview?.followUpRequired ? " · تحتاج متابعة داخلية" : ""}</p></div></div><Button size="sm" variant="outline" onClick={() => openInterview(item, interview)} className="border-[#bcd5c1] text-[#27623e]">{interview ? "تحديث" : "إعداد"}</Button></div>{interview?.summary ? <p className="mt-3 line-clamp-3 text-xs leading-6 text-[#607368]">{interview.summary}</p> : <p className="mt-3 text-xs leading-6 text-[#87948b]">سجل اختياري داخلي؛ لا ينشئ قراراً قانونياً أو إجراءً تلقائياً.</p>}</section></article>;
    }) : <State title="لا توجد قوائم إنهاء خدمة" text="ابدأ قائمة داخلية عند الحاجة، ثم راجع العقود والوثائق والتسليم دون احتساب تسويات." />}</section>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl" className="sm:max-w-md"><DialogHeader><DialogTitle>بدء قائمة إنهاء الخدمة</DialogTitle><DialogDescription>تنشئ قائمة مراجعة داخلية فقط، ولا تغيّر حالة الموظف أو تعطل الوصول تلقائياً.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="الموظف"><Select value={employeeId} onValueChange={setEmployeeId}><SelectTrigger><SelectValue placeholder="اختر موظفاً" /></SelectTrigger><SelectContent>{data?.employees.map(employee => <SelectItem key={employee.id} value={String(employee.id)}>{employee.name || "موظف"}</SelectItem>)}</SelectContent></Select></Field><Field label="آخر يوم عمل (اختياري)"><Input type="date" value={lastWorkingAt} onChange={event => setLastWorkingAt(event.target.value)} /></Field></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button><Button onClick={begin} disabled={start.isPending || employeeId === "none"} className="bg-[#1f5b45]">إنشاء القائمة</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}><DialogContent dir="rtl" className="sm:max-w-lg"><DialogHeader><DialogTitle>سجل مقابلة خروج داخلية</DialogTitle><DialogDescription>يوثق ملاحظات تشغيلية داخل الشركة فقط. لا يمثل قراراً قانونياً أو تقييماً أو تسوية مالية.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><Field label="الحالة"><Select value={interviewStatus} onValueChange={value => setInterviewStatus(value as InterviewStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(interviewStatusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="موعد المقابلة (اختياري)"><Input type="date" value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} /></Field></div><Field label="فئة الملاحظة (اختيارية)"><Input value={feedbackCategory} onChange={event => setFeedbackCategory(event.target.value)} maxLength={80} placeholder="مثل: بيئة العمل أو المسار المهني" /></Field><Field label="ملخص داخلي"><Textarea value={summary} onChange={event => setSummary(event.target.value)} maxLength={1200} placeholder="ملخص موجز غير قانوني ولا يتضمن قراراً تلقائياً" /></Field><label className="flex items-center gap-2 text-sm text-[#45604d]"><input type="checkbox" checked={followUpRequired} onChange={event => setFollowUpRequired(event.target.checked)} className="size-4 accent-[#1f5b45]" />تحتاج متابعة داخلية</label></div><DialogFooter><Button variant="outline" onClick={() => setInterviewOpen(false)}>إلغاء</Button><Button onClick={saveInterview} disabled={saveExitInterview.isPending || !interviewOffboardingId} className="bg-[#1f5b45]"><CalendarDays className="ml-2 size-4" />حفظ السجل</Button></DialogFooter></DialogContent></Dialog>
  </main></DashboardLayout>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="mb-2 block text-xs font-bold text-[#61756a]">{label}</label>{children}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f7faf7] p-3 text-center"><p className="text-[11px] text-[#7a897f]">{label}</p><p className="mt-1 font-bold text-[#2e543d]">{value}</p></div>; }
function State({ title, text }: { title: string; text: string }) { return <div className="col-span-full flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[#dfe9e1] bg-white px-6 text-center"><ClipboardList className="size-8 text-[#5b8a6c]" /><h2 className="mt-4 font-bold text-[#294535]">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#748178]">{text}</p></div>; }
