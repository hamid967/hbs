import type { ReactNode } from "react";

type StateNoticeProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function StateNotice({ title, description, action }: StateNoticeProps) {
  return (
    <section className="ds-surface ds-state-notice" role="status">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
