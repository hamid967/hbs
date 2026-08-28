import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** شبكة المؤشرات أعلى الصفحات — تحيط بـ`KpiCard` بتباعد موحّد. */
export function MetricGrid({
  children,
  columns = 4,
  className,
}: MetricGridProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
