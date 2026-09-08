import { Card } from "@/components/ui/Card";
import type { Step } from "@/lib/schema";

export function RelatedSteps({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;
  return (
    <Card className="p-5">
      <h2 className="mb-2 text-base font-semibold text-[var(--gray-900)]">
        צעדים קשורים
      </h2>
      <ul className="m-0 list-none space-y-2 p-0">
        {steps.map((step) => (
          <li key={step.id}>
            <a
              className="flex items-center gap-2 text-sm"
              href={`/steps/${step.id}`}
            >
              <span aria-hidden="true">{step.emoji}</span>
              {step.shortTitle ?? step.title}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
