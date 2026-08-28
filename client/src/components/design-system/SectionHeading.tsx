import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  level?: 2 | 3;
};

/** عنوان قسم داخل الصفحة — أصغر من PageHeader وأكثر تكراراً. */
export function SectionHeading({
  title,
  description,
  actions,
  className,
  level = 2,
}: SectionHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0">
        <Tag
          className={cn(
            "font-bold text-ds-neutral-950",
            level === 2 ? "text-lg" : "text-base"
          )}
        >
          {title}
        </Tag>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ds-neutral-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
