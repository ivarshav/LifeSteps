"use client";

import type { Section } from "@/lib/schema";

import { useStepProgress } from "./ProgressContext";

export function Toc({ sections }: { sections: Section[] }) {
  const { completed } = useStepProgress();
  return (
    <nav aria-label="תוכן עניינים">
      <h2 className="mb-2 text-base font-semibold text-[var(--gray-900)]">
        תוכן עניינים
      </h2>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {sections.map((section) => {
          const done = section.tasks.filter((task) =>
            completed.has(task.id),
          ).length;
          return (
            <li key={section.id}>
              <a
                className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                href={`#section-${section.id}`}
              >
                <span>{section.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    done === section.tasks.length
                      ? "bg-[var(--accent-50)] text-[var(--accent-500)]"
                      : "bg-[var(--gray-100)] text-[var(--gray-500)]"
                  }`}
                >
                  {done}/{section.tasks.length}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
