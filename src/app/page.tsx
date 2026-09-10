import type { Metadata } from "next";

import { CategoryCard } from "@/components/cards/CategoryCard";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import {
  getAllCategories,
  getPublishedSteps,
  getStepsByCategory,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "כל צעד בחיים, עם רשימה שאפשר לסמן",
  description:
    "צ'ק ליסטים מסודרים לאירועי החיים הגדולים בישראל — לפי הסדר, עם מסמכים, מועדים ועלויות משוערות.",
  path: "/",
});

export default function HomePage() {
  const categories = getAllCategories();
  const published = getPublishedSteps();

  return (
    <>
      <section className="border-block-end border-[var(--gray-200)] bg-[linear-gradient(160deg,var(--brand-50)_0%,var(--bg)_62%)]">
        <Container className="grid items-center gap-10 py-10 lg:grid-cols-[1.15fr_.85fr] lg:py-16">
          <div>
            <Pill className="bg-[var(--brand-100)] text-[var(--brand-700)]">
              🇮🇱 מותאם לחיים בישראל
            </Pill>
            <h1 className="mt-3 text-[2rem] leading-[1.15] font-bold tracking-[-.02em] text-[var(--gray-900)] sm:text-[2.75rem]">
              כל צעד בחיים,
              <br />
              עם רשימה שאפשר לסמן
            </h1>
            <p className="mt-4 max-w-[44ch] text-base leading-[1.55] text-[var(--gray-600)]">
              כל מה שצריך לעשות באירועי החיים הגדולים — לפי הסדר, עם הסברים,
              מסמכים ומועדים.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-transparent bg-[var(--brand-500)] px-6 py-3.5 text-base font-semibold text-white no-underline shadow-[var(--shadow-sm)] hover:bg-[var(--brand-600)] hover:no-underline"
                href="#categories"
              >
                עיון בכל הקטגוריות
              </a>
              <a
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] px-6 py-3.5 text-base font-semibold text-[var(--brand-600)] no-underline shadow-[var(--shadow-sm)] hover:bg-[var(--brand-50)] hover:no-underline"
                href="/search"
              >
                חיפוש צעד
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-[var(--gray-500)]">
              <span>✓ בלי הרשמה</span>
              <span>✓ בלי מסד נתונים</span>
              <span>
                ✓ {published.length.toLocaleString("he-IL")} צעדים זמינים
              </span>
              <span>✓ חינם לגמרי</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[var(--gray-900)]">
              מה רלוונטי עבורך?
            </h2>
            <p className="mt-1 text-[var(--gray-500)]">
              בהמשך נוכל להתאים את הסדר אליך. בינתיים כל התוכן פתוח וזמין.
            </p>
          </div>
          <Card className="flex flex-wrap items-center gap-5 border-[var(--brand-100)] bg-[linear-gradient(100deg,var(--brand-50),var(--accent-50))] p-6">
            <div className="min-w-60 flex-1">
              <h3 className="text-lg font-semibold text-[var(--gray-900)]">
                עוד לא סיפרת לנו כלום 🙂
              </h3>
              <p className="mt-1.5 max-w-[58ch] text-sm text-[var(--gray-600)]">
                התאמה אישית תגיע בגרסה הבאה. היא תהיה אופציונלית, בלי חשבון,
                ותמיד תשאיר את כל הצעדים גלויים.
              </p>
            </div>
            <Pill>בקרוב: מסלול אישי</Pill>
          </Card>
        </Container>
      </section>

      <section className="py-8" id="categories">
        <Container>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[var(--gray-900)]">
              כל הקטגוריות
            </h2>
            <p className="mt-1 text-[var(--gray-500)]">
              {categories.length.toLocaleString("he-IL")} תחומי חיים, מתוכן אפשר
              להגיע לכל צעד בשתי לחיצות.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                category={category}
                key={category.id}
                stepCount={getStepsByCategory(category.id).length}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[var(--gray-900)]">
              איך זה עובד
            </h2>
            <p className="mt-1 text-[var(--gray-500)]">
              שלושה שלבים, בלי הרשמה ובלי סיסמאות.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["בוחרים צעד", "מוצאים את אירוע החיים מקטגוריה או מחיפוש."],
              [
                "עוברים על הרשימה",
                "כל משימה מגיעה עם הסבר, מסמכים וקישורים רשמיים.",
              ],
              [
                "מסמנים וממשיכים",
                "ההתקדמות נשמרת רק בדפדפן, ומחכה גם בביקור הבא.",
              ],
            ].map(([title, text], index) => (
              <Card className="relative p-5 ps-20" key={title}>
                <span
                  aria-hidden="true"
                  className="absolute start-5 top-5 grid size-11 place-items-center rounded-full bg-[var(--brand-500)] text-lg font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="font-semibold text-[var(--gray-900)]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--gray-500)]">{text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
