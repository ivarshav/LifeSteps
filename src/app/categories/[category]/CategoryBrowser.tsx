"use client";

import { useMemo, useState } from "react";

import { StepCard } from "@/components/cards/StepCard";
import type { Category, Step } from "@/lib/schema";

type Filter = "all" | "published" | "soon" | "short";
type Sort = "catalog" | "tasks" | "duration";

function countTasks(step: Step): number {
  return step.sections.reduce(
    (total, section) => total + section.tasks.length,
    0,
  );
}

export function CategoryBrowser({
  category,
  steps,
}: {
  category: Category;
  steps: Step[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("catalog");

  const visible = useMemo(() => {
    const filtered = steps.filter((step) => {
      if (filter === "published") return step.status !== "coming-soon";
      if (filter === "soon") return step.status === "coming-soon";
      if (filter === "short")
        return countTasks(step) > 0 && countTasks(step) <= 15;
      return true;
    });
    if (sort === "tasks") {
      return [...filtered].sort((a, b) => countTasks(a) - countTasks(b));
    }
    if (sort === "duration") {
      return [...filtered].sort((a, b) =>
        (a.estimatedDuration ?? "").localeCompare(
          b.estimatedDuration ?? "",
          "he",
        ),
      );
    }
    return filtered;
  }, [filter, sort, steps]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          aria-label="סינון צעדים"
          className="flex flex-wrap gap-2"
          role="group"
        >
          {[
            ["all", "הכל"],
            ["published", "זמין עכשיו"],
            ["soon", "בקרוב"],
            ["short", "עד 15 משימות"],
          ].map(([value, label]) => (
            <button
              aria-pressed={filter === value}
              className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] transition-colors aria-pressed:border-[var(--brand-500)] aria-pressed:bg-[var(--brand-500)] aria-pressed:text-white"
              key={value}
              onClick={() => setFilter(value as Filter)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--gray-500)]">
          מיון:
          <select
            className="rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--surface)] px-3 py-2 text-[var(--gray-700)]"
            onChange={(event) => setSort(event.target.value as Sort)}
            value={sort}
          >
            <option value="catalog">סדר מומלץ</option>
            <option value="tasks">מספר משימות</option>
            <option value="duration">משך משוער</option>
          </select>
        </label>
      </div>
      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((step) => (
            <StepCard
              category={category}
              key={step.id}
              showCategory={false}
              step={step}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[var(--gray-100)] p-5 text-[var(--gray-600)]">
          אין צעדים שמתאימים לסינון הזה.
        </p>
      )}
    </>
  );
}
