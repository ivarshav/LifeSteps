import type { Metadata } from "next";
import { CloudOff, Database, ShieldCheck } from "lucide-react";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { LinkWithExternalIcon } from "@/components/layout/LinkWithExternalIcon";
import { pageMetadata } from "@/lib/seo";
import { isKofiSupportEnabled } from "@/lib/support";

export const metadata: Metadata = pageMetadata({
  title: "מדיניות פרטיות",
  description:
    "איך צעדי חיים שומר העדפות והתקדמות בדפדפן ואילו שירותים חיצוניים נטענים באתר.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const showKofiSupport = isKofiSupportEnabled();

  return (
    <Container measure="reading">
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "מדיניות פרטיות" }]}
      />
      <article className="space-y-8 py-6 text-[var(--gray-600)] sm:py-8">
        <header className="space-y-6">
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
          <p className="rounded-[var(--radius-lg)] border border-[var(--brand-100)] bg-[var(--brand-50)] px-5 py-4 text-lg leading-relaxed text-[var(--brand-700)] sm:px-6 sm:py-5">
            אפשר להשתמש בצעדי חיים בלי לפתוח חשבון. האתר אינו בונה פרופיל משתמש
            לצורך שמירת רשימות או העדפות. מדיניות זו היא חלק מתנאי השימוש באתר.
          </p>
        </header>

        <nav
          aria-label="ניווט במסמך"
          className="flex flex-wrap gap-2 border-b border-[var(--gray-200)] pb-6"
        >
          <a
            className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
            href="#browser-storage"
          >
            מה נשמר בדפדפן
          </a>
          <a
            className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
            href="#not-collected"
          >
            מה לא קורה
          </a>
          <a
            className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
            href="#measurement"
          >
            שירותי מדידה ותשתית
          </a>
          {showKofiSupport ? (
            <a
              className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
              href="#kofi"
            >
              תמיכה דרך Ko-fi
            </a>
          ) : null}
          <a
            className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
            href="#control"
          >
            מחיקה ושליטה
          </a>
          <a
            className="rounded-full bg-[var(--gray-100)] px-3 py-3 text-sm text-[var(--gray-600)] transition-colors hover:bg-[var(--gray-200)] focus-visible:outline-offset-2"
            href="#other"
          >
            שונות
          </a>
        </nav>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:grid md:grid-cols-2">
          <section
            className="scroll-mt-24 space-y-3 p-5 sm:p-6"
            id="browser-storage"
            aria-labelledby="browser-storage-title"
            tabIndex={-1}
          >
            <h2
              className="flex items-center gap-3 text-xl leading-snug font-semibold text-[var(--gray-900)]"
              id="browser-storage-title"
            >
              <Database
                aria-hidden="true"
                className="size-5 shrink-0 text-[var(--brand-600)]"
                strokeWidth={1.75}
              />
              מה נשמר בדפדפן
            </h2>
            <p>
              סימון משימות נשמר ב־<bdi>localStorage</bdi>. בגרסת ההתאמה האישית
              תישמר העדפה כללית בעוגייה בדפדפן.
            </p>
          </section>
          <section
            className="scroll-mt-24 space-y-3 border-t border-[var(--gray-200)] p-5 sm:p-6 md:border-s md:border-t-0 md:border-[var(--gray-200)]"
            id="not-collected"
            aria-labelledby="not-collected-title"
            tabIndex={-1}
          >
            <h2
              className="flex items-center gap-3 text-xl leading-snug font-semibold text-[var(--gray-900)]"
              id="not-collected-title"
            >
              <CloudOff
                aria-hidden="true"
                className="size-5 shrink-0 text-[var(--brand-600)]"
                strokeWidth={1.75}
              />
              מה לא קורה
            </h2>
            <p>
              ההתקדמות אינה נשלחת לשרת. אין שירותי צד שלישי, ואין פרסום בגרסה
              זו. לכן גם אין מעקב בין אתרים או בין מכשירים.
            </p>
          </section>
        </div>

        <section
          className="scroll-mt-24 space-y-4 rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--gray-50)] p-5 sm:p-6"
          id="measurement"
          aria-labelledby="measurement-title"
          tabIndex={-1}
        >
          <h2
            className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
            id="measurement-title"
          >
            שירותי מדידה ותשתית
          </h2>
          <div className="space-y-2">
            <p>
              האתר משתמש ב־<bdi>Vercel Analytics</bdi> וב־
              <bdi>Speed Insights</bdi>, כלי מדידה מצומצמים של <bdi>Vercel</bdi>
              , כדי להבין עומסים, תקלות וביצועים. ייתכן שכלים אלו עושים שימוש
              בעוגיות או בטכנולוגיות דומות, בהתאם למדיניות הפרטיות של{" "}
              <bdi>Vercel</bdi>.
            </p>
            <p>
              מלבד כלי מדידה אלו, אין באתר פרסומות, אין מעקב בין אתרים למטרות
              פרסום ואין שירותי צד שלישי למטרות שיווק בגרסה זו. אפשר לחסום
              עוגיות דרך הגדרות הדפדפן, אך העדפת מצב התצוגה עלולה שלא להישמר.
            </p>
            <p>
              כשמסמנים אם משימה הייתה ברורה (כן/לא), נשלח אירוע אנונימי ל־
              <bdi>Axiom</bdi> הכולל את מזהה הצעד, מזהה המשימה והתשובה בלבד —
              ללא טקסט חופשי וללא פרטים מזהים — כדי לזהות צעדים שאינם ברורים
              ולשפר אותם. סימון ההתקדמות עצמו אינו נשלח.
            </p>
          </div>
          <p>
            <LinkWithExternalIcon href="https://vercel.com/legal/privacy-policy">
              מדיניות הפרטיות של Vercel
            </LinkWithExternalIcon>
          </p>
          <p>
            <LinkWithExternalIcon href="https://axiom.co/docs/legal/privacy-policy">
              מדיניות הפרטיות של Axiom
            </LinkWithExternalIcon>
          </p>
        </section>
        {showKofiSupport ? (
          <section
            className="scroll-mt-24 space-y-3 border-t border-[var(--gray-200)] pt-5"
            id="kofi"
            aria-labelledby="kofi-title"
            tabIndex={-1}
          >
            <h2
              className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
              id="kofi-title"
            >
              תמיכה דרך Ko-fi
            </h2>
            <p>
              אם תבחרו לתמוך בפרויקט דרך קישור Ko-fi באתר, התשלום מתבצע מחוץ
              לצעדי חיים, באמצעות Ko-fi וספק התשלום שתבחרו שם. האתר אינו מבקש או
              מקבל פרטי כרטיס תשלום. Ko-fi או ספק התשלום עשויים להציג למפעיל
              העמוד פרטים על התמיכה, בהתאם להגדרות ולמדיניות שלהם. מידע זה אינו
              נשמר ברשימות ההתקדמות של צעדי חיים. לפני הפעלת הקישור יש לעיין גם
              במדיניות הפרטיות של Ko-fi ושל ספק התשלום.
            </p>
            <p>
              <LinkWithExternalIcon href="https://more.ko-fi.com/privacy">
                מדיניות הפרטיות של Ko-fi
              </LinkWithExternalIcon>
            </p>
          </section>
        ) : null}
        <section
          className="scroll-mt-24 space-y-3 border-t border-[var(--gray-200)] pt-5"
          id="control"
          aria-labelledby="control-title"
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
            הדפדפן. המחיקה המקומית מסירה את נתוני ההתקדמות וההעדפה מהמכשיר
            הנוכחי; היא אינה מוחקת נתונים טכניים שעשויים להישמר אצל שירותי
            התשתית לפי המדיניות שלהם.
          </p>
        </section>
        <section
          className="scroll-mt-24 space-y-3 border-t border-[var(--gray-200)] pt-5"
          id="other"
          aria-labelledby="other-title"
          tabIndex={-1}
        >
          <h2
            className="text-xl leading-snug font-semibold text-[var(--gray-900)]"
            id="other-title"
          >
            שונות
          </h2>
          <p>
            אין בהוראות מסמך זה כדי לגרוע מזכויותינו על פי כל דין. אנו רשאים
            לעדכן מסמך זה מעת לעת, ומומלץ לבדוק אותו באופן מתמיד.
          </p>
        </section>
      </article>
    </Container>
  );
}
