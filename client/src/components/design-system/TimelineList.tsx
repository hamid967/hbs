import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneOf, type DsTone } from "./tone";

export type TimelineEntry = {
  id: string | number;
  title: string;
  detail?: ReactNode;
  meta?: string;
  tone?: DsTone;
};

type TimelineListProps = { entries: TimelineEntry[]; className?: string };

/** الخط الزمني — سجل التدقيق ومسار الموافقات وتاريخ الطلب. */
export function TimelineList({ entries, className }: TimelineListProps) {
  return (
    <ol
      className={cn(
        "relative space-y-4 border-s border-ds-neutral-200 ps-5",
        className
      )}
    >
      {entries.map(entry => {
        const classes = toneOf(entry.tone ?? "brand");
        return (
          <li key={entry.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -start-[1.6rem] top-1.5 size-3 rounded-full border-2 border-ds-white",
                classes.solid
              )}
            />
            <p className="text-sm font-bold text-ds-neutral-950">
              {entry.title}
            </p>
            {entry.detail ? (
              <div className="mt-1 text-sm leading-6 text-ds-neutral-600">
                {entry.detail}
              </div>
            ) : null}
            {entry.meta ? (
              <p className="mt-1 text-xs text-ds-neutral-500">{entry.meta}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
