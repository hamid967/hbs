import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  /** محاذاة العمود — الافتراضي بداية السطر (يمين في RTL). */
  align?: "start" | "center" | "end";
  cell: (row: Row) => ReactNode;
  /** أخفِ العمود على الشاشات الصغيرة بدل قص الجدول. */
  hideOnMobile?: boolean;
};

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

const alignClasses = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const;

/**
 * جدول البيانات الموحّد — رأس ثابت النمط، تمرير أفقي آمن، وحالة فارغة مدمجة.
 * الجداول المكتوبة يدوياً كانت أكبر مصدر لاختلاف الحواف والألوان بين الصفحات.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  emptyTitle = "لا توجد سجلات",
  emptyDescription,
  className,
}: DataTableProps<Row>) {
  if (!rows.length)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-3xl border border-ds-neutral-200 bg-ds-white",
        className
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {caption ? (
          <caption className="px-5 pt-4 text-start text-xs font-bold text-ds-neutral-600">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-ds-neutral-200 bg-ds-neutral-50">
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-bold text-ds-neutral-700",
                  alignClasses[column.align ?? "start"],
                  column.hideOnMobile && "hidden md:table-cell"
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              className="border-b border-ds-neutral-100 last:border-b-0"
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-ds-neutral-800",
                    alignClasses[column.align ?? "start"],
                    column.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
