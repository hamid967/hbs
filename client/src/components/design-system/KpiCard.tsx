import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: ReactNode;
  detail?: string;
  visual?: ReactNode;
};

export function KpiCard({ label, value, detail, visual }: KpiCardProps) {
  return (
    <section className="ds-surface ds-kpi-card" aria-label={label}>
      <div className="min-w-0">
        <p className="ds-kpi-label">{label}</p>
        <p className="ds-kpi-value">{value}</p>
        {detail ? <p className="ds-kpi-detail">{detail}</p> : null}
      </div>
      {visual ? <div className="shrink-0">{visual}</div> : null}
    </section>
  );
}
