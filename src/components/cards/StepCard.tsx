import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { Category, Step } from "@/lib/schema";

export function StepCard({
  className,
  category,
  showCategory = true,
  step,
}: {
  className?: string;
  category?: Category;
  showCategory?: boolean;
  step: Step;
}) {
  const comingSoon = step.status === "coming-soon";
  const taskCount = step.sections.reduce(
    (total, section) => total + section.tasks.length,
    0,
  );

  return (
    <a
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-4 text-start text-inherit no-underline shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--gray-300)] hover:no-underline hover:shadow-[var(--shadow-md)]",
        comingSoon && "opacity-65 saturate-50",
        className,
      )}
      href={`/steps/${step.id}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-[42px] shrink-0 place-items-center rounded-[var(--radius-md)] text-xl"
          style={{ backgroundColor: `${category?.color ?? "#3B6FF5"}1F` }}
        >
          {step.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--gray-900)]">{step.title}</h3>
          {showCategory && category ? (
            <div
              className="text-xs font-semibold"
              style={{ color: category.color }}
            >
              {category.title}
            </div>
          ) : null}
        </div>
        {comingSoon ? <Pill>בקרוב</Pill> : null}
      </div>
      <p className="text-sm leading-[1.5] text-[var(--gray-500)]">
        {step.summary}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {step.estimatedDuration ? (
          <Pill className="max-w-full text-start whitespace-normal">
            ⏱ {step.estimatedDuration}
          </Pill>
        ) : null}
        <Pill>{taskCount.toLocaleString("he-IL")} משימות</Pill>
        {step.difficulty ? <Pill>מורכבות {step.difficulty}/3</Pill> : null}
      </div>
    </a>
  );
}
