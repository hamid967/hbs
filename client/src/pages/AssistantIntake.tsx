import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { BotMessageSquare, ClipboardCheck, FilePlus2, Loader2, RotateCcw, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AssistantIntake() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [sessionId, setSessionId] = useState<number | undefined>();
  const stateInput = useMemo(() => ({ ...(sessionId ? { sessionId } : {}) }), [sessionId]);
  const { data, isLoading, isError } = trpc.assistant.state.useQuery(stateInput);
  const chat = trpc.assistant.chat.useMutation({
    onSuccess: result => {
      setSessionId(result.session?.id);
      utils.assistant.state.invalidate();
    },
    onError: error => toast.error("تعذر إكمال المحادثة", { description: error.message }),
  });
  const createSession = trpc.assistant.newSession.useMutation({
    onSuccess: session => { setSessionId(session.id); utils.assistant.state.invalidate(); },
    onError: error => toast.error("تعذر بدء محادثة جديدة", { description: error.message }),
  });
  const convert = trpc.assistant.convertToRequest.useMutation({
    onSuccess: request => { toast.success("تم تحويل المحادثة إلى طلب", { description: `رقم المرجع: ${request.reference}` }); setLocation(`/requests/${request.id}`); },
    onError: error => toast.error("تعذر إرسال الطلب", { description: error.message }),
  });

  const messages: Message[] = data?.messages.map(message => ({ role: message.role, content: message.content })) || [];
  const draft = data?.session;
  const isReady = Boolean(draft?.draftType && draft?.draftCategory && draft?.draftSubject && draft?.draftDetails && draft.status === "open");

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl"><header className="rounded-[2rem] bg-[#183f31] p-6 text-white shadow-[0_16px_36px_rgba(25,62,48,.14)] md:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><div className="flex items-center gap-2 text-xs font-bold text-[#e6c69b]"><BotMessageSquare className="size-4" />مساعد استقبال الطلبات</div><h1 className="mt-3 text-3xl font-bold tracking-tight">أخبرنا بما تحتاجه، وسننظّم طلبك.</h1><p className="mt-3 text-sm leading-7 text-[#d9e7dc]">المساعد يساعدك على جمع المعلومات الأساسية وتحديد المسار الصحيح، ثم تراجع المسودة قبل إرسالها رسمياً.</p></div><Button onClick={() => createSession.mutate()} disabled={createSession.isPending} variant="outline" className="h-10 rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"><RotateCcw className="ml-2 size-4" />بدء محادثة جديدة</Button></div></header><div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">{isLoading ? <Skeleton className="h-[620px] rounded-3xl" /> : isError ? <div className="flex h-[620px] items-center justify-center rounded-3xl border border-[#ebd3d3] bg-[#fffafa] p-8 text-center text-sm text-[#914944]">تعذر تحميل المحادثة. حدّث الصفحة وحاول مجدداً.</div> : <AIChatBox messages={messages} onSendMessage={message => chat.mutate({ ...(data?.session ? { sessionId: data.session.id } : {}), message })} isLoading={chat.isPending} className="h-[620px] rounded-3xl border-[#dce7de] shadow-[0_10px_28px_rgba(21,50,35,.05)]" height="620px" placeholder="اكتب طلبك أو احتياجك هنا…" emptyStateMessage="يمكنك وصف طلبك بكلماتك وسأساعدك على تنظيمه." suggestedPrompts={["أرغب في طلب تعريف بالراتب", "أحتاج متابعة تجديد الإقامة", "أود طلب إجازة سنوية"]} />}{<aside className="rounded-3xl border border-[#e1e9e2] bg-white p-5 shadow-[0_10px_28px_rgba(21,50,35,.04)]"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-[#e6f1e6] text-[#2f7850]"><ClipboardCheck className="size-5" /></div><div><h2 className="font-bold text-[#233f31]">مسودة الطلب</h2><p className="mt-0.5 text-[11px] text-[#7b897f]">تتجدد أثناء المحادثة</p></div></div>{draft ? <div className="mt-6 space-y-4"><DraftField label="القسم" value={draft.draftType === "hr" ? "الموارد البشرية" : draft.draftType === "government" ? "العلاقات الحكومية" : "بانتظار التحديد"} /><DraftField label="الخدمة" value={draft.draftCategory || "بانتظار المعلومات"} /><DraftField label="العنوان" value={draft.draftSubject || "بانتظار المعلومات"} /><div><p className="text-[11px] font-bold text-[#718076]">ملخص التفاصيل</p><p className="mt-1 rounded-xl bg-[#f8faf7] p-3 text-xs leading-6 text-[#586b5e]">{draft.draftDetails || "أكمل المحادثة ليظهر ملخص واضح للطلب."}</p></div></div> : <div className="mt-7 rounded-2xl bg-[#f7faf7] p-4 text-sm leading-7 text-[#718076]">ابدأ المحادثة، وسيظهر هنا ملخص منظم للطلب قبل الإرسال.</div>}<Button onClick={() => draft && convert.mutate({ sessionId: draft.id })} disabled={!isReady || convert.isPending} className="mt-6 h-11 w-full rounded-xl bg-[#1f5b45] font-bold hover:bg-[#174735]">{convert.isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Send className="ml-2 size-4" />}{isReady ? "تحويل إلى طلب رسمي" : "أكمل معلومات الطلب أولاً"}</Button><Button onClick={() => setLocation("/requests/new")} variant="ghost" className="mt-2 h-9 w-full rounded-xl text-xs text-[#567768]"><FilePlus2 className="ml-1.5 size-3.5" />استخدام النموذج المباشر بدلاً من ذلك</Button></aside>}</div></div></DashboardLayout>;
}

function DraftField({ label, value }: { label: string; value: string }) { return <div className="border-b border-[#edf1ed] pb-3"><p className="text-[11px] font-bold text-[#718076]">{label}</p><p className="mt-1 text-sm font-semibold text-[#31473a]">{value}</p></div>; }
