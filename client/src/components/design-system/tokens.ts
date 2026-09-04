/**
 * رموز التصميم الموحّدة لمنصة HBS — المصدر الوحيد للحقيقة.
 *
 * كل لون في الواجهة يجب أن يأتي من هنا. تغيير قيمة واحدة هنا يغيّر شكل
 * النظام كله، لأن الصفحات تستهلك هذه الرموز عبر أصناف Tailwind مثل
 * `text-ds-ink` و`bg-ds-brand-800` و`border-ds-neutral-200`.
 *
 * القيم هنا مطابقة حرفياً لمتغيّرات `--color-ds-*` في `client/src/index.css`،
 * ويتحقق `designTokens.test.ts` من عدم انحراف الملفين عن بعضهما.
 */

export const dsColors = {
  // brand: تدرّجات الأزرق الملكي الراقي (Royal & Electric Blue)
  "brand-50": "#eff6ff",
  "brand-100": "#dbeafe",
  "brand-200": "#bfdbfe",
  "brand-300": "#93c5fd",
  "brand-400": "#60a5fa",
  "brand-500": "#3b82f6",
  "brand-600": "#2563eb",
  "brand-700": "#1d4ed8",
  "brand-800": "#1e40af",
  "brand-900": "#1e3a8a",
  "brand-950": "#0f172a",
  "brand-1000": "#020617",
  // neutral: التدرج الرمادي المحايد النقي والأسود والأبيض
  "neutral-50": "#f8fafc",
  "neutral-100": "#f1f5f9",
  "neutral-200": "#e2e8f0",
  "neutral-300": "#cbd5e1",
  "neutral-400": "#94a3b8",
  "neutral-500": "#64748b",
  "neutral-600": "#475569",
  "neutral-700": "#334155",
  "neutral-800": "#1e293b",
  "neutral-900": "#0f172a",
  "neutral-950": "#020617",
  // teal: تدرّج الأزرق السماوي/السيان للعمليات والرواتب وحماية الأجور
  "teal-500": "#0ea5e9",
  "teal-600": "#0284c7",
  "teal-700": "#0369a1",
  "teal-900": "#0c4a6e",
  // ink: أعمق درجات النص والخلفيات الداكنة (الأسود الكحلي الصافي)
  ink: "#090d16",
  "ink-strong": "#020617",
  // success: حالة النجاح (الزمردي النقي)
  success: "#10b981",
  "success-soft": "#ecfdf5",
  "success-border": "#a7f3d0",
  // warning: حالة التحذير والانتظار (العنبر الدافئ)
  warning: "#f59e0b",
  "warning-strong": "#d97706",
  "warning-tan": "#b45309",
  "warning-deep": "#78350f",
  "warning-bright": "#fbbf24",
  "warning-soft": "#fffbeb",
  "warning-border": "#fde68a",
  // danger: حالة الخطأ والرفض (الأحمر الصريح)
  danger: "#ef4444",
  "danger-muted": "#991b1b",
  "danger-strong": "#b91c1c",
  "danger-bright": "#f87171",
  "danger-soft": "#fef2f2",
  "danger-border": "#fecaca",
  // info: حالة المعلومة والخدمات الحكومية (الأزرق الصافي)
  info: "#2563eb",
  "info-soft": "#eff6ff",
  "info-border": "#bfdbfe",
  // accent: ألوان التمييز البصري للواجهة
  violet: "#2563eb",
  emerald: "#10b981",
  "emerald-bright": "#34d399",
  "emerald-soft": "#6ee7b7",
  gold: "#f59e0b",
  "gold-soft": "#fef08a",
  ivory: "#f8fafc",
  mist: "#e2e8f0",
  "mist-strong": "#cbd5e1",
  white: "#ffffff",
} as const;

export type DsColorToken = keyof typeof dsColors;

/** المسافات — سلّم واحد يستخدمه كل مكوّن بدل الأرقام المتناثرة. */
export const dsSpacing = {
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
} as const;

/** أنصاف الأقطار — الواجهة تعتمد حواف كبيرة، وهذه هي الدرجات المعتمدة. */
export const dsRadii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  pill: "999px",
} as const;

/** الخطوط — عربي أولاً مع بدائل نظامية. */
export const dsTypography = {
  fontFamily: '"IBM Plex Sans Arabic", "Tajawal", system-ui, sans-serif',
  size: {
    xs: "0.75rem",
    sm: "0.8125rem",
    base: "0.875rem",
    md: "0.9375rem",
    lg: "1.125rem",
    xl: "1.5rem",
    display: "1.875rem",
  },
  weight: { regular: "400", medium: "500", bold: "700", heavy: "800" },
  leading: { tight: "1.2", normal: "1.6", relaxed: "1.75", loose: "1.85" },
} as const;

/** الظلال — درجتان فقط، لتفادي تفاوت العمق بين الصفحات. */
export const dsShadows = {
  soft: "0 1px 2px rgb(9 42 40 / 0.06)",
  raised: "0 12px 30px rgb(9 42 40 / 0.10)",
} as const;

export const designTokens = {
  colors: dsColors,
  spacing: dsSpacing,
  radii: dsRadii,
  typography: dsTypography,
  shadows: dsShadows,
} as const;
