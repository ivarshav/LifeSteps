"use client";

import { useEffect, useMemo, useState } from "react";

import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { EventSelectionPicker } from "@/components/profile/EventSelectionPicker";
import { Button, Card, Chip, ProgressBar, useToast } from "@/components/ui";
import {
  readEventSelections,
  saveEventSelections,
} from "@/lib/event-selections";
import {
  clearProfile,
  getProfileValueLabel,
  isProfileEmpty,
  profileFieldKeys,
  readProfile,
  saveProfile,
  type LifeProfile,
} from "@/lib/profile";
import { getProgress } from "@/lib/progress";
import { getRecommendations, type PathItem } from "@/lib/recommendations";
import type { Step } from "@/lib/schema";

function completionByStep(
  steps: readonly Step[],
): ReadonlyMap<string, ReadonlySet<string>> {
  return new Map(steps.map((step) => [step.id, getProgress(step.id)]));
}

function RecommendationCard({ recommendation }: { recommendation: PathItem }) {
  const { step, completion } = recommendation;
  const percentage =
    completion.total === 0
      ? 0
      : Math.round((completion.done / completion.total) * 100);
  return (
    <Card className="flex min-w-0 flex-col gap-3 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-50)] text-xl"
        >
          {step.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold break-words text-[var(--gray-900)]">
            {step.title}
          </h2>
          <p className="mt-1 text-sm break-words text-[var(--gray-500)]">
            {step.summary}
          </p>
        </div>
      </div>
      {recommendation.kind !== "discovery" ? (
        <p className="rounded-[var(--radius-sm)] bg-[var(--brand-50)] px-3 py-2 text-sm text-[var(--brand-700)]">
          <strong>
            {recommendation.kind === "recommended"
              ? "למה ההצעה מוצגת?"
              : "בתהליך"}
          </strong>{" "}
          {recommendation.explanation}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <div className="flex justify-between gap-3 text-sm text-[var(--gray-600)]">
          <span>התקדמות</span>
          <span>{percentage}%</span>
        </div>
        <ProgressBar
          label={`התקדמות בצעד: ${percentage}%`}
          value={percentage}
        />
      </div>
      <Button asChild className="self-start">
        <a href={`/steps/${step.id}`}>
          {percentage > 0 && percentage < 100 ? "להמשיך בצעד" : "לפתוח את הצעד"}
        </a>
      </Button>
    </Card>
  );
}

export function MyPathExperience({ steps }: { steps: Step[] }) {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<LifeProfile>({});
  const [completedByStep, setCompletedByStep] = useState<
    ReadonlyMap<string, ReadonlySet<string>>
  >(new Map());
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eventSelectionStepIds, setEventSelectionStepIds] = useState<
    ReadonlySet<string>
  >(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(readProfile());
      setCompletedByStep(completionByStep(steps));
      setEventSelectionStepIds(new Set(readEventSelections(steps)));
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [steps]);

  const recommendations = useMemo(
    () =>
      getRecommendations({
        completedByStep,
        eventSelectionStepIds,
        profile,
        steps,
      }),
    [completedByStep, eventSelectionStepIds, profile, steps],
  );
  const profileChips = [
    ...profileFieldKeys.flatMap((key) =>
      profile[key]
        ? [{ key, label: getProfileValueLabel(key, profile[key]) }]
        : [],
    ),
    ...(profile.interests ?? []).map((value) => ({
      key: "interests" as const,
      label: getProfileValueLabel("interests", value),
      value,
    })),
  ];
  const totals = recommendations.reduce(
    (result, item) => {
      result.steps += 1;
      result.started +=
        item.completion.done > 0 && item.completion.done < item.completion.total
          ? 1
          : 0;
      result.completed +=
        item.completion.total > 0 &&
        item.completion.done === item.completion.total
          ? 1
          : 0;
      result.tasks += item.completion.done;
      return result;
    },
    { completed: 0, started: 0, steps: 0, tasks: 0 },
  );

  if (!loaded) return <div aria-busy="true" />;

  const noProfile = isProfileEmpty(profile);
  const explicitEventSteps = steps.filter(
    (step) =>
      step.status !== "coming-soon" &&
      step.recommendationEligibility.kind === "explicit-event",
  );
  const recommended = recommendations.filter(
    (item) => item.kind === "recommended",
  );
  const inProgress = recommendations.filter(
    (item) => item.kind === "in-progress",
  );
  const later = recommendations.filter((item) => item.kind === "discovery");

  const removeProfileValue = (key: keyof LifeProfile, value?: string) => {
    const updated =
      key === "interests"
        ? {
            ...profile,
            interests: (profile.interests ?? []).filter(
              (interest) => interest !== value,
            ),
          }
        : { ...profile, [key]: undefined };
    saveProfile(updated);
    setProfile(updated);
    showToast("הבחירה הוסרה מהמסלול.");
  };

  const updateEventSelection = (stepId: string, selected: boolean) => {
    const updated = new Set(eventSelectionStepIds);
    if (selected) updated.add(stepId);
    else updated.delete(stepId);
    const persisted = saveEventSelections([...updated], steps);
    setEventSelectionStepIds(updated);
    showToast(
      persisted
        ? selected
          ? "הנושא נוסף למסלול."
          : "הנושא הוסר מהמסלול."
        : "הבחירה עודכנה לביקור הזה, אך הדפדפן לא אפשר לשמור אותה.",
      { icon: persisted ? "✓" : "!" },
    );
  };

  return (
    <>
      <Card className="border-[var(--brand-100)] bg-[linear-gradient(100deg,var(--brand-50),var(--accent-50))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-[var(--gray-900)]">
              המסלול שלי
            </h1>
            <p className="mt-2 max-w-[65ch] text-[var(--gray-600)]">
              כל הצעדים פתוחים לעיון. אפשר לשמור העדפות כלליות או לבחור נושא
              מסוים שרוצים לטפל בו, רק בדפדפן הזה.
            </p>
            {!noProfile && profileChips.length > 0 ? (
              <div
                aria-label="הבחירות שלכם"
                className="mt-4 flex flex-wrap gap-2"
              >
                {profileChips.map((chip) => {
                  return (
                    <Chip
                      key={`${chip.key}-${chip.label}`}
                      onRemove={() =>
                        removeProfileValue(
                          chip.key,
                          chip.key === "interests" ? chip.value : undefined,
                        )
                      }
                      removeLabel={`הסרת ${chip.label}`}
                    >
                      {chip.label}
                    </Chip>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setEditing(true)}>
              {noProfile ? "בניית מסלול" : "עדכון הבחירות"}
            </Button>
            {!noProfile ? (
              <Button
                onClick={() => {
                  clearProfile();
                  setProfile({});
                  showToast("הבחירות נמחקו. ההתקדמות בצעדים נשמרה.");
                }}
                variant="ghost"
              >
                מחיקת הבחירות
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {explicitEventSteps.length > 0 ? (
        <EventSelectionPicker
          onSelectionChange={updateEventSelection}
          selectedStepIds={eventSelectionStepIds}
          steps={explicitEventSteps}
        />
      ) : null}

      {eventSelectionStepIds.size > 0 ? (
        <section aria-labelledby="selected-events" className="mt-5">
          <h2
            className="text-lg font-semibold text-[var(--gray-900)]"
            id="selected-events"
          >
            נושאים שבחרתם
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {explicitEventSteps
              .filter((step) => eventSelectionStepIds.has(step.id))
              .map((step) => (
                <Chip
                  key={step.id}
                  onRemove={() => updateEventSelection(step.id, false)}
                  removeLabel={`הסרת הנושא ${step.title} מהמסלול`}
                >
                  {step.title}
                </Chip>
              ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="path-progress" className="mt-8">
        <h2
          className="text-xl font-semibold text-[var(--gray-900)]"
          id="path-progress"
        >
          תמונת מצב
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <strong className="text-2xl">{totals.tasks}</strong>
            <p className="text-sm text-[var(--gray-600)]">משימות שהושלמו</p>
          </Card>
          <Card className="p-4">
            <strong className="text-2xl">{totals.started}</strong>
            <p className="text-sm text-[var(--gray-600)]">צעדים בתהליך</p>
          </Card>
          <Card className="p-4">
            <strong className="text-2xl">{totals.completed}</strong>
            <p className="text-sm text-[var(--gray-600)]">צעדים שהושלמו</p>
          </Card>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section aria-labelledby="path-recommendations" className="mt-8">
          <h2
            className="text-xl font-semibold text-[var(--gray-900)]"
            id="path-recommendations"
          >
            מומלץ עבורך
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            לכל צעד מופיעה סיבה המבוססת על בחירה כללית או על נושא שבחרתם.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {recommended.map((item) => (
              <RecommendationCard key={item.step.id} recommendation={item} />
            ))}
          </div>
        </section>
      ) : null}

      {inProgress.length > 0 ? (
        <section aria-labelledby="path-in-progress" className="mt-8">
          <h2
            className="text-xl font-semibold text-[var(--gray-900)]"
            id="path-in-progress"
          >
            בתהליך
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            צעדים שהתחלתם בדפדפן הזה ועדיין לא הסתיימו.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {inProgress.map((item) => (
              <RecommendationCard key={item.step.id} recommendation={item} />
            ))}
          </div>
        </section>
      ) : null}

      {later.length > 0 ? (
        <section aria-labelledby="path-later" className="mt-8">
          <h2
            className="text-xl font-semibold text-[var(--gray-900)]"
            id="path-later"
          >
            צעדים נוספים לעיון
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-500)]">
            {noProfile && eventSelectionStepIds.size === 0
              ? "אפשר לעיין בצעדים, לחפש באתר, או לבחור העדפות כלליות בכל זמן."
              : "צעדים נוספים שאפשר לעיין בהם."}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {later.map((item) => (
              <RecommendationCard key={item.step.id} recommendation={item} />
            ))}
          </div>
        </section>
      ) : null}

      <ProfileDialog
        initialProfile={profile}
        onClose={() => setEditing(false)}
        onSaved={setProfile}
        open={editing}
      />
    </>
  );
}
