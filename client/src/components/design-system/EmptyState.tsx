import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: DsTone;
  className?: string;
};

/** الحالة الفارغة الموحّدة — «لا توجد بيانات بعد» بشكل واحد في كل الصفحات. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = "brand",
  className,
}: EmptyStateProps) {
  const classes = toneOf(tone);
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-3xl border border-ds-neutral-200 bg-ds-white px-6 py-10 text-center",
        className
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-3xl",
            classes.surface,
            classes.icon
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <h2 className="mt-5 font-bold text-ds-neutral-950">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-ds-neutral-600">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
