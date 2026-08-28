import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  /** `primary` الفعل الرئيسي، `secondary` فعل مساند، `quiet` فعل ثانوي، `destructive` فعل هدّام. */
  intent?: "primary" | "secondary" | "quiet" | "destructive";
};

const intents = {
  primary: "bg-ds-brand-800 text-ds-white hover:bg-ds-brand-950",
  secondary:
    "border border-ds-brand-200 bg-ds-white text-ds-brand-700 hover:bg-ds-brand-50",
  quiet: "bg-transparent text-ds-neutral-700 hover:bg-ds-neutral-100",
  destructive: "bg-ds-danger text-ds-white hover:bg-ds-danger-strong",
} as const;

/** زر الأفعال الموحّد — نية واحدة بدل تكرار ألوان الأزرار في كل صفحة. */
export function ActionButton({
  intent = "primary",
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("rounded-xl font-bold", intents[intent], className)}
      {...props}
    />
  );
}
