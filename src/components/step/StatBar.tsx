import type { Money, Step } from "@/lib/schema";

export function formatMoney(money: Money): string {
  const number = new Intl.NumberFormat("he-IL");
  const range =
    money.min === money.max
      ? number.format(money.min)
      : `${number.format(money.min)}–${number.format(money.max)}`;
  return `${range} ₪`;
}

export function StatBar({ step }: { step: Step }) {
  const taskCount = step.sections.reduce(
    (total, section) => total + section.tasks.length,
    0,
  );
  const stats = [
    ["משך משוער", step.estimatedDuration ?? "משתנה"],
    [
      "עלות משוערת",
      step.estimatedCost ? formatMoney(step.estimatedCost) : "משתנה",
    ],
    ["מספר משימות", taskCount.toLocaleString("he-IL")],
    ["רמת מורכבות", step.difficulty ? `${step.difficulty} מתוך 3` : "משתנה"],
  ];

  return (
    <dl className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(([label, value]) => (
        <div
          className="rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] p-4"
          key={label}
        >
          <dt className="text-xs font-semibold text-[var(--gray-500)]">
            {label}
          </dt>
          <dd className="mt-0.5 text-base font-bold text-[var(--gray-900)]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
