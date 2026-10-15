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
    <Container className="max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "בית" }, { label: "אודות" }]} />
      <article className="py-4">
        <h1 className="text-3xl font-bold text-[var(--gray-900)]">
          למה צעדי חיים קיים
        </h1>
        <p className="mt-4 text-lg text-[var(--gray-600)]">
          בירוקרטיה ישראלית מפוזרת בין אתרים, טפסים ושיחות עם אנשים שכבר עברו את
          זה. צעדי חיים מרכז את התהליך לרשימה אחת, לפי סדר הגיוני.
        </p>
        <Card className="my-6 p-6">
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            לא רק מה לעשות — גם למה
          </h2>
          <p className="mt-2 text-[var(--gray-600)]">
            המטרה היא להיות החבר המנוסה שמסביר מה לשקול, מה קל לפספס ומה עושים
            כשהתהליך מסתבך. לצד כל צעד מופיעים מקורות ותאריך בדיקה כדי שאפשר
            יהיה לאמת מידע שהשתנה.
          </p>
        </Card>
        <h2 className="text-xl font-semibold text-[var(--gray-900)]">
          פרטיות כברירת מחדל
        </h2>
        <p className="mt-2 text-[var(--gray-600)]">
          אין חשבון ואין מסד נתונים. ההתקדמות נשמרת בדפדפן בלבד, ואפשר למחוק
          אותה בכל עת.
        </p>
      </article>
    </Container>
  );
}
