"use client";

import { useMemo, useState } from "react";

import { StepCard } from "@/components/cards/StepCard";
import type { Category, Step } from "@/lib/schema";

type Filter = "all" | "short";
type Sort = "catalog" | "tasks" | "duration";

function countTasks(step: Step): number {
  return step.sections.reduce(
    (total, section) => total + section.tasks.length,
    0,
  );
}

const HEBREW_NUM = new Map<string, number>([
  ["חצי", 0.5],
  ["אחד", 1], ["אחת", 1],
  ["שניים", 2], ["שתי", 2], ["שני", 2],
  ["שלושה", 3], ["שלוש", 3],
  ["ארבעה", 4], ["ארבע", 4],
  ["חמישה", 5], ["חמש", 5],
  ["שישה", 6], ["שש", 6],
  ["שבעה", 7], ["שבע", 7],
  ["שמונה", 8],
  ["תשעה", 9], ["תשע", 9],
  ["עשרה", 10], ["עשר", 10],
]);

function durationHours(text: string): number {
  if (!text) return Infinity;
  let hours = 0;
  const s = text.replace(/[^א-ת\s]/g, " ");
  const tokens = s.split(/\s+/).filter(Boolean);
  let multiplier = 1;
  for (const t of tokens) {
    const num = HEBREW_NUM.get(t); if (num !== undefined) { multiplier = num; continue; }
    if (t === "שנייה" || t === "שניות") { hours += multiplier / 3600; multiplier = 1; }
    else if (t === "דקה" || t === "דקות") { hours += multiplier / 60; multiplier = 1; }
    else if (t === "שעה" || t === "שעות" || t === "שעתיים") { hours += multiplier * (t === "שעתיים" ? 2 : 1); multiplier = 1; }
    else if (t === "יום" || t === "ימים" || t === "יומיים" || t === "יממה" || t === "יממות") { hours += multiplier * 24; multiplier = 1; }
    else if (t === "שבוע" || t === "שבועות" || t === "שבועיים") { hours += multiplier * 168; multiplier = 1; }
    else if (t === "חודש" || t === "חודשים" || t === "חודשיים") { hours += multiplier * 720; multiplier = 1; }
    else if (t === "שנה" || t === "שנים" || t === "שנתיים") { hours += multiplier * 8760; multiplier = 1; }
    else multiplier = 1;
  }
  return hours || Infinity;
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
      if (filter === "short")
        return countTasks(step) > 0 && countTasks(step) <= 20;
      return true;
    });
    if (sort === "tasks") {
      return [...filtered].sort((a, b) => countTasks(a) - countTasks(b));
    }
    if (sort === "duration") {
      return [...filtered].sort(
        (a, b) =>
          durationHours(a.estimatedDuration ?? "") -
          durationHours(b.estimatedDuration ?? ""),
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
            ["short", "עד 20 משימות"],
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
