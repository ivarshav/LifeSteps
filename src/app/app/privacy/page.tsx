import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

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
    <Container measure="reading">
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "מדיניות פרטיות" }]}
      />
      <article className="space-y-7 py-6 text-[var(--gray-600)] sm:py-8">
        <header className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-[var(--brand-600)]">
              <ShieldCheck
                aria-hidden="true"
                className="size-6"
                strokeWidth={1.75}
              />
            </span>
            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-[var(--gray-900)] sm:text-4xl">
              מדיניות פרטיות
            </h1>
          </div>
          <p className="text-lg leading-relaxed">
            צעדי חיים תוכנן כך שאפשר להשתמש בו בלי למסור שם, כתובת דוא&quot;ל או
            כל פרט מזהה. אין באתר חשבונות משתמשים ואין מסד נתונים של משתמשים.
          </p>
        </header>
        <nav
          aria-label="ניווט במסמך"
          className="flex flex-wrap gap-2 border-b border-[var(--gray-200)] pb-6"
        >
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--gray-100)] px-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)]"
            href="#browser-storage"
          >
            מה נשמר בדפדפן
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--gray-100)] px-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)]"
            href="#not-collected"
          >
            מה לא קורה
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--gray-100)] px-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)]"
            href="#control"
          >
            מחיקה ושליטה
          </a>
        </nav>
        <section
          aria-labelledby="browser-storage-title"
          className="scroll-mt-24 space-y-3 rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-5 sm:p-6"
          id="browser-storage"
          tabIndex={-1}
        >
          <h2
            className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
            id="browser-storage-title"
          >
            מה נשמר בדפדפן
          </h2>
          <p>
            סימון משימות, סימון אם משימה היתה ברורה, וטיוטות משוב נשמרים ב־
            <bdi>localStorage</bdi>. הם נשארים במכשיר הזה בלבד. בגרסת ההתאמה
            האישית תישמר העדפה כללית בעוגייה בדפדפן.
          </p>
        </section>
        <section
          aria-labelledby="not-collected-title"
          className="scroll-mt-24 space-y-3 rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-5 sm:p-6"
          id="not-collected"
          tabIndex={-1}
        >
          <h2
            className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
            id="not-collected-title"
          >
            מה לא קורה
          </h2>
          <p>
            ההתקדמות והמשוב אינם נשלחים לשרת. פתיחת טיוטה ב־<bdi>GitHub</bdi>
            היא פעולה יזומה בלבד, והשליחה הסופית מתבצעת שם לאחר התחברות. אין
            שירותי צד שלישי, ואין פרסום בגרסה זו. לכן גם אין מעקב בין אתרים או
            בין מכשירים.
          </p>
        </section>
        <section
          aria-labelledby="control-title"
          className="scroll-mt-24 space-y-3 rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-5 sm:p-6"
          id="control"
          tabIndex={-1}
        >
          <h2
            className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
            id="control-title"
          >
            מחיקה ושליטה
          </h2>
          <p>
            אפשר לאפס התקדמות מתוך כל צעד, או למחוק את נתוני האתר דרך הגדרות
            הדפדפן. מחיקה מקומית היא סופית מפני שאין עותק בשרת.
          </p>
        </section>
      </article>
    </Container>
  );
}
