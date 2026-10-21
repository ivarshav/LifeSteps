import type { Metadata } from "next";

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
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "מדיניות פרטיות" }]}
      />
      <article className="space-y-5 py-4 text-[var(--gray-600)]">
        <h1 className="text-3xl font-bold text-[var(--gray-900)]">
          מדיניות פרטיות
        </h1>
        <p>
          אפשר להשתמש בצעדי חיים בלי לפתוח חשבון. האתר אינו בונה פרופיל משתמש
          לצורך שמירת רשימות או העדפות. מדיניות זו היא חלק מתנאי השימוש באתר.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מה נשמר בדפדפן
          </h2>
          <p className="mt-2">
            סימון משימות נשמר ב־<bdi>localStorage</bdi>. בגרסת ההתאמה האישית תישמר העדפה כללית
            בעוגייה בדפדפן.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מה לא קורה
          </h2>
          <p className="mt-2">
            ההתקדמות אינה נשלחת לשרת. אין שירותי צד שלישי, ואין פרסום בגרסה זו. לכן גם אין מעקב בין אתרים או בין מכשירים.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            שירותי מדידה ותשתית
          </h2>
          <div className="mt-2 space-y-2">
            <p>
              האתר משתמש ב־<bdi>Vercel Analytics</bdi> וב־
              <bdi>Speed Insights</bdi>, כלי מדידה מצומצמים של{" "}
              <bdi>Vercel</bdi>, כדי להבין עומסים, תקלות וביצועים. ייתכן שכלים
              אלו עושים שימוש בעוגיות או בטכנולוגיות דומות, בהתאם למדיניות
              הפרטיות של <bdi>Vercel</bdi>.
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
          <p className="mt-2">
            <LinkWithExternalIcon href="https://vercel.com/legal/privacy-policy">
              מדיניות הפרטיות של Vercel
            </LinkWithExternalIcon>
          </p>
          <p className="mt-2">
            <LinkWithExternalIcon href="https://axiom.co/docs/legal/privacy-policy">
              מדיניות הפרטיות של Axiom
            </LinkWithExternalIcon>
          </p>
        </section>
        {showKofiSupport ? (
          <section>
            <h2 className="text-xl font-semibold text-[var(--gray-900)]">
              תמיכה דרך Ko-fi
            </h2>
            <p className="mt-2">
              אם תבחרו לתמוך בפרויקט דרך קישור Ko-fi באתר, התשלום מתבצע מחוץ
              לצעדי חיים, באמצעות Ko-fi וספק התשלום שתבחרו שם. האתר אינו מבקש או
              מקבל פרטי כרטיס תשלום. Ko-fi או ספק התשלום עשויים להציג למפעיל
              העמוד פרטים על התמיכה, בהתאם להגדרות ולמדיניות שלהם. מידע זה אינו
              נשמר ברשימות ההתקדמות של צעדי חיים. לפני הפעלת הקישור יש לעיין גם
              במדיניות הפרטיות של Ko-fi ושל ספק התשלום.
            </p>
            <p className="mt-2">
              <LinkWithExternalIcon href="https://more.ko-fi.com/privacy">
                מדיניות הפרטיות של Ko-fi
              </LinkWithExternalIcon>
            </p>
          </section>
        ) : null}
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            מחיקה ושליטה
          </h2>
          <p className="mt-2">
            אפשר לאפס התקדמות מתוך כל צעד, או למחוק את נתוני האתר דרך הגדרות
            הדפדפן. המחיקה המקומית מסירה את נתוני ההתקדמות וההעדפה מהמכשיר
            הנוכחי; היא אינה מוחקת נתונים טכניים שעשויים להישמר אצל שירותי
            התשתית לפי המדיניות שלהם.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">
            שונות
          </h2>
          <p className="mt-2">
            אין בהוראות מסמך זה כדי לגרוע מזכויותינו על פי כל דין. אנו רשאים
            לעדכן מסמך זה מעת לעת, ומומלץ לבדוק אותו באופן מתמיד.
          </p>
        </section>
      </article>
    </Container>
  );
}
