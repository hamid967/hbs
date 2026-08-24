import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BotMessageSquare, Building2, ChevronLeft, Clock3, FilePlus2, Landmark, Orbit, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const serviceCards = [
  { title: "طلب موارد بشرية", detail: "إجازات، تعريف بالراتب، تحديث بيانات، ومزيد من الخدمات.", icon: Building2, tone: "bg-[#e2eee2] text-[#1f5b45]", path: "/requests/new?type=hr" },
  { title: "طلب علاقات حكومية", detail: "معاملات الجهات الرسمية، التأشيرات، والإقامات والتصديقات.", icon: Landmark, tone: "bg-[#f6e9d7] text-[#9a5d20]", path: "/requests/new?type=government" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [introVisible, setIntroVisible] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setIntroVisible(false), 1750); return () => window.clearTimeout(timer); }, []);
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl" dir="rtl">
        <div aria-hidden={!introVisible} className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#0e281f] transition-all duration-700 ${introVisible ? "opacity-100" : "opacity-0"}`}><div className="intro-orbit relative grid size-44 place-items-center rounded-full border border-[#e8cda2]/35 bg-[#143f31] shadow-[0_0_0_18px_rgba(232,205,162,.05),0_32px_70px_rgba(0,0,0,.35)]"><div className="absolute size-60 rounded-full border border-[#e8cda2]/30" /><div className="absolute size-76 rounded-full border border-[#78b18e]/20" /><span className="grid size-20 place-items-center rounded-[1.75rem] bg-[#e8cda2] text-[#173e30] shadow-xl"><Orbit className="size-9" /></span><p className="absolute -bottom-12 whitespace-nowrap text-sm font-bold tracking-[.18em] text-[#f5ead8]">حلول الغد · HR HBS</p></div></div>
        <section className="hero-depth relative overflow-hidden rounded-[2rem] bg-[#143f31] px-6 py-8 text-white shadow-[0_24px_60px_rgba(20,63,49,.22)] md:px-10 md:py-12">
          <div className="absolute -left-16 -top-14 size-56 rounded-full border-[24px] border-[#e5c59a]/20" /><div className="absolute right-[42%] top-[-7rem] size-60 rounded-full bg-[#5ea077]/15 blur-3xl" />
          <div className="hero-orbit absolute bottom-[-6rem] left-[8%] size-52 rounded-full border border-[#e5c59a]/25" /><div className="hero-orbit-reverse absolute right-[-5rem] top-[14%] size-36 rounded-full border-[12px] border-[#6dad82]/20" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-wide text-[#e5c59a]"><Sparkles className="size-4" /> بوابة الخدمات الداخلية</div><h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">كل طلباتك الإدارية،<br /><span className="text-[#e5c59a]">في مساحة عمل ذكية.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#d9e9dc] md:text-base">قدّم طلبك، تابع مساره، واحتفظ بسجل واضح لكل المراسلات والتحديثات ضمن تجربة عربية منظمة.</p><Button onClick={() => setLocation("/requests/new")} className="mt-7 h-11 rounded-xl bg-[#e5c59a] px-5 font-bold text-[#173e30] shadow-[0_10px_0_rgba(105,67,30,.28)] transition hover:-translate-y-0.5 hover:bg-[#f0d5af]"><FilePlus2 className="ml-2 size-4" />ابدأ طلباً جديداً</Button></div><div className="hero-console relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-[0_25px_40px_rgba(0,0,0,.24)] backdrop-blur-md"><div className="flex items-center justify-between text-xs text-[#d9e9dc]"><span>مساحة العمليات</span><span className="rounded-full bg-[#e5c59a] px-2 py-1 font-bold text-[#173e30]">متصل الآن</span></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/10 p-3"><b className="text-xl text-[#e5c59a]">12</b><p className="mt-1 text-[10px] text-[#d9e9dc]">طلبات جديدة</p></div><div className="rounded-2xl bg-white/10 p-3"><b className="text-xl text-[#e5c59a]">04</b><p className="mt-1 text-[10px] text-[#d9e9dc]">قيد المراجعة</p></div><div className="rounded-2xl bg-white/10 p-3"><b className="text-xl text-[#e5c59a]">08</b><p className="mt-1 text-[10px] text-[#d9e9dc]">مكتملة</p></div></div><div className="mt-3 rounded-2xl bg-[#0e2e22]/80 p-4"><p className="text-xs font-bold text-[#e5c59a]">مسار ذكي للموافقة</p><div className="mt-3 flex items-center gap-2"><i className="size-2 rounded-full bg-[#e5c59a]" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-[#75bd8b]" /><span className="h-px flex-1 bg-white/20" /><i className="size-2 rounded-full bg-white" /></div></div></div></div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold text-[#173e30]">الخدمات المتاحة</p><p className="mt-1 text-xs text-[#79867e]">اختر المجال المناسب لبدء طلبك.</p></div>
            <button onClick={() => setLocation("/requests/new")} className="flex items-center gap-1 text-xs font-bold text-[#26714f]">عرض جميع الخدمات <ChevronLeft className="size-4" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map(card => <button key={card.title} onClick={() => setLocation(card.path)} className="group flex items-start gap-4 rounded-3xl border border-[#e5eae5] bg-white p-5 text-right shadow-[0_10px_28px_rgba(21,50,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#bcd2c1] hover:shadow-[0_14px_30px_rgba(21,50,35,0.09)]">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}><card.icon className="size-5" /></div>
              <div className="flex-1"><h2 className="font-bold text-[#233e31]">{card.title}</h2><p className="mt-2 text-xs leading-6 text-[#728077]">{card.detail}</p></div>
              <ArrowLeft className="mt-1 size-4 text-[#9ca8a1] transition-transform group-hover:-translate-x-1" />
            </button>)}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <button onClick={() => setLocation("/assistant")} className="group overflow-hidden rounded-3xl bg-[#e3f0e5] p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(21,50,35,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#28704d]"><BotMessageSquare className="size-5" /></span><ArrowLeft className="size-4 text-[#4f7962] transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-[#1e4e37]">مساعد استقبال الطلبات</p><p className="mt-2 text-sm leading-6 text-[#597767]">اكتب ما تحتاجه، وسيساعدك المساعد على تنظيمه وتحويله إلى مسودة طلب قابلة للمراجعة.</p></button><button onClick={() => setLocation("/hr-system")} className="group overflow-hidden rounded-3xl bg-[#f5e7d2] p-6 text-right transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(92,56,22,.10)]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#9a5b1f]"><WandSparkles className="size-5" /></span><ArrowLeft className="size-4 text-[#957146] transition-transform group-hover:-translate-x-1" /></div><p className="mt-7 text-lg font-bold text-[#69451e]">مصمم نظام الموارد البشرية</p><p className="mt-2 text-sm leading-6 text-[#836441]">أدخل نشاط الشركة وحجمها، ثم أنشئ مخطط نظام موارد بشرية مناسباً لمراحل العمل القادمة.</p></button>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-[#e5eae5] bg-white p-6 shadow-[0_10px_28px_rgba(21,50,35,0.04)]">
            <div className="flex items-start justify-between"><div><h2 className="font-bold text-[#173e30]">متابعة طلباتك</h2><p className="mt-1 text-xs text-[#7a877f]">ستظهر هنا التحديثات فور تسجيل طلبك.</p></div><Button variant="outline" onClick={() => setLocation("/my-requests")} className="h-8 rounded-lg border-[#d6e1d7] text-xs text-[#2c684e]">عرض الطلبات</Button></div>
            <div className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d6e3d8] bg-[#fbfcfa] px-5 py-9 text-center"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf4ed] text-[#3b7c59]"><Clock3 className="size-5" /></div><p className="mt-3 text-sm font-semibold text-[#425449]">لا توجد طلبات للعرض حالياً</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#849087]">استخدم زر «ابدأ طلباً جديداً» لتقديم أول طلب لك ومتابعة حالة معالجته من هنا.</p></div>
          </div>
          <aside className="rounded-3xl bg-[#f0e4d1] p-6"><p className="text-xs font-bold text-[#9a5d20]">معلومة سريعة</p><h2 className="mt-3 text-xl font-bold leading-8 text-[#60401e]">التفاصيل الدقيقة تسرّع إنجاز الطلب.</h2><p className="mt-3 text-xs leading-6 text-[#85613b]">أرفق المعلومات الأساسية واستخدم وصفاً واضحاً ليتمكن الفريق المختص من متابعة معاملتك بكفاءة.</p></aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
