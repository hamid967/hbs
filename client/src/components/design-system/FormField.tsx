import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type FormFieldProps = {
  label: string;
  /**
   * مرّر دالة لتربط التسمية بعنصر الإدخال ربطاً صريحاً (`htmlFor`/`id`) —
   * وهو الشكل المفضّل. الشكل العادي (عنصر مباشر) مدعوم للتوافق مع الصفحات
   * القائمة، لكنه لا ينشئ ربطاً برمجياً بين التسمية والعنصر.
   */
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

/**
 * الحقل الموحّد: تسمية + عنصر إدخال + تلميح + خطأ.
 * يستبدل سبع نسخ مختلفة من دالة `Field` كانت مكرّرة يدوياً عبر الصفحات.
 */
export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  className,
}: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const isControlled = typeof children === "function";
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={isControlled ? id : undefined}
        className="mb-2 block text-xs font-bold text-ds-neutral-700"
      >
        {label}
        {required ? (
          <span className="ms-1 text-ds-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {isControlled
        ? children({
            id,
            "aria-describedby": describedBy,
            "aria-invalid": Boolean(error),
          })
        : children}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-xs font-bold text-ds-danger"
        >
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs leading-5 text-ds-neutral-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
