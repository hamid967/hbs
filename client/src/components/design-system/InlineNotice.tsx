import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

type InlineNoticeProps = {
  children: ReactNode;
  tone?: DsTone;
  title?: string;
  icon?: ReactNode;
  className?: string;
};

/** تنبيه داخل السياق — للرسائل القصيرة أعلى نموذج أو داخل بطاقة. */
export function InlineNotice({
  children,
  tone = "info",
  title,
  icon,
  className,
}: InlineNoticeProps) {
  const classes = toneOf(tone);
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border p-4",
        classes.surface,
        classes.border,
        className
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn("mt-0.5 shrink-0", classes.icon)}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 text-sm leading-6 text-ds-neutral-800">
        {title ? (
          <p className={cn("mb-1 font-bold", classes.text)}>{title}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
