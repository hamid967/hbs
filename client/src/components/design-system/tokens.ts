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
  // brand: اللون الأساسي للعلامة — من أفتح سطح إلى أعمق حبر.
  "brand-50": "#f2f8f3",
  "brand-100": "#e7f3e9",
  "brand-200": "#d5e3d7",
  "brand-300": "#9dc7a8",
  "brand-400": "#5d8d70",
  "brand-500": "#4f8a63",
  "brand-600": "#347950",
  "brand-700": "#386f50",
  "brand-800": "#1f5b45",
  "brand-900": "#315440",
  "brand-950": "#174735",
  "brand-1000": "#173e30",
  // neutral: الرمادي المائل للأخضر: النصوص، الحدود، الأسطح المحايدة.
  "neutral-50": "#f8faf8",
  "neutral-100": "#edf1ed",
  "neutral-200": "#dfe9e1",
  "neutral-300": "#c8d4ce",
  "neutral-400": "#a3aea6",
  "neutral-500": "#89958d",
  "neutral-600": "#748178",
  "neutral-700": "#61756a",
  "neutral-800": "#52675a",
  "neutral-900": "#425449",
  "neutral-950": "#294535",
  // teal: تدرّج بارد تستخدمه لوحات التشغيل والصحة.
  "teal-500": "#637a77",
  "teal-600": "#526b69",
  "teal-700": "#27705e",
  "teal-900": "#0c4a42",
  // ink: أعمق درجات النص والخلفيات الداكنة.
  ink: "#092a28",
  "ink-strong": "#071a1a",
  // success: حالة النجاح.
  success: "#0a8060",
  "success-soft": "#e7f3eb",
  "success-border": "#cce5d2",
  // warning: حالة التحذير والدرجات الترابية المشتقة منها.
  warning: "#a46723",
  "warning-strong": "#7a5a2a",
  "warning-tan": "#7b684d",
  "warning-deep": "#5a4326",
  "warning-bright": "#c88d36",
  "warning-soft": "#fff0d9",
  "warning-border": "#f0dcb9",
  // danger: حالة الخطأ والرفض.
  danger: "#a94e48",
  "danger-muted": "#855a55",
  "danger-strong": "#6f332f",
  "danger-bright": "#c26342",
  "danger-soft": "#fdecea",
  "danger-border": "#f1d4d1",
  // info: حالة المعلومة المحايدة.
  info: "#446b98",
  "info-soft": "#e9eef8",
  "info-border": "#cbd8eb",
  // accent: ألوان التمييز البصري للواجهة الفاخرة.
  violet: "#7551a0",
  emerald: "#18b982",
  "emerald-bright": "#4bd6aa",
  "emerald-soft": "#7de0bd",
  gold: "#c8a66a",
  "gold-soft": "#e7c89c",
  ivory: "#f4f0e8",
  mist: "#b7d1d4",
  "mist-strong": "#9bc3bd",
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
