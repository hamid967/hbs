import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** `panel` سطح رئيسي بحواف كبيرة، `inset` سطح داخلي هادئ، `plain` بلا حشو. */
  variant?: "panel" | "inset" | "plain";
  padded?: boolean;
  "aria-label"?: string;
};

const variants = {
  panel: "rounded-3xl border border-ds-neutral-200 bg-ds-white shadow-sm",
  inset: "rounded-2xl border border-ds-neutral-100 bg-ds-neutral-50",
  plain: "rounded-2xl",
} as const;

/** السطح الأساسي لكل بطاقة ولوحة في النظام. */
export function Surface({
  as: Tag = "section",
  children,
  className,
  variant = "panel",
  padded = true,
  ...rest
}: SurfaceProps) {
  return (
    <Tag
      className={cn(variants[variant], padded && "p-5", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
