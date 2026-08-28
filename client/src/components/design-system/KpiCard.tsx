import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

type KpiCardProps = {
  label: string;
  value: ReactNode;
  detail?: string;
  visual?: ReactNode;
  tone?: DsTone;
  className?: string;
};

/** بطاقة مؤشر — الرقم الواحد الذي يتصدّر لوحات التحكم. */
export function KpiCard({
  label,
  value,
  detail,
  visual,
  tone,
  className,
}: KpiCardProps) {
  const classes = tone ? toneOf(tone) : undefined;
  return (
    <section
      className={cn("ds-surface ds-kpi-card", className)}
      aria-label={label}
    >
      <div className="min-w-0">
        <p className="ds-kpi-label">{label}</p>
        <p className={cn("ds-kpi-value", classes?.text)}>{value}</p>
        {detail ? <p className="ds-kpi-detail">{detail}</p> : null}
      </div>
      {visual ? (
        <div className={cn("shrink-0", classes?.icon)}>{visual}</div>
      ) : null}
    </section>
  );
}
