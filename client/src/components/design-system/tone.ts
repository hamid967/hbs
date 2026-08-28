import { dsColors } from "./tokens";

/**
 * النغمات الدلالية — الطبقة الوحيدة التي تحوّل «معنى» الحالة إلى ألوان.
 *
 * أي مكوّن يحتاج تلوين حالة يقرأ من هنا، فلا تتكرر خرائط الألوان في الصفحات.
 */
export const dsTones = [
  "neutral",
  "brand",
  "success",
  "warning",
  "danger",
  "info",
] as const;
export type DsTone = (typeof dsTones)[number];

type ToneClasses = {
  surface: string;
  border: string;
  text: string;
  icon: string;
  solid: string;
};

const toneClasses: Record<DsTone, ToneClasses> = {
  neutral: {
    surface: "bg-ds-neutral-100",
    border: "border-ds-neutral-200",
    text: "text-ds-neutral-700",
    icon: "text-ds-neutral-600",
    solid: "bg-ds-neutral-900 text-ds-white",
  },
  brand: {
    surface: "bg-ds-brand-100",
    border: "border-ds-brand-200",
    text: "text-ds-brand-800",
    icon: "text-ds-brand-600",
    solid: "bg-ds-brand-800 text-ds-white",
  },
  success: {
    surface: "bg-ds-success-soft",
    border: "border-ds-success-border",
    text: "text-ds-success",
    icon: "text-ds-success",
    solid: "bg-ds-success text-ds-white",
  },
  warning: {
    surface: "bg-ds-warning-soft",
    border: "border-ds-warning-border",
    text: "text-ds-warning",
    icon: "text-ds-warning",
    solid: "bg-ds-warning text-ds-white",
  },
  danger: {
    surface: "bg-ds-danger-soft",
    border: "border-ds-danger-border",
    text: "text-ds-danger",
    icon: "text-ds-danger",
    solid: "bg-ds-danger text-ds-white",
  },
  info: {
    surface: "bg-ds-info-soft",
    border: "border-ds-info-border",
    text: "text-ds-info",
    icon: "text-ds-info",
    solid: "bg-ds-info text-ds-white",
  },
};

export function toneOf(tone: DsTone = "neutral") {
  return toneClasses[tone];
}

/** يتحقق أن كل نغمة تشير إلى رموز موجودة فعلاً — يستخدمه الاختبار. */
export function toneTokenNames(tone: DsTone) {
  const classes = toneClasses[tone];
  return Object.values(classes)
    .flatMap(value => value.split(" "))
    .map(value => value.replace(/^(bg|text|border)-ds-/, ""))
    .filter(value => value in dsColors);
}
