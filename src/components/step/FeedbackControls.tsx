"use client";

import { useEffect, useId, useState } from "react";

import {
  formatFeedbackIssue,
  getFeedbackDraft,
  getFeedbackIssueUrl,
  getTaskFeedback,
  MAX_FEEDBACK_LENGTH,
  saveFeedbackDraft,
  saveTaskFeedback,
  type TaskFeedback,
} from "@/lib/feedback";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LinkWithExternalIcon } from "@/components/layout/LinkWithExternalIcon";

import { useStepProgress } from "./ProgressContext";

export function TaskFeedbackControls({ taskId }: { taskId: string }) {
  const { stepId } = useStepProgress();
  const [value, setValue] = useState<TaskFeedback | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValue(getTaskFeedback(stepId, taskId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [stepId, taskId]);

  const selectFeedback = (nextValue: TaskFeedback) => {
    saveTaskFeedback(stepId, taskId, nextValue);
    setValue(nextValue);
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-[var(--gray-500)]">
      <span className="me-1">המשימה ברורה?</span>
      <button
        aria-pressed={value === "helpful"}
        className="min-h-11 rounded-lg px-2 hover:bg-[var(--brand-50)] aria-pressed:bg-[var(--brand-100)] aria-pressed:text-[var(--brand-700)]"
        onClick={() => selectFeedback("helpful")}
        type="button"
      >
        כן
      </button>
      <button
        aria-pressed={value === "not-helpful"}
        className="min-h-11 rounded-lg px-2 hover:bg-[var(--brand-50)] aria-pressed:bg-[var(--brand-100)] aria-pressed:text-[var(--brand-700)]"
        onClick={() => selectFeedback("not-helpful")}
        type="button"
      >
        לא
      </button>
    </div>
  );
}

export function StepFeedback({
  stepId,
  stepTitle,
}: {
  stepId: string;
  stepTitle: string;
}) {
  const textAreaId = useId();
  const [draft, setDraft] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft(getFeedbackDraft(stepId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [stepId]);

  const issue = formatFeedbackIssue({ draft, stepId, stepTitle });
  const canShare = draft.trim().length > 0;

  const updateDraft = (value: string) => {
    const nextDraft = value.slice(0, MAX_FEEDBACK_LENGTH);
    setDraft(nextDraft);
    saveFeedbackDraft(stepId, nextDraft);
  };

  const copyFeedback = async () => {
    try {
      await navigator.clipboard.writeText(`${issue.title}\n\n${issue.body}`);
      setCopyStatus("המשוב הועתק. הוא עדיין נשמר רק במכשיר הזה.");
    } catch {
      setCopyStatus("לא הצלחנו להעתיק. אפשר לבחור את הטקסט ולהעתיק ידנית.");
    }
  };

  const downloadFeedback = () => {
    const blob = new Blob([`${issue.title}\n\n${issue.body}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lifesteps-feedback-${stepId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="my-8 p-5">
      <h2 className="text-xl font-semibold text-[var(--gray-900)]">
        חסר משהו בצעד הזה?
      </h2>
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-[var(--gray-600)]">
        אפשר לנסח הצעה לשיפור או לצעד חסר. הטיוטה נשמרת רק בדפדפן ובמכשיר הזה,
        עד שתבחרו במפורש להעתיק, להוריד או לפתוח אותה ב-GitHub.
      </p>
      <p className="mt-2 text-sm text-[var(--gray-600)]">
        אל תכללו פרטים אישיים, מספרי זהות, כתובות או מידע רפואי/פיננסי.
      </p>
      <label
        className="mt-4 block font-medium text-[var(--gray-800)]"
        htmlFor={textAreaId}
      >
        מה כדאי להוסיף או לשפר?
      </label>
      <textarea
        className="mt-2 min-h-32 w-full rounded-[var(--radius-md)] border border-[var(--gray-300)] bg-[var(--surface)] p-3 text-base text-[var(--gray-900)] outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
        id={textAreaId}
        maxLength={MAX_FEEDBACK_LENGTH}
        aria-describedby={`${textAreaId}-hint`}
        onChange={(event) => updateDraft(event.target.value)}
        placeholder="לדוגמה: חסר קישור רשמי או משימה שכדאי להוסיף"
        value={draft}
      />
      <p
        className="mt-1 text-xs text-[var(--gray-500)]"
        id={`${textAreaId}-hint`}
      >
        {draft.length}/{MAX_FEEDBACK_LENGTH} תווים
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          disabled={!canShare}
          onClick={copyFeedback}
          size="sm"
          variant="secondary"
        >
          העתקת המשוב
        </Button>
        <Button
          disabled={!canShare}
          onClick={downloadFeedback}
          size="sm"
          variant="secondary"
        >
          הורדת קובץ טקסט
        </Button>
        {canShare ? (
          <Button asChild size="sm">
            <LinkWithExternalIcon href={getFeedbackIssueUrl(issue)}>
              פתיחת הצעה ב-GitHub
            </LinkWithExternalIcon>
          </Button>
        ) : (
          <Button disabled size="sm">
            פתיחת הצעה ב-GitHub
          </Button>
        )}
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-[var(--gray-600)]">
        {copyStatus ||
          "ב-GitHub תידרש התחברות ובדיקה של הטיוטה לפני שליחה. האתר לא שולח משוב בעצמו."}
      </p>
    </Card>
  );
}
