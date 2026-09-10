import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "מדיניות פרטיות",
  description:
    "איך צעדי חיים שומר העדפות והתקדמות בדפדפן — בלי חשבון, בלי אנליטיקה ובלי שליחה לשרת.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "מדיניות פרטיות" }]}
      />
      <article className="space-y-5 py-4 text-[var(--gray-600)]">
        <h1 className="text-3xl font-bold text-[var(--gray-900)]">
          מדיניות פרטיות
        </h1>
        <p>
          צעדי חיים תוכנן כך שאפשר להשתמש בו בלי למסור שם, כתובת דוא&quot;ל או
          כל פרט מזהה. אין באתר חשבונות משתמשים ואין מסד נתונים של משתמשים.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מה נשמר בדפדפן
          </h2>
          <p className="mt-2">
            סימון משימות, סימון אם משימה היתה ברורה, וטיוטות משוב נשמרים ב־
            <bdi>localStorage</bdi>. הם נשארים במכשיר הזה בלבד. בגרסת ההתאמה
            האישית תישמר העדפה כללית בעוגייה בדפדפן.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מה לא קורה
          </h2>
          <p className="mt-2">
            ההתקדמות והמשוב אינם נשלחים לשרת. פתיחת טיוטה ב־<bdi>GitHub</bdi>
            היא פעולה יזומה בלבד, והשליחה הסופית מתבצעת שם לאחר התחברות. אין
            שירותי צד שלישי, ואין פרסום בגרסה זו. לכן גם אין מעקב בין אתרים או
            בין מכשירים.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מחיקה ושליטה
          </h2>
          <p className="mt-2">
            אפשר לאפס התקדמות מתוך כל צעד, או למחוק את נתוני האתר דרך הגדרות
            הדפדפן. מחיקה מקומית היא סופית מפני שאין עותק בשרת.
          </p>
        </section>
      </article>
    </Container>
  );
}
