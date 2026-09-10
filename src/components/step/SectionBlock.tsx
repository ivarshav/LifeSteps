import type { Section } from "@/lib/schema";

import { SectionProgress } from "./SectionProgress";
import { TaskRow } from "./TaskRow";

export function SectionBlock({
  domIdPrefix,
  index,
  section,
}: {
  domIdPrefix?: string;
  index: number;
  section: Section;
}) {
  return (
    <section
      className="scroll-mt-36 py-5 [contain-intrinsic-size:auto_600px] [content-visibility:auto]"
      id={
        domIdPrefix
          ? `${domIdPrefix}-section-${section.id}`
          : `section-${section.id}`
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--gray-900)]">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-[var(--brand-50)] text-sm font-bold text-[var(--brand-600)]"
          >
            {index + 1}
          </span>
          {section.title}
        </h2>
        <SectionProgress taskIds={section.tasks.map((task) => task.id)} />
      </div>
      {section.description ? (
        <p className="mb-3 text-sm text-[var(--gray-500)]">
          {section.description}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gray-200)] shadow-[var(--shadow-sm)]">
        {section.tasks.map((task) => (
          <TaskRow domIdPrefix={domIdPrefix} key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
