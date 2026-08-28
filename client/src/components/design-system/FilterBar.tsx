import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  children: ReactNode;
  actions?: ReactNode;
  label?: string;
  className?: string;
};

/** شريط الفلاتر والبحث أعلى القوائم — عنصر `search` صريح لقارئات الشاشة. */
export function FilterBar({
  children,
  actions,
  label = "تصفية النتائج",
  className,
}: FilterBarProps) {
  return (
    <search
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50 p-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {children}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </search>
  );
}
