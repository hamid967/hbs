import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonListProps = {
  count?: number;
  height?: string;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
} as const;

/** الهيكل العظمي أثناء التحميل — بديل موحّد لتكرار `Skeleton` يدوياً. */
export function SkeletonList({
  count = 4,
  height = "h-32",
  columns = 2,
  className,
}: SkeletonListProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid gap-4", columnClasses[columns], className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className={cn(height, "rounded-3xl")} />
      ))}
    </div>
  );
}
