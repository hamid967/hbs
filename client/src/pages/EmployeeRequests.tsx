import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ReceiptText } from "lucide-react";
import { Link } from "wouter";

const requestKinds = [
  { icon: CalendarDays, title: "طلب إجازة", description: "إجازة سنوية أو مرضية أو طارئة، تُحال أولاً إلى مديرك المباشر ثم إلى الموارد البشرية.", categories: "سنوية · مرضية · طارئة" },
  { icon: ReceiptText, title: "طلب مصروف", description: "أدخل مبلغ المصروف وسببه ليُراجع ضمن المسار التشغيلي نفسه دون الحاجة لإرفاق مستند في الإصدار الأول.", categories: "سفر · تشغيل" },
];

export default function EmployeeRequests() {
  return <DashboardLayout><main dir="rtl" className="mx-auto max-w-5xl"><header><p className="text-xs font-bold text-[#5d8d70]">طلبات الموظف</p><h1 className="mt-2 text-3xl font-bold text-[#1d4532]">إجازات ومصروفات في مسار واحد</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#748178]">اختر نوع الطلب، ثم يتابع النظام المدير المباشر والموارد البشرية مع إشعارات واضحة لكل انتقال.</p></header><section className="mt-8 grid gap-5 md:grid-cols-2">{requestKinds.map(item => <Card key={item.title} className="rounded-3xl border-[#dfe9e1] shadow-sm"><CardContent className="p-6"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#e9f4eb] text-[#327950]"><item.icon className="size-6" /></span><h2 className="mt-5 text-xl font-bold text-[#294535]">{item.title}</h2><p className="mt-3 min-h-14 text-sm leading-7 text-[#6f7f75]">{item.description}</p><p className="mt-4 text-xs font-bold text-[#5d8d70]">{item.categories}</p><Link href="/requests/new"><Button className="mt-6 w-full rounded-xl bg-[#1f5b45] hover:bg-[#174735]">إنشاء الطلب</Button></Link></CardContent></Card>)}</section><section className="mt-8 rounded-3xl border border-[#dfe9e1] bg-[#f7faf7] p-6"><h2 className="font-bold text-[#294535]">كيف تسير الموافقة؟</h2><p className="mt-2 text-sm leading-7 text-[#6f7f75]">يصل الطلب إلى مديرك المباشر أولاً. بعد موافقته، يُحال تلقائياً إلى الموارد البشرية، ويمكنك متابعة الحالة وتاريخ كل مرحلة من تفاصيل الطلب.</p><Link href="/my-requests"><Button variant="outline" className="mt-4 rounded-xl border-[#d3e1d5] text-[#2f714d]">متابعة طلباتي</Button></Link></section></main></DashboardLayout>;
}
