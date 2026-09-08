import type { Step } from "@/lib/schema";

export function StepHeader({ step }: { step: Step }) {
  const reviewed = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${step.lastReviewed}T00:00:00Z`));

  return (
    <header className="flex items-start gap-4">
      <span aria-hidden="true" className="text-[2.75rem] leading-none">
        {step.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-[2.125rem] leading-[1.25] font-bold text-[var(--gray-900)]">
          {step.title}
        </h1>
        <p className="mt-2 max-w-[72ch] text-[var(--gray-600)]">
          {step.summary}
        </p>
        <p className="mt-3 text-sm text-[var(--gray-500)]">
          עודכן לאחרונה: {reviewed} · <a href="#sources">מקורות ואסמכתאות</a>
        </p>
      </div>
    </header>
  );
}
