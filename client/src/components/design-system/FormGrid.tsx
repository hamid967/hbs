import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

/** شبكة النماذج — تباعد واحد لكل النماذج بدل `grid gap-4 sm:grid-cols-2` المكرّرة. */
export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
