import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** ترويسة الصفحة — العنصر الأول في كل صفحة داخل لوحة التحكم. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("ds-page-header", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="ds-eyebrow">{eyebrow}</p> : null}
        <h1 className="ds-page-title">{title}</h1>
        {description ? (
          <p className="ds-page-description">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
