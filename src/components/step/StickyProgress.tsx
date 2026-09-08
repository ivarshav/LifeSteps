"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button, ConfirmDialog, Pill, ProgressBar } from "@/components/ui";

import { useStepProgress } from "./ProgressContext";

export function StickyProgress({}: Record<string, never>) {
  const [confirming, setConfirming] = useState(false);
  const { done, reset, total } = useStepProgress();
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <>
      <div className="inset-block-start-[var(--hdr-h)] sticky z-50 mb-6 rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <strong aria-live="polite">
            השלמת {done.toLocaleString("he-IL")} מתוך{" "}
            {total.toLocaleString("he-IL")} משימות
          </strong>
          <div className="flex flex-wrap items-center gap-2">
            <Pill className="bg-[var(--accent-50)] text-[var(--accent-500)]">
              {pct}%
            </Pill>
            <Button
              className="min-h-11"
              onClick={() => setConfirming(true)}
              size="sm"
              variant="ghost"
            >
              <RotateCcw aria-hidden size={16} />
              אפס התקדמות
            </Button>
          </div>
        </div>
        <ProgressBar
          className="mt-3"
          label={`הושלמו ${done} מתוך ${total} משימות`}
          value={pct}
        />
      </div>
      <ConfirmDialog
        confirmLabel="כן, אפס הכל"
        description="כל הסימונים בצעד הזה יימחקו. לא ניתן לשחזר אותם."
        destructive
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          reset();
          setConfirming(false);
        }}
        open={confirming}
        title="לאפס את ההתקדמות בצעד הזה?"
      />
    </>
  );
}
