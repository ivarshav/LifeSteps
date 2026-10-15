import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";
import { getKofiUrl } from "@/lib/support";
import { LinkWithExternalIcon } from "@/components/layout/LinkWithExternalIcon";

export const metadata: Metadata = pageMetadata({
  title: "אודות",
  description:
    "צעדי חיים מסדר את אירועי החיים הגדולים לרשימות ברורות, מעשיות ומבוססות מקורות.",
  path: "/about",
});

export default function AboutPage() {
  const kofiUrl = getKofiUrl();

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
          אין צורך בחשבון. ההתקדמות והעדפת התצוגה נשמרות בדפדפן בלבד, ואפשר
          למחוק אותן דרך הגדרות הדפדפן.
        </p>
        {kofiUrl ? (
          <section className="mt-8 border-t border-[var(--gray-200)] pt-6">
            <h2 className="text-xl font-semibold text-[var(--gray-900)]">
              תמיכה בפרויקט
            </h2>
            <p className="mt-2 text-[var(--gray-600)]">
              השימוש בצעדי חיים נשאר חינם. אם האתר עזר לך, אפשר לתמוך בו באופן
              חד־פעמי דרך Ko-fi; התמיכה אינה פותחת תכונות או שירותים נוספים.
            </p>
            <LinkWithExternalIcon
              className="mt-3 font-semibold text-[var(--gray-900)] underline"
              href={kofiUrl}
            >
              לתמיכה בצעדי חיים ב-Ko-fi
            </LinkWithExternalIcon>
          </section>
        ) : null}
      </article>
    </Container>
  );
}
