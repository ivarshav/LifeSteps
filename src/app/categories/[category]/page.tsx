import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import {
  getAllCategories,
  getCategory,
  getStepsByCategory,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

import { CategoryBrowser } from "./CategoryBrowser";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = getCategory(categoryId);
  if (!category) return {};
  return pageMetadata({
    title: category.title,
    description: category.description,
    path: `/categories/${category.id}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: categoryId } = await params;
  const category = getCategory(categoryId);
  if (!category) notFound();
  const steps = getStepsByCategory(category.id);
  const publishedCount = steps.filter(
    (step) => step.status !== "coming-soon",
  ).length;

  return (
    <Container>
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: category.title }]}
      />
      <Card
        className="border-block-start-4 flex flex-wrap items-center gap-4 p-5"
        style={{ borderBlockStartColor: category.color }}
      >
        <span aria-hidden="true" className="text-4xl leading-none">
          {category.emoji}
        </span>
        <div className="min-w-56 flex-1">
          <h1 className="text-3xl font-bold text-[var(--gray-900)]">
            {category.title}
          </h1>
          <p className="mt-1 text-[var(--gray-500)]">{category.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill>{steps.length.toLocaleString("he-IL")} צעדים</Pill>
          <Pill>{publishedCount.toLocaleString("he-IL")} זמינים עכשיו</Pill>
        </div>
      </Card>
      <section className="py-8">
        <h2 className="sr-only">צעדים בקטגוריה</h2>
        <CategoryBrowser category={category} steps={steps} />
        <p className="mt-5 text-sm text-[var(--gray-500)]">
          לא מצאתם את מה שחיפשתם?{" "}
          <a href="/search">נסו חיפוש בכל הצעדים והמשימות</a>.
        </p>
      </section>
    </Container>
  );
}
