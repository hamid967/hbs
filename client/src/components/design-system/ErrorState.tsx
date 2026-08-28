import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

type ErrorStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** حالة الخطأ — نفس هيكل الحالة الفارغة بنغمة الخطر ودور `alert`. */
export function ErrorState({
  title = "تعذّر تحميل البيانات",
  description,
  icon,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        tone="danger"
        title={title}
        description={description}
        icon={icon}
        action={action}
        className={className}
      />
    </div>
  );
}
