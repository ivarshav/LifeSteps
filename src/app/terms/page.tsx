import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "תנאי שימוש",
  description: "תנאי השימוש בצעדי חיים והבהרה לגבי מידע כללי, מקורות ועדכניות.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "תנאי שימוש" }]}
      />
      <article className="space-y-5 py-4 text-[var(--gray-600)]">
        <h1 className="text-3xl font-bold text-[var(--gray-900)]">
          תנאי שימוש
        </h1>
        <p>
          השימוש באתר הוא באחריות המשתמשים. התוכן נועד לסדר ולהסביר תהליכים
          ואינו תחליף לייעוץ משפטי, רפואי או פיננסי המותאם למקרה אישי.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            עדכניות ואימות
          </h2>
          <p className="mt-2">
            נהלים, אגרות, סכומים ומועדים עשויים להשתנות. בכל צעד מופיעים תאריך
            הבדיקה האחרונה וקישורים למקורות. לפני פעולה מחייבת יש לאמת את הפרטים
            מול הגוף הרשמי.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            קישורים חיצוניים
          </h2>
          <p className="mt-2">
            קישורים לאתרים ממשלתיים וגופים אחרים ניתנים לצורך נוחות ואימות.
            האחריות לתוכן ולזמינות של אותם אתרים היא של מפעיליהם.
          </p>
        </section>
      </article>
    </Container>
  );
}
