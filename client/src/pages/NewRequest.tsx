import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Building2, Landmark, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const categories = {
  hr: ["إجازة سنوية", "إجازة مرضية", "إجازة طارئة", "مصروف سفر", "مصروف تشغيل", "تعريف بالراتب", "تحديث بيانات الموظف", "وثيقة أو خطاب", "استفسار إداري", "خدمة أخرى"],
  government: ["تأشيرة أو إقامة", "تصديق مستند", "تجديد ترخيص", "معاملة جهة رسمية", "طلب مفوضية", "خدمة أخرى"],
};

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const [type, setType] = useState<"hr" | "government">("hr");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const createRequest = trpc.requests.create.useMutation({
    onSuccess: request => {
      toast.success("تم إرسال الطلب بنجاح", { description: `رقم المرجع: ${request.reference}` });
      setLocation("/my-requests");
    },
    onError: error => toast.error("تعذر إرسال الطلب", { description: error.message }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createRequest.mutate({ type, category, subject, details, priority });
  };

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-4xl"><button onClick={() => setLocation("/")} className="flex items-center gap-1 text-xs font-bold text-ds-brand-400"><ArrowRight className="size-4" /> لوحة التحكم</button><div className="mt-5"><p className="text-xs font-bold text-ds-brand-400">الخدمات الداخلية</p><h1 className="mt-2 text-3xl font-bold text-ds-brand-1000">طلب جديد</h1><p className="mt-3 text-sm leading-7 text-ds-neutral-600">أدخل بيانات الطلب بعناية ليتم توجيهه إلى الفريق المختص ومتابعته بوضوح.</p></div><form onSubmit={handleSubmit} className="mt-8 overflow-hidden rounded-[1.75rem] border border-ds-neutral-200 bg-white shadow-[0_12px_30px_rgba(21,50,35,0.05)]"><div className="border-b border-ds-neutral-100 p-6 md:p-8"><FieldLabel title="القسم المختص" description="حدّد المجال الذي يتبع له طلبك." /><RadioGroup value={type} onValueChange={value => { setType(value as "hr" | "government"); setCategory(""); }} className="mt-4 grid gap-3 md:grid-cols-2"><ServiceOption value="hr" selected={type === "hr"} icon={Building2} title="الموارد البشرية" detail="الخدمات والوثائق المتعلقة بالموظفين." /><ServiceOption value="government" selected={type === "government"} icon={Landmark} title="العلاقات الحكومية" detail="المعاملات والإجراءات لدى الجهات الرسمية." /></RadioGroup></div><div className="grid gap-6 p-6 md:grid-cols-2 md:p-8"><div className="space-y-2"><Label htmlFor="category" className="font-bold text-ds-neutral-950">نوع الخدمة <span className="text-destructive">*</span></Label><Select value={category} onValueChange={setCategory}><SelectTrigger id="category" className="h-11 rounded-xl border-ds-neutral-200"><SelectValue placeholder="اختر نوع الخدمة" /></SelectTrigger><SelectContent>{categories[type].map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="priority" className="font-bold text-ds-neutral-950">الأولوية</Label><Select value={priority} onValueChange={value => setPriority(value as "normal" | "urgent")}><SelectTrigger id="priority" className="h-11 rounded-xl border-ds-neutral-200"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">عادية</SelectItem><SelectItem value="urgent">عاجلة</SelectItem></SelectContent></Select></div><div className="space-y-2 md:col-span-2"><Label htmlFor="subject" className="font-bold text-ds-neutral-950">عنوان الطلب <span className="text-destructive">*</span></Label><Input id="subject" value={subject} onChange={event => setSubject(event.target.value)} placeholder="مثال: طلب إجازة سنوية" className="h-11 rounded-xl border-ds-neutral-200 text-right placeholder:text-ds-neutral-400" maxLength={240} required /></div><div className="space-y-2 md:col-span-2"><Label htmlFor="details" className="font-bold text-ds-neutral-950">تفاصيل الطلب <span className="text-destructive">*</span></Label><Textarea id="details" value={details} onChange={event => setDetails(event.target.value)} placeholder="اكتب التفاصيل التي تساعد الفريق المختص على معالجة طلبك، مثل التاريخ أو الجهة أو المستند المطلوب." className="min-h-36 resize-y rounded-xl border-ds-neutral-200 p-3 text-right leading-7 placeholder:text-ds-neutral-400" maxLength={5000} required /><p className="text-left text-[11px] text-ds-neutral-400">{details.length}/5000</p></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-ds-neutral-100 bg-ds-neutral-50 px-6 py-5 md:px-8"><p className="text-xs leading-5 text-ds-neutral-600">بالإرسال، ستتلقى رقم مرجع وتستطيع متابعة التحديثات من صفحة «طلباتي».</p><Button type="submit" disabled={createRequest.isPending} className="h-11 rounded-xl bg-ds-brand-800 px-5 font-bold hover:bg-ds-brand-950">{createRequest.isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Send className="ml-2 size-4" />}{createRequest.isPending ? "جارٍ الإرسال" : "إرسال الطلب"}</Button></div></form></div></DashboardLayout>;
}

function FieldLabel({ title, description }: { title: string; description: string }) { return <div><h2 className="font-bold text-ds-brand-1000">{title}</h2><p className="mt-1 text-xs text-ds-neutral-600">{description}</p></div>; }
function ServiceOption({ value, selected, icon: Icon, title, detail }: { value: "hr" | "government"; selected: boolean; icon: typeof Building2; title: string; detail: string }) { return <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selected ? "border-ds-brand-700 bg-ds-brand-50" : "border-ds-neutral-200 bg-white hover:border-ds-success-border"}`}><RadioGroupItem value={value} className="mt-1 border-ds-brand-400 text-ds-brand-800" /><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${value === "hr" ? "bg-ds-brand-100 text-ds-brand-700" : "bg-ds-warning-soft text-ds-warning"}`}><Icon className="size-4" /></span><span><span className="block text-sm font-bold text-ds-neutral-950">{title}</span><span className="mt-1 block text-xs leading-5 text-ds-neutral-600">{detail}</span></span></label>; }
