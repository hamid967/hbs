import { Button } from "@/components/ui/button";
import AuthSpatialScene from "@/components/AuthSpatialScene";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { KeyRound, MailCheck, ShieldCheck, UserPlus } from "lucide-react";
import React, { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

export function LocalLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const login = trpc.localAccess.login.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); setLocation("/app"); } });
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); await login.mutateAsync({ email, password }); }
  return <AccessShell icon={<KeyRound />} eyebrow="دخول آمن" title="الدخول بالبريد" detail="استخدم بريد العمل وكلمة المرور التي أنشأتها عبر رابط الدعوة."><form onSubmit={submit} className="space-y-4"><Field label="بريد العمل" value={email} onChange={setEmail} type="email" autoComplete="email" /><Field label="كلمة المرور" value={password} onChange={setPassword} type="password" autoComplete="current-password" /><ErrorText error={login.error?.message} /><Button disabled={login.isPending} className="pressable h-12 w-full rounded-xl bg-ds-emerald font-bold text-ds-ink hover:bg-ds-emerald-bright">{login.isPending ? "جارٍ التحقق…" : "تسجيل الدخول"}</Button></form><div className="mt-6 border-t border-ds-neutral-200 pt-5 text-center"><button onClick={() => setLocation("/subscribe")} className="text-sm font-bold text-ds-success">طلب اشتراك جديد</button></div></AccessShell>;
}

export function SubscriptionRequest() {
  const [, setLocation] = useLocation(); const request = trpc.localAccess.requestSubscription.useMutation();
  const [form, setForm] = useState({ fullName: "", email: "", companyName: "", notes: "" });
  async function submit(event: FormEvent) { event.preventDefault(); await request.mutateAsync(form); }
  if (request.isSuccess) return <AccessShell icon={<MailCheck />} eyebrow="تم الاستلام" title="وصل طلب الاشتراك" detail="سيراجع مسؤول المنصة الطلب. عند الموافقة، يصدر رابط دعوة آمن لإنشاء كلمة المرور؛ لا نرسل كلمات مرور عبر البريد."><Button onClick={() => setLocation("/login")} className="pressable w-full rounded-xl bg-ds-emerald text-ds-ink">العودة إلى الدخول</Button></AccessShell>;
  return <AccessShell icon={<UserPlus />} eyebrow="اشتراك جديد" title="اطلب اشتراك المنشأة" detail="أدخل بيانات التواصل الأساسية. لا يؤدي الإرسال إلى إنشاء حساب نشط تلقائياً."><form onSubmit={submit} className="space-y-4"><Field label="الاسم الكامل" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} autoComplete="name" /><Field label="بريد العمل" value={form.email} onChange={value => setForm({ ...form, email: value })} type="email" autoComplete="email" /><Field label="اسم المنشأة" value={form.companyName} onChange={value => setForm({ ...form, companyName: value })} autoComplete="organization" /><label className="block text-right text-sm font-bold text-ds-brand-900">ملاحظات اختيارية<textarea value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-ds-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-ds-emerald focus:ring-2" maxLength={2000} /></label><ErrorText error={request.error?.message} /><Button disabled={request.isPending} className="pressable h-12 w-full rounded-xl bg-ds-emerald font-bold text-ds-ink">{request.isPending ? "جارٍ الإرسال…" : "إرسال طلب الاشتراك"}</Button></form></AccessShell>;
}

export function ActivateInvitation() {
  const [, setLocation] = useLocation(); const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []); const activate = trpc.localAccess.activateInvitation.useMutation({ onSuccess: () => setLocation("/app") }); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); if (password !== confirm) return; await activate.mutateAsync({ token, password }); }
  return <AccessShell icon={<ShieldCheck />} eyebrow="تفعيل الدعوة" title="أنشئ كلمة المرور" detail="الرابط صالح للاستخدام مرة واحدة ولمدة محدودة. بعد التفعيل ستدخل مباشرة إلى المنصة."><form onSubmit={submit} className="space-y-4"><Field label="كلمة المرور الجديدة" value={password} onChange={setPassword} type="password" autoComplete="new-password" /><Field label="تأكيد كلمة المرور" value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" /><ErrorText error={!token ? "رابط الدعوة غير مكتمل" : password && confirm && password !== confirm ? "كلمتا المرور غير متطابقتين" : activate.error?.message} /><Button disabled={!token || password !== confirm || activate.isPending} className="pressable h-12 w-full rounded-xl bg-ds-emerald font-bold text-ds-ink">{activate.isPending ? "جارٍ التفعيل…" : "تفعيل الحساب"}</Button></form></AccessShell>;
}

function AccessShell({ icon, eyebrow, title, detail, children }: { icon: React.ReactNode; eyebrow: string; title: string; detail: string; children: React.ReactNode }) { return <main dir="rtl" className="auth-access-page"><div className="auth-page-shimmer" /><div className="auth-access-layout"><AuthSpatialScene /><section className="auth-access-panel"><div className="auth-panel-ribbon"><span className="auth-panel-mark">هـ</span><span>HR HBS</span><span className="auth-panel-line" /></div><div className="auth-panel-heading"><div className="auth-panel-icon">{icon}</div><p>{eyebrow}</p><h1 className="premium-wordmark">{title}</h1><div className="auth-panel-detail">{detail}</div></div><div className="auth-panel-form">{children}</div><p className="auth-panel-footer">بياناتك تحميها ضوابط الوصول الداخلية للمنصة</p></section></div></main>; }
function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) { return <label className="block text-right text-sm font-bold text-ds-brand-900">{label}<Input type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} required className="mt-2 h-11 rounded-xl border-ds-neutral-300 bg-white" /></label>; }
function ErrorText({ error }: { error?: string }) { return error ? <p role="alert" className="rounded-xl bg-ds-danger-soft p-3 text-xs leading-6 text-ds-danger">{error}</p> : null; }
