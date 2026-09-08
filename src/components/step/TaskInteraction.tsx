"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { TaskCheckbox } from "./TaskCheckbox";

export function TaskInteraction({
  badges,
  children,
  hasDetails,
  taskId,
  title,
}: {
  badges: ReactNode;
  children: ReactNode;
  hasDetails: boolean;
  taskId: string;
  title: string;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const titleId = `task-${taskId}`;
  const detailsId = `${titleId}-details`;

  return (
    <article
      className="task-row relative border-block-start first:border-block-start-0 border-[var(--gray-100)] bg-[var(--surface)]"
      data-task-id={taskId}
    >
      <div className="flex min-h-16 items-start gap-3 p-4 pe-14">
        <TaskCheckbox taskId={taskId} titleId={titleId} />
        <span
          className="task-title min-w-0 flex-1 font-medium text-[var(--gray-800)] transition-[color,opacity,text-decoration-color]"
          id={titleId}
        >
          {title}
        </span>
        <span className="flex flex-wrap justify-end gap-1">{badges}</span>
      </div>
      {hasDetails ? (
        <details
          className="group"
          onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
        >
          <summary
            aria-controls={detailsId}
            aria-expanded={detailsOpen}
            aria-label={`פרטים נוספים על ${title}`}
            className="top-2 end-2 absolute z-10 grid size-11 cursor-pointer list-none place-items-center rounded-lg text-[var(--gray-500)] hover:bg-[var(--gray-100)] [&::-webkit-details-marker]:hidden"
          >
            <ChevronDown
              aria-hidden
              className="transition-transform duration-200 group-open:rotate-180"
              size={18}
            />
          </summary>
          <div
            className="animate-fade-in space-y-4 px-4 ps-[58px] pb-5 text-[.9375rem] text-[var(--gray-600)]"
            id={detailsId}
          >
            {children}
          </div>
        </details>
      ) : (
        <span
          aria-hidden="true"
          className="top-2 end-2 absolute size-11"
        />
      )}
    </article>
  );
}
