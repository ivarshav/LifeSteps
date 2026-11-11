import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "אודות",
  description:
    "צעדי חיים מסדר את אירועי החיים הגדולים לרשימות ברורות, מעשיות ומבוססות מקורות.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container measure="reading">
      <Breadcrumbs items={[{ href: "/", label: "בית" }, { label: "אודות" }]} />
      <article className="space-y-7 py-6 sm:py-8">
        <header className="space-y-4">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-[var(--gray-900)] sm:text-4xl">
            למה צעדי חיים קיים
          </h1>
          <p className="border-s-2 border-[var(--brand-500)] ps-4 text-lg leading-relaxed text-[var(--gray-600)]">
            בירוקרטיה ישראלית מפוזרת בין אתרים, טפסים ושיחות עם אנשים שכבר עברו
            את זה. צעדי חיים מרכז את התהליך לרשימה אחת, לפי סדר הגיוני.
          </p>
        </header>
        <Card className="space-y-3 p-6">
          <h2 className="text-xl leading-snug font-semibold text-[var(--gray-900)]">
            לא רק מה לעשות — גם למה
          </h2>
          <p className="text-[var(--gray-600)]">
            המטרה היא להיות החבר המנוסה שמסביר מה לשקול, מה קל לפספס ומה עושים
            כשהתהליך מסתבך. לצד כל צעד מופיעים מקורות ותאריך בדיקה כדי שאפשר
            יהיה לאמת מידע שהשתנה.
          </p>
        </Card>
        <section className="space-y-3 border-t border-[var(--gray-200)] pt-6">
          <h2 className="text-xl leading-snug font-semibold text-[var(--gray-900)]">
            פרטיות כברירת מחדל
          </h2>
          <p className="text-[var(--gray-600)]">
            אין חשבון ואין מסד נתונים. ההתקדמות נשמרת בדפדפן בלבד, ואפשר למחוק
            אותה בכל עת.
          </p>
        </section>
      </article>
    </Container>
  );
}
