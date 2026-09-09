"use client";

import { useState } from "react";

import {
  interestOptions,
  profileDefinition,
  profileFieldKeys,
  type LifeProfile,
} from "@/lib/profile";
import { Button, Card, ProgressBar } from "@/components/ui";

type Question = {
  key: (typeof profileFieldKeys)[number] | "interests";
  label: string;
};

const questions: readonly Question[] = [
  ...profileFieldKeys.map((key) => ({
    key,
    label: profileDefinition.fields[key].label,
  })),
  { key: "interests", label: "מה מעניין אתכם עכשיו?" },
];

export function ProfileForm({
  initialProfile,
  onCancel,
  onSave,
}: {
  initialProfile: LifeProfile;
  onCancel?: () => void;
  onSave: (profile: LifeProfile) => void;
}) {
  const [draft, setDraft] = useState<LifeProfile>(initialProfile);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const question = questions[questionIndex]!;
  const totalQuestions = questions.length;
  const progress = Math.round(
    ((showSummary ? totalQuestions + 1 : questionIndex + 1) /
      (totalQuestions + 1)) *
      100,
  );

  const next = () => {
    if (questionIndex === totalQuestions - 1) {
      setShowSummary(true);
    } else {
      setQuestionIndex((current) => current + 1);
    }
  };

  const previous = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (showSummary) onSave(draft);
        else next();
      }}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--brand-700)]">
            {showSummary
              ? "סיכום הבחירות"
              : `שאלה ${questionIndex + 1} מתוך ${totalQuestions}`}
          </span>
          <span className="text-[var(--gray-500)]">אפשר לדלג ולשנות בכל זמן</span>
        </div>
        <ProgressBar label="התקדמות בבניית המסלול" value={progress} />
      </div>

      {showSummary ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-[var(--gray-900)]">
              סיימנו לבחור
            </h3>
            <p className="mt-1 text-sm text-[var(--gray-600)]">
              נשתמש רק בבחירות האלה כדי להסביר אילו צעדים עשויים להתאים לכם.
            </p>
          </div>
          <Card className="divide-y divide-[var(--gray-100)] bg-[var(--gray-50)] p-0">
            {questions.map(({ key, label }) => {
              const values =
                key === "interests"
                  ? (draft.interests ?? []).map((value) =>
                      interestOptions.find((option) => option.value === value),
                    )
                  : [
                      profileDefinition.fields[key].options.find(
                        (option) => option.value === draft[key],
                      ),
                    ];
              return (
                <div className="grid gap-1 p-4 sm:grid-cols-2" key={key}>
                  <strong className="text-sm text-[var(--gray-800)]">{label}</strong>
                  <span className="text-sm text-[var(--gray-600)]">
                    {values
                      .filter((value): value is { label: string; value: string } =>
                        Boolean(value),
                      )
                      .map((value) => value.label)
                      .join(" · ") || "לא נבחר"}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      ) : question.key === "interests" ? (
        <fieldset>
          <legend className="text-xl font-semibold text-[var(--gray-900)]">
            {question.label}
          </legend>
          <p className="mt-1 text-sm text-[var(--gray-600)]">
            אפשר לבחור יותר מתחום אחד או לדלג.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {interestOptions.map((option) => {
              const checked = draft.interests?.includes(option.value) ?? false;
              return (
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--gray-200)] px-3 text-sm text-[var(--gray-700)] has-[:checked]:border-[var(--brand-500)] has-[:checked]:bg-[var(--brand-50)]"
                  key={option.value}
                >
                  <input
                    checked={checked}
                    onChange={() =>
                      setDraft((current) => {
                        const interests = new Set(current.interests ?? []);
                        if (interests.has(option.value)) interests.delete(option.value);
                        else interests.add(option.value);
                        return { ...current, interests: [...interests] };
                      })
                    }
                    type="checkbox"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <fieldset>
          <legend className="text-xl font-semibold text-[var(--gray-900)]">
            {question.label}
          </legend>
          <p className="mt-1 text-sm text-[var(--gray-600)]">
            הבחירה אופציונלית ומשמשת רק להתאמת סדר הצעדים.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {profileDefinition.fields[question.key].options.map((option) => {
              const checked = draft[question.key] === option.value;
              return (
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--gray-200)] px-3 text-sm text-[var(--gray-700)] has-[:checked]:border-[var(--brand-500)] has-[:checked]:bg-[var(--brand-50)]"
                  key={option.value}
                >
                  <input
                    checked={checked}
                    name={question.key}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        [question.key]: option.value,
                      }))
                    }
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="rounded-[var(--radius-sm)] bg-[var(--brand-50)] px-3 py-2 text-sm text-[var(--brand-700)]">
        🔒 התשובות נשמרות רק בדפדפן הזה באמצעות אחסון מקומי. לא נשמר שום
        מידע בשרת, אין צורך בהרשמה, ואפשר למחוק הכול בכל עת.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          disabled={!showSummary && questionIndex === 0}
          onClick={previous}
          variant="ghost"
        >
          הקודם
        </Button>
        <div className="flex flex-wrap gap-3">
          {!showSummary ? (
            <Button onClick={next} variant="ghost">
              דלג
            </Button>
          ) : null}
          {showSummary ? (
            <Button type="submit">הצג את המסלול שלי</Button>
          ) : (
            <Button type="submit">
              {questionIndex === totalQuestions - 1 ? "לסיכום" : "הבא"}
            </Button>
          )}
        </div>
      </div>
      {onCancel ? (
        <Button className="w-full" onClick={onCancel} variant="ghost">
          ביטול
        </Button>
      ) : null}
    </form>
  );
}
