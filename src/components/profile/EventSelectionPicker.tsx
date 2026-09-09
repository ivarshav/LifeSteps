"use client";

import { useMemo, useState } from "react";

import { Button, Modal } from "@/components/ui";
import type { Step } from "@/lib/schema";

export function EventSelectionPicker({
  selectedStepIds,
  steps,
  onSelectionChange,
}: {
  selectedStepIds: ReadonlySet<string>;
  steps: readonly Step[];
  onSelectionChange: (stepId: string, selected: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const visibleSteps = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("he-IL");
    return query
      ? steps.filter((step) =>
          step.title.toLocaleLowerCase("he-IL").includes(query),
        )
      : steps;
  }, [search, steps]);

  return (
    <section
      aria-labelledby="event-selection-title"
      className="mt-8 rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] p-5"
    >
      <h2
        className="text-xl font-semibold text-[var(--gray-900)]"
        id="event-selection-title"
      >
        נושא נוסף למסלול (אופציונלי)
      </h2>
      <p className="mt-1 text-sm text-[var(--gray-600)]">
        אפשר לבחור נושא שרוצים לראות במסלול, רק אם זה מתאים לכם.
      </p>
      <Button
        aria-haspopup="dialog"
        className="mt-4 min-h-11"
        onClick={() => setOpen(true)}
        variant="secondary"
      >
        בחירת נושא למסלול
      </Button>
      <p className="mt-4 text-sm text-[var(--gray-500)]">
        הבחירות נשמרות רק בדפדפן הזה. הן לא נשלחות לשרת, לא מתווספות לכתובת,
        ולא משתמשות בעוגיות או במדידה. אפשר להסיר כל בחירה בנפרד.
      </p>

      <Modal
        onClose={() => {
          setOpen(false);
          setSearch("");
        }}
        open={open}
        title="בחירת נושא למסלול"
      >
        <p className="text-sm text-[var(--gray-600)]">
          אפשר לבחור נושא שרוצים לראות במסלול. הבחירה אופציונלית, ואפשר לשנות
          אותה בכל זמן.
        </p>
        <label
          className="mt-5 block text-sm font-semibold text-[var(--gray-700)]"
          htmlFor="event-selection-search"
        >
          חיפוש נושא
        </label>
        <input
          className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--gray-300)] bg-[var(--surface)] px-3 text-[var(--gray-900)]"
          id="event-selection-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="הקלידו כדי לחפש"
          type="search"
          value={search}
        />
        <fieldset className="mt-4">
          <legend className="sr-only">נושאים לבחירה</legend>
          <div className="grid gap-2">
            {visibleSteps.map((step) => {
              const checked = selectedStepIds.has(step.id);
              return (
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--gray-200)] px-3 py-2 text-sm text-[var(--gray-700)] has-[:checked]:border-[var(--brand-500)] has-[:checked]:bg-[var(--brand-50)]"
                  key={step.id}
                >
                  <input
                    checked={checked}
                    onChange={(event) =>
                      onSelectionChange(step.id, event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="min-w-0 break-words">{step.title}</span>
                </label>
              );
            })}
          </div>
          {visibleSteps.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--gray-600)]" role="status">
              לא נמצאו נושאים מתאימים לחיפוש.
            </p>
          ) : null}
        </fieldset>
      </Modal>
    </section>
  );
}
