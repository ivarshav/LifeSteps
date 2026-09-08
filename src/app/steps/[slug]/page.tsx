import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Disclaimer } from "@/components/step/Disclaimer";
import { StatBar } from "@/components/step/StatBar";
import { StepExperience } from "@/components/step/StepExperience";
import { StepHeader } from "@/components/step/StepHeader";
import { Card } from "@/components/ui/Card";
import { getAllSteps, getCategory, getStep } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSteps().map((step) => ({ slug: step.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const step = getStep(slug);
  if (!step) return {};
  return pageMetadata({
    title: step.title,
    description: step.summary,
    path: `/steps/${step.id}`,
  });
}

function durationToIso(duration?: string): string {
  if (!duration) return "P1D";
  if (duration.includes("חודש")) return "P1M";
  if (duration.includes("שבוע")) return "P2W";
  if (duration.includes("יום") || duration.includes("ימים")) return "P7D";
  if (duration.includes("שעה") || duration.includes("שעות")) return "PT4H";
  return "P1D";
}

export default async function StepPage({ params }: Props) {
  const { slug } = await params;
  const step = getStep(slug);
  if (!step) notFound();
  const category = getCategory(step.categoryId);
  if (!category) notFound();
  const related = (step.relatedStepIds ?? [])
    .map((id) => getStep(id))
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: step.title,
    description: step.summary,
    totalTime: durationToIso(step.estimatedDuration),
    ...(step.estimatedCost
      ? {
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: step.estimatedCost.currency,
            value: step.estimatedCost.max,
          },
        }
      : {}),
    step: step.sections.map((section) => ({
      "@type": "HowToSection",
      name: section.title,
      itemListElement: section.tasks.map((task, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: task.title,
        text: task.details ?? task.title,
        url: `${absoluteUrl(`/steps/${step.id}`)}#section-${section.id}`,
      })),
    })),
  };

  return (
    <Container>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howTo).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "בית" },
          {
            href: `/categories/${category.id}`,
            label: category.title,
          },
          { label: step.shortTitle ?? step.title },
        ]}
      />
      <StepHeader step={step} />
      <StatBar step={step} />
      {step.status === "coming-soon" ? (
        <>
          <Card className="my-6 p-6">
            <h2 className="text-xl font-semibold text-[var(--gray-900)]">
              התוכן המלא בהכנה
            </h2>
            <p className="mt-2 max-w-[70ch] text-[var(--gray-600)]">
              הצעד כבר נמצא במפת התוכן שלנו, אבל הרשימה המלאה עדיין עוברת מחקר
              ובדיקה. בינתיים אפשר לחזור לקטגוריה ולבחור צעד זמין אחר.
            </p>
            <a
              className="mt-4 inline-flex rounded-[var(--radius-md)] bg-[var(--brand-500)] px-[18px] py-2.5 font-semibold text-white no-underline hover:bg-[var(--brand-600)] hover:no-underline"
              href={`/categories/${category.id}`}
            >
              חזרה ל{category.title}
            </a>
          </Card>
          <Disclaimer>{step.disclaimer}</Disclaimer>
        </>
      ) : (
        <StepExperience relatedSteps={related} step={step} />
      )}
    </Container>
  );
}
