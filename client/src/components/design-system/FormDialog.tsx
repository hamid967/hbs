import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionButton } from "./ActionButton";
import { cn } from "@/lib/utils";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  pending?: boolean;
  className?: string;
};

/** حوار نموذج موحّد: ترويسة، محتوى، وزرّا إلغاء/حفظ بترتيب RTL ثابت. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel = "حفظ",
  cancelLabel = "إلغاء",
  onSubmit,
  submitDisabled = false,
  pending = false,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className={cn("sm:max-w-xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="grid gap-4 py-3">{children}</div>
        <DialogFooter>
          <ActionButton intent="quiet" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </ActionButton>
          <ActionButton
            intent="primary"
            onClick={onSubmit}
            disabled={submitDisabled || pending}
          >
            {pending ? "جارٍ الحفظ…" : submitLabel}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
