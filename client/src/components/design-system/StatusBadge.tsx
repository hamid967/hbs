import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: DsTone;
  icon?: ReactNode;
  className?: string;
};

/** شارة حالة موحّدة — تستبدل شارات `rounded-full` المكتوبة يدوياً في الصفحات. */
export function StatusBadge({
  children,
  tone = "neutral",
  icon,
  className,
}: StatusBadgeProps) {
  const classes = toneOf(tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        classes.surface,
        classes.text,
        className
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex items-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
