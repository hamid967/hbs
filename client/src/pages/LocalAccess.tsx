import AuthSpatialScene from "@/components/AuthSpatialScene";
import { ActionButton, FormField, InlineNotice } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@shared/passwordPolicy";
import { trpc } from "@/lib/trpc";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/_core/hooks/useAuth";
import { COOKIE_NAME } from "@shared/const";
import { CheckCircle2, KeyRound, MailCheck, PartyPopper, ShieldCheck, UserPlus, ArrowRight, LogOut, Sparkles } from "lucide-react";
import React, { FormEvent, useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";

function useToken() {
  return useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
}

export function LocalLogin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const reason = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("reason");
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/app");
    }
  }, [isAuthenticated, user, setLocation]);

  const login = trpc.localAccess.login.useMutation({
    onSuccess: async (data) => {
      if (data?.token) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.token}`);
          localStorage.setItem("manus-runtime-user-token", data.token);
        } catch {}
      }
      if (data?.user) {
        utils.auth.me.setData(undefined, data.user);
        try {
          localStorage.setItem("manus-runtime-user-info", JSON.stringify(data.user));
        } catch {}
      }
      await utils.auth.me.refetch().catch(() => undefined);
      setLocation("/app");
    },
  });
  const googleLoginMutation = trpc.localAccess.googleLogin.useMutation();
  const resend = trpc.localAccess.resendVerification.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const needsVerification = login.error?.data?.code === "FORBIDDEN";
  async function submit(event: FormEvent) {
    event.preventDefault();
    await login.mutateAsync({ email, password }).catch(() => undefined);
  }

  function fillAdminCredentials() {
    setEmail("hamid@hrhbs.com");
    setPassword("HBS@Admin2026!");
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const gUser = await signInWithGoogle();
      if (gUser) {
        const res = await googleLoginMutation.mutateAsync({
          email: gUser.email || "",
          name: gUser.displayName || "مستخدم Google",
          openId: gUser.uid,
        }).catch((err) => {
          console.warn("Backend session sync note:", err);
          return null;
        });
        if (res?.token) {
          try {
            sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${res.token}`);
            localStorage.setItem("manus-runtime-user-token", res.token);
          } catch {}
        }
        if (res?.user) {
          utils.auth.me.setData(undefined, res.user);
          try {
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(res.user));
          } catch {}
        }
      }
      await utils.auth.me.refetch().catch(() => undefined);
      setLocation("/app");
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" || 
        err?.message?.includes("popup-closed-by-user") ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        // User closed or dismissed the popup voluntarily
        setGoogleError(null);
      } else {
        setGoogleError(err?.message || "تعذر تسجيل الدخول بحساب Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  if (isAuthenticated && user) {
    return (
      <AccessShell icon={<ShieldCheck />} eyebrow="جلسة نشطة" title="أنت مسجل الدخول بالفعل" detail={`مرحباً بك مجدداً ${user.name || "مستخدم"} (${user.email || ""})`}>
        <div className="space-y-4">
          <ActionButton
            intent="primary"
            onClick={() => setLocation("/app")}
            className="flex h-12 w-full items-center justify-center gap-2 bg-ds-brand-600 text-white hover:bg-ds-brand-700"
          >
            <span>الانتقال إلى لوحة التحكم</span>
            <ArrowRight className="size-4 rotate-180" />
          </ActionButton>

          <button
            type="button"
            onClick={async () => {
              try {
                sessionStorage.removeItem("manus-cookie");
                localStorage.removeItem("manus-runtime-user-token");
                localStorage.removeItem("manus-runtime-user-info");
              } catch {}
              await logout();
              await utils.auth.me.invalidate();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ds-neutral-200 bg-white text-sm font-semibold text-ds-neutral-700 transition hover:bg-ds-neutral-50"
          >
            <LogOut className="size-4" />
            <span>تسجيل الخروج والتبديل لحساب آخر</span>
          </button>
        </div>
      </AccessShell>
    );
  }

  return (
    <AccessShell icon={<KeyRound />} eyebrow="دخول آمن" title="الدخول بالبريد" detail="ادخل بحساب Google أو بالبريد الإلكتروني وكلمة المرور الخاصة بك.">
      <div className="space-y-4">
        {reason === "expired" ? (
          <InlineNotice tone="warning" title="انتهت صلاحية الجلسة">
            انتهت صلاحية جلسة العمل السابقة لأسباب أمنية. يُرجى تسجيل الدخول مجدداً للمتابعة.
          </InlineNotice>
        ) : null}
        {reason === "required" ? (
          <InlineNotice tone="info" title="تسجيل الدخول مطلوب">
            يرجى تسجيل الدخول أولاً للوصول إلى لوحة التحكم والخدمات المؤسسية.
          </InlineNotice>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-ds-neutral-300 bg-white px-4 text-sm font-bold text-ds-neutral-900 shadow-sm transition hover:bg-ds-neutral-50 active:scale-[0.99] disabled:opacity-50"
        >
          <ShieldCheck className="size-5 text-ds-brand-600" />
          {googleLoading ? "جارٍ الاتصال بـ Google…" : "الدخول بواسطة حساب Google"}
        </button>

        {googleError ? <ErrorText error={googleError} /> : null}

        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-ds-neutral-200" />
          <span className="absolute bg-white px-3 text-xs font-bold text-ds-neutral-500">أو عبر بريد العمل</span>
        </div>

        {/* Quick Demo Access Helper */}
        <div className="rounded-xl border border-ds-brand-200 bg-ds-brand-50/70 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-bold text-ds-brand-900">
              <Sparkles className="size-3.5 text-ds-brand-600" />
              حساب مسؤول النظام المعتمد:
            </span>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="rounded-lg bg-ds-brand-600 px-2.5 py-1 font-bold text-white transition hover:bg-ds-brand-700 active:scale-95"
            >
              تعبئة تلقائية
            </button>
          </div>
          <p className="mt-1 text-ds-brand-800 dir-ltr font-mono text-[11px] text-right">
            hamid@hrhbs.com / HBS@Admin2026!
          </p>
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
  const verify = trpc.localAccess.verifyEmail.useMutation({
    onSuccess: async (data) => {
      if (data?.token) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.token}`);
          localStorage.setItem("manus-runtime-user-token", data.token);
        } catch {}
      }
      await utils.auth.me.refetch().catch(() => undefined);
    },
  });
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
  const utils = trpc.useUtils();
  const token = useToken();
  const activate = trpc.localAccess.activateInvitation.useMutation({
    onSuccess: async (data) => {
      if (data?.token) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.token}`);
          localStorage.setItem("manus-runtime-user-token", data.token);
        } catch {}
      }
      if (data?.user) {
        utils.auth.me.setData(undefined, data.user);
        try {
          localStorage.setItem("manus-runtime-user-info", JSON.stringify(data.user));
        } catch {}
      }
      await utils.auth.me.refetch().catch(() => undefined);
      setLocation("/app");
    },
  });
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
