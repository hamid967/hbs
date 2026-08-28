import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

type StateNoticeProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: DsTone;
  className?: string;
};

/** لوحة حالة على مستوى الصفحة — تعذّر التحميل، صلاحية ناقصة، أو نطاق فارغ. */
export function StateNotice({
  title,
  description,
  action,
  tone,
  className,
}: StateNoticeProps) {
  const classes = tone ? toneOf(tone) : undefined;
  return (
    <section
      className={cn("ds-surface ds-state-notice", classes?.border, className)}
      role="status"
    >
      <h2 className={cn("text-base font-bold text-foreground", classes?.text)}>
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
