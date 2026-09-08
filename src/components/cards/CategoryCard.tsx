import type { Category } from "@/lib/schema";

export function CategoryCard({
  category,
  stepCount,
}: {
  category: Category;
  stepCount: number;
}) {
  return (
    <a
      className="border-block-start-4 block rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-5 text-start text-inherit no-underline shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:no-underline hover:shadow-[var(--shadow-md)]"
      href={`/categories/${category.id}`}
      style={{ borderBlockStartColor: category.color }}
    >
      <span aria-hidden="true" className="mb-3 block text-3xl leading-none">
        {category.emoji}
      </span>
      <h3 className="text-lg font-semibold text-[var(--gray-900)]">
        {category.title}
      </h3>
      <p className="mt-1 text-sm text-[var(--gray-500)]">
        {category.description}
      </p>
      <div className="mt-3 text-xs font-bold" style={{ color: category.color }}>
        {stepCount.toLocaleString("he-IL")} צעדים ‹
      </div>
    </a>
  );
}
