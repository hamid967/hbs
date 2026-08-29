import AuthSpatialScene from "@/components/AuthSpatialScene";
import { ActionButton, FormField, InlineNotice } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@shared/passwordPolicy";
import { trpc } from "@/lib/trpc";
import { signInWithGoogle } from "@/lib/firebase";
import { CheckCircle2, KeyRound, MailCheck, PartyPopper, ShieldCheck, UserPlus } from "lucide-react";
import React, { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

function useToken() {
  return useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
}

export function LocalLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const login = trpc.localAccess.login.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); setLocation("/app"); } });
  const googleLoginMutation = trpc.localAccess.googleLogin.useMutation();
  const resend = trpc.localAccess.resendVerification.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const needsVerification = login.error?.data?.code === "FORBIDDEN";
  async function submit(event: FormEvent) { event.preventDefault(); await login.mutateAsync({ email, password }).catch(() => undefined); }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        await googleLoginMutation.mutateAsync({
          email: user.email || "",
          name: user.displayName || "مستخدم Google",
          openId: user.uid,
        }).catch((err) => {
          console.warn("Backend session sync note:", err);
        });
      }
      await utils.auth.me.invalidate();
      setLocation("/app");
    } catch (err: any) {
      setGoogleError(err?.message || "تعذر تسجيل الدخول بحساب Google");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AccessShell icon={<KeyRound />} eyebrow="دخول آمن" title="تسجيل الدخول" detail="ادخل بحساب Google أو بالبريد الإلكتروني وكلمة المرور الخاصة بك.">
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-ds-neutral-300 bg-white px-4 text-sm font-bold text-ds-neutral-900 shadow-sm transition hover:bg-ds-neutral-50 active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {googleLoading ? "جارٍ الاتصال بـ Google…" : "الدخول بواسطة حساب Google"}
        </button>

        {googleError ? <ErrorText error={googleError} /> : null}

        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-ds-neutral-200" />
          <span className="absolute bg-white px-3 text-xs font-bold text-ds-neutral-500">أو عبر بريد العمل</span>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <TextField label="بريد العمل" value={email} onChange={setEmail} type="email" autoComplete="email" required />
          <TextField label="كلمة المرور" value={password} onChange={setPassword} type="password" autoComplete="current-password" required />
          <ErrorText error={login.error?.message} />
          {needsVerification ? (
            <InlineNotice tone="warning">
              <button type="button" onClick={() => resend.mutate({ email })} className="font-bold underline" disabled={resend.isPending || resend.isSuccess}>
                {resend.isSuccess ? "أُرسل رابط تأكيد جديد إن كان الحساب بانتظار التأكيد." : resend.isPending ? "جارٍ الإرسال…" : "أرسل رابط تأكيد جديد"}
              </button>
            </InlineNotice>
          ) : null}
          <SubmitButton pending={login.isPending} pendingLabel="جارٍ التحقق…">تسجيل الدخول</SubmitButton>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-ds-neutral-200 pt-5 text-sm">
        <LinkButton onClick={() => setLocation("/forgot-password")}>نسيت كلمة المرور؟</LinkButton>
        <LinkButton onClick={() => setLocation("/register")}>أنشئ حساب منشأة جديد</LinkButton>
      </div>
    </AccessShell>
  );
}

export function RegisterCompany() {
  const [, setLocation] = useLocation();
  const register = trpc.localAccess.register.useMutation();
  const [form, setForm] = useState({ fullName: "", email: "", companyName: "", password: "" });
  const [confirm, setConfirm] = useState("");
  const mismatch = Boolean(form.password && confirm && form.password !== confirm);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mismatch) return;
    await register.mutateAsync(form).catch(() => undefined);
  }
  if (register.isSuccess) {
    return (
      <AccessShell icon={<MailCheck />} eyebrow="خطوة أخيرة" title="أكّد بريدك" detail={`أرسلنا رابط تأكيد إلى ${register.data.email}. الرابط صالح 24 ساعة، وبفتحه يصبح حسابك فعّالاً مباشرة.`}>
        {register.data.mailDelivered ? null : (
          <InlineNotice tone="warning" title="لم يُرسل البريد">
            ناقل البريد غير مهيّأ في هذه البيئة، فلن تصلك الرسالة. تواصل مع مسؤول المنصة لتفعيل الإرسال.
          </InlineNotice>
        )}
        <ActionButton intent="primary" onClick={() => setLocation("/login")} className="mt-4 h-12 w-full">العودة إلى الدخول</ActionButton>
      </AccessShell>
    );
  }
  return (
    <AccessShell icon={<UserPlus />} eyebrow="حساب جديد" title="سجّل منشأتك" detail="أنشئ حساب مسؤول منشأتك في خطوة واحدة. لا يحتاج التسجيل موافقة مسبقة.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="الاسم الكامل" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} autoComplete="name" required />
        <TextField label="بريد العمل" value={form.email} onChange={value => setForm({ ...form, email: value })} type="email" autoComplete="email" required />
        <TextField label="اسم المنشأة" value={form.companyName} onChange={value => setForm({ ...form, companyName: value })} autoComplete="organization" required hint="اسم منشأة جديد. للانضمام إلى منشأة قائمة اطلب دعوة من مسؤولها." />
        <TextField label="كلمة المرور" value={form.password} onChange={value => setForm({ ...form, password: value })} type="password" autoComplete="new-password" required hint="12 محرفاً على الأقل." />
        <PasswordMeter password={form.password} />
        <TextField label="تأكيد كلمة المرور" value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" required error={mismatch ? "كلمتا المرور غير متطابقتين" : undefined} />
        <ErrorText error={register.error?.message} />
        <SubmitButton pending={register.isPending} pendingLabel="جارٍ الإنشاء…" disabled={mismatch}>أنشئ الحساب</SubmitButton>
      </form>
      <div className="mt-5 border-t border-ds-neutral-200 pt-5 text-center text-sm">
        <LinkButton onClick={() => setLocation("/login")}>لديك حساب؟ سجّل الدخول</LinkButton>
      </div>
    </AccessShell>
  );
}

export function VerifyEmail() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const token = useToken();
  const verify = trpc.localAccess.verifyEmail.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); } });
  if (verify.isSuccess) {
    return (
      <AccessShell icon={<PartyPopper />} eyebrow="أهلاً بك" title="حسابك جاهز" detail="أُكِّد بريدك وفُعِّل حسابك. يمكنك الآن إعداد منشأتك ودعوة فريقك.">
        <ActionButton intent="primary" onClick={() => setLocation("/app")} className="h-12 w-full">ابدأ الإعداد</ActionButton>
      </AccessShell>
    );
  }
  return (
    <AccessShell icon={<ShieldCheck />} eyebrow="تأكيد البريد" title="أكّد ملكية بريدك" detail="خطوة واحدة تفصلك عن تفعيل الحساب. الرابط صالح للاستخدام مرة واحدة.">
      <ErrorText error={!token ? "رابط التأكيد غير مكتمل" : verify.error?.message} />
      <ActionButton intent="primary" onClick={() => verify.mutate({ token })} disabled={!token || verify.isPending} className="h-12 w-full">
        {verify.isPending ? "جارٍ التأكيد…" : "أكّد بريدي"}
      </ActionButton>
      <div className="mt-5 border-t border-ds-neutral-200 pt-5 text-center text-sm">
        <LinkButton onClick={() => setLocation("/login")}>العودة إلى الدخول</LinkButton>
      </div>
    </AccessShell>
  );
}

export function ForgotPassword() {
  const [, setLocation] = useLocation();
  const request = trpc.localAccess.requestPasswordReset.useMutation();
  const [email, setEmail] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); await request.mutateAsync({ email }).catch(() => undefined); }
  if (request.isSuccess) {
    return (
      <AccessShell icon={<MailCheck />} eyebrow="تحقّق من بريدك" title="أُرسل الرابط" detail="إن كان هذا البريد مرتبطاً بحساب فعّال فستصلك رسالة تحتوي رابط استعادة صالحاً لساعة واحدة.">
        <ActionButton intent="primary" onClick={() => setLocation("/login")} className="h-12 w-full">العودة إلى الدخول</ActionButton>
      </AccessShell>
    );
  }
  return (
    <AccessShell icon={<KeyRound />} eyebrow="استعادة الوصول" title="نسيت كلمة المرور" detail="أدخل بريد العمل وسنرسل إليك رابطاً لضبط كلمة مرور جديدة.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="بريد العمل" value={email} onChange={setEmail} type="email" autoComplete="email" required />
        <ErrorText error={request.error?.message} />
        <SubmitButton pending={request.isPending} pendingLabel="جارٍ الإرسال…">أرسل رابط الاستعادة</SubmitButton>
      </form>
      <div className="mt-5 border-t border-ds-neutral-200 pt-5 text-center text-sm">
        <LinkButton onClick={() => setLocation("/login")}>العودة إلى الدخول</LinkButton>
      </div>
    </AccessShell>
  );
}

export function ResetPassword() {
  const [, setLocation] = useLocation();
  const token = useToken();
  const reset = trpc.localAccess.resetPassword.useMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = Boolean(password && confirm && password !== confirm);
  async function submit(event: FormEvent) { event.preventDefault(); if (mismatch) return; await reset.mutateAsync({ token, password }).catch(() => undefined); }
  if (reset.isSuccess) {
    return (
      <AccessShell icon={<CheckCircle2 />} eyebrow="تم" title="ضُبطت كلمة المرور" detail="سجّل الدخول بكلمة المرور الجديدة. لم نفتح جلسة تلقائياً حفاظاً على حسابك إن كان الرابط قد وصل إلى جهاز مشترك.">
        <ActionButton intent="primary" onClick={() => setLocation("/login")} className="h-12 w-full">تسجيل الدخول</ActionButton>
      </AccessShell>
    );
  }
  return (
    <AccessShell icon={<ShieldCheck />} eyebrow="استعادة" title="اضبط كلمة مرور جديدة" detail="الرابط صالح للاستخدام مرة واحدة ولمدة ساعة.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="كلمة المرور الجديدة" value={password} onChange={setPassword} type="password" autoComplete="new-password" required hint="12 محرفاً على الأقل." />
        <PasswordMeter password={password} />
        <TextField label="تأكيد كلمة المرور" value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" required error={mismatch ? "كلمتا المرور غير متطابقتين" : undefined} />
        <ErrorText error={!token ? "رابط الاستعادة غير مكتمل" : reset.error?.message} />
        <SubmitButton pending={reset.isPending} pendingLabel="جارٍ الحفظ…" disabled={!token || mismatch}>احفظ كلمة المرور</SubmitButton>
      </form>
    </AccessShell>
  );
}

export function SubscriptionRequest() {
  const [, setLocation] = useLocation();
  const request = trpc.localAccess.requestSubscription.useMutation();
  const [form, setForm] = useState({ fullName: "", email: "", companyName: "", notes: "" });
  async function submit(event: FormEvent) { event.preventDefault(); await request.mutateAsync(form).catch(() => undefined); }
  if (request.isSuccess) {
    return (
      <AccessShell icon={<MailCheck />} eyebrow="تم الاستلام" title="وصل طلب الاشتراك" detail="سيراجع مسؤول المنصة الطلب. عند الموافقة يصدر رابط دعوة آمن لإنشاء كلمة المرور؛ لا نرسل كلمات مرور عبر البريد.">
        <ActionButton intent="primary" onClick={() => setLocation("/login")} className="h-12 w-full">العودة إلى الدخول</ActionButton>
      </AccessShell>
    );
  }
  return (
    <AccessShell icon={<UserPlus />} eyebrow="اشتراك مُدار" title="اطلب اشتراك المنشأة" detail="هذا المسار للمنشآت التي تفضّل إعداداً مُداراً من فريق المنصة. للتسجيل الفوري استخدم إنشاء حساب جديد.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="الاسم الكامل" value={form.fullName} onChange={value => setForm({ ...form, fullName: value })} autoComplete="name" required />
        <TextField label="بريد العمل" value={form.email} onChange={value => setForm({ ...form, email: value })} type="email" autoComplete="email" required />
        <TextField label="اسم المنشأة" value={form.companyName} onChange={value => setForm({ ...form, companyName: value })} autoComplete="organization" required />
        <FormField label="ملاحظات اختيارية">
          {props => <textarea {...props} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} className="min-h-24 w-full rounded-xl border border-ds-neutral-300 bg-ds-white px-3 py-2 text-sm outline-none ring-ds-emerald focus:ring-2" maxLength={2000} />}
        </FormField>
        <ErrorText error={request.error?.message} />
        <SubmitButton pending={request.isPending} pendingLabel="جارٍ الإرسال…">إرسال طلب الاشتراك</SubmitButton>
      </form>
      <div className="mt-5 border-t border-ds-neutral-200 pt-5 text-center text-sm">
        <LinkButton onClick={() => setLocation("/register")}>أفضّل التسجيل الفوري</LinkButton>
      </div>
    </AccessShell>
  );
}

export function ActivateInvitation() {
  const [, setLocation] = useLocation();
  const token = useToken();
  const activate = trpc.localAccess.activateInvitation.useMutation({ onSuccess: () => setLocation("/app") });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = Boolean(password && confirm && password !== confirm);
  async function submit(event: FormEvent) { event.preventDefault(); if (mismatch) return; await activate.mutateAsync({ token, password }).catch(() => undefined); }
  return (
    <AccessShell icon={<ShieldCheck />} eyebrow="تفعيل الدعوة" title="أنشئ كلمة المرور" detail="الرابط صالح للاستخدام مرة واحدة ولمدة محدودة. بعد التفعيل ستدخل مباشرة إلى المنصة.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="كلمة المرور الجديدة" value={password} onChange={setPassword} type="password" autoComplete="new-password" required hint="12 محرفاً على الأقل." />
        <PasswordMeter password={password} />
        <TextField label="تأكيد كلمة المرور" value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" required error={mismatch ? "كلمتا المرور غير متطابقتين" : undefined} />
        <ErrorText error={!token ? "رابط الدعوة غير مكتمل" : activate.error?.message} />
        <SubmitButton pending={activate.isPending} pendingLabel="جارٍ التفعيل…" disabled={!token || mismatch}>تفعيل الحساب</SubmitButton>
      </form>
    </AccessShell>
  );
}

function AccessShell({ icon, eyebrow, title, detail, children }: { icon: React.ReactNode; eyebrow: string; title: string; detail: string; children: React.ReactNode }) {
  return (
    <main dir="rtl" className="auth-access-page">
      <div className="auth-page-shimmer" />
      <div className="auth-access-layout">
        <AuthSpatialScene />
        <section className="auth-access-panel">
          <div className="auth-panel-ribbon"><span className="auth-panel-mark">هـ</span><span>HR HBS</span><span className="auth-panel-line" /></div>
          <div className="auth-panel-heading">
            <div className="auth-panel-icon">{icon}</div>
            <p>{eyebrow}</p>
            <h1 className="premium-wordmark">{title}</h1>
            <div className="auth-panel-detail">{detail}</div>
          </div>
          <div className="auth-panel-form">{children}</div>
          <p className="auth-panel-footer">بياناتك تحميها ضوابط الوصول الداخلية للمنصة</p>
        </section>
      </div>
    </main>
  );
}

function TextField({ label, value, onChange, type = "text", autoComplete, required, hint, error }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; required?: boolean; hint?: string; error?: string }) {
  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      {props => <Input {...props} type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} className="h-11 rounded-xl border-ds-neutral-300 bg-ds-white" />}
    </FormField>
  );
}

const strengthLabels = ["", "ضعيفة", "مقبولة", "قوية"] as const;
const strengthTones = ["bg-ds-neutral-200", "bg-ds-danger", "bg-ds-warning", "bg-ds-success"] as const;

function PasswordMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  if (!password) return null;
  return (
    <div>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map(step => <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= score ? strengthTones[score] : "bg-ds-neutral-200"}`} />)}
      </div>
      <p className="mt-1.5 text-xs font-bold text-ds-neutral-600" aria-live="polite">قوة كلمة المرور: {strengthLabels[score] || "ضعيفة جداً"}</p>
    </div>
  );
}

function SubmitButton({ pending, pendingLabel, disabled, children }: { pending: boolean; pendingLabel: string; disabled?: boolean; children: React.ReactNode }) {
  return <ActionButton type="submit" intent="primary" disabled={pending || disabled} className="h-12 w-full bg-ds-emerald text-ds-ink hover:bg-ds-emerald-bright">{pending ? pendingLabel : children}</ActionButton>;
}

function LinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="font-bold text-ds-success underline-offset-4 hover:underline">{children}</button>;
}

function ErrorText({ error }: { error?: string }) {
  return error ? <p role="alert" className="rounded-xl bg-ds-danger-soft p-3 text-xs leading-6 text-ds-danger">{error}</p> : null;
}
