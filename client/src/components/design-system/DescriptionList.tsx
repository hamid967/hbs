import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DescriptionItem = { term: string; value: ReactNode };

type DescriptionListProps = {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

/** قائمة «مصطلح ← قيمة» — لتفاصيل الطلب والموظف والمنشأة. */
export function DescriptionList({
  items,
  columns = 2,
  className,
}: DescriptionListProps) {
  return (
    <dl className={cn("grid gap-4", columnClasses[columns], className)}>
      {items.map(item => (
        <div key={item.term} className="min-w-0">
          <dt className="text-xs font-bold text-ds-neutral-500">{item.term}</dt>
          <dd className="mt-1 text-sm font-bold text-ds-neutral-950">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
