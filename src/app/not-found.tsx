/* eslint-disable @next/next/no-html-link-for-pages -- Full-page navigation avoids hydrating static exports. */

import { Container } from "@/components/layout/Container";
import { SearchBoxLink } from "@/components/search/SearchBoxLink";
import { getAllCategories } from "@/lib/content";

export default function NotFound() {
  const categories = getAllCategories().slice(0, 5);
  return (
    <Container className="py-16 text-center">
      <div aria-hidden="true" className="text-7xl">
        🧭
      </div>
      <h1 className="mt-4 text-3xl font-bold text-[var(--gray-900)]">
        אופס, הצעד הזה לא נמצא
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-[var(--gray-500)]">
        יכול להיות שהקישור שגוי, שהעמוד הוסר, או שהתוכן עדיין בדרך.
      </p>
      <SearchBoxLink />
      <p className="mt-6 text-sm text-[var(--gray-500)]">
        אולי התכוונתם לאחת הקטגוריות:
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <a
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] no-underline hover:border-[var(--brand-200)] hover:no-underline"
            href={`/categories/${category.id}`}
            key={category.id}
          >
            {category.emoji} {category.title}
          </a>
        ))}
      </div>
      <a
        className="mt-6 inline-flex rounded-[var(--radius-md)] bg-[var(--brand-500)] px-[18px] py-2.5 font-semibold text-white no-underline hover:bg-[var(--brand-600)] hover:no-underline"
        href="/"
      >
        חזרה לדף הבית
      </a>
    </Container>
  );
}
