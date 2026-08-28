import { cn } from "@/lib/utils";

type LoadingStateProps = { label?: string; className?: string };

/** حالة التحميل النصية — تُستخدم حين لا يناسب الهيكل العظمي. */
export function LoadingState({
  label = "جارٍ التحميل…",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 text-center",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="size-9 animate-spin rounded-full border-4 border-ds-brand-200 border-t-ds-brand-800"
      />
      <p className="text-sm font-bold text-ds-brand-900">{label}</p>
    </div>
  );
}
