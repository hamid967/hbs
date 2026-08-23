import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CalendarDays, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const leaveTypes = ["إجازة سنوية", "إجازة مرضية", "إجازة طارئة"];

export default function EmployeeRequests() {
  const [, setLocation] = useLocation();
  const [leaveType, setLeaveType] = useState("إجازة سنوية");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [details, setDetails] = useState("");
  const create = trpc.requests.create.useMutation({ onSuccess: request => { toast.success("تم إرسال طلب الإجازة", { description: `رقم المرجع: ${request.reference}` }); setLocation("/my-requests"); }, onError: error => toast.error("تعذر إرسال الطلب", { description: error.message }) });
  const submitLeave = (event: React.FormEvent) => { event.preventDefault(); if (endDate < startDate) return toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية"); create.mutate({ type: "hr", category: leaveType, subject: `${leaveType} من ${startDate} إلى ${endDate}`, details: `بداية الإجازة: ${startDate}\nنهاية الإجازة: ${endDate}${details.trim() ? `\nتفاصيل إضافية: ${details.trim()}` : ""}`, priority: "normal" }); };
  return <DashboardLayout><main dir="rtl" className="mx-auto max-w-5xl"><header><p className="text-xs font-bold text-[#5d8d70]">طلبات الموظف</p><h1 className="mt-2 text-3xl font-bold text-[#1d4532]">إجازات ومصروفات في مسار واحد</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#748178]">تنتقل الطلبات إلى مديرك المباشر ثم إلى الموارد البشرية، مع إشعار واضح عند كل مرحلة.</p></header><section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><Card className="rounded-3xl border-[#dfe9e1] shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#e9f4eb] text-[#327950]"><CalendarDays className="size-5" /></span><div><h2 className="font-bold text-[#294535]">طلب إجازة</h2><p className="text-xs text-[#708076]">سنوية أو مرضية أو طارئة</p></div></div><form onSubmit={submitLeave} className="mt-6 grid gap-4 md:grid-cols-2"><div><Label>نوع الإجازة</Label><Select value={leaveType} onValueChange={setLeaveType}><SelectTrigger className="mt-2 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{leaveTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div /><div><Label htmlFor="leave-start">تاريخ البداية</Label><Input id="leave-start" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="mt-2 rounded-xl" required /></div><div><Label htmlFor="leave-end">تاريخ النهاية</Label><Input id="leave-end" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="mt-2 rounded-xl" required /></div><div className="md:col-span-2"><Label htmlFor="leave-details">تفاصيل إضافية</Label><Textarea id="leave-details" value={details} onChange={event => setDetails(event.target.value)} className="mt-2 min-h-20 rounded-xl" placeholder="اختياري" maxLength={1000} /></div><Button type="submit" disabled={create.isPending || !startDate || !endDate} className="rounded-xl bg-[#1f5b45] hover:bg-[#174735]">{create.isPending ? "جارٍ الإرسال" : "إرسال طلب الإجازة"}</Button></form></CardContent></Card><Card className="rounded-3xl border-[#dfe9e1] shadow-sm"><CardContent className="p-6"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#f8ead8] text-[#a96222]"><ReceiptText className="size-5" /></span><h2 className="mt-5 font-bold text-[#294535]">طلب مصروف</h2><p className="mt-2 text-sm leading-7 text-[#6f7f75]">مصروف سفر أو تشغيل بالمبلغ والسبب، ثم يمر بالمدير والموارد البشرية.</p><Link href="/requests/new"><Button variant="outline" className="mt-6 w-full rounded-xl border-[#e7d1b7] text-[#9d5c1d]">إنشاء طلب مصروف</Button></Link></CardContent></Card></section><section className="mt-8 rounded-3xl border border-[#dfe9e1] bg-[#f7faf7] p-6"><h2 className="font-bold text-[#294535]">متابعة الموافقة</h2><p className="mt-2 text-sm leading-7 text-[#6f7f75]">يمكنك متابعة حالة وتاريخ كل مرحلة من صفحة طلباتي، بينما تبقى ملاحظات المراجعين ضمن الجهات المخولة فقط.</p><Link href="/my-requests"><Button variant="outline" className="mt-4 rounded-xl border-[#d3e1d5] text-[#2f714d]">متابعة طلباتي</Button></Link></section></main></DashboardLayout>;
}
