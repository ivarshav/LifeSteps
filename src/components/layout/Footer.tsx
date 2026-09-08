import { getAllCategories, getPublishedSteps } from "@/lib/content";

import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  const categories = getAllCategories().slice(0, 4);
  const popular = getPublishedSteps().slice(0, 4);

  return (
    <footer className="border-block-start mt-12 border-[var(--gray-200)] bg-[var(--surface)] py-10">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-extrabold text-[var(--gray-900)]">
              <Logo size={26} />
              <span>צעדי חיים</span>
            </div>
            <p className="max-w-[36ch] text-sm text-[var(--gray-500)]">
              צ&apos;ק ליסטים מסודרים לאירועי החיים הגדולים בישראל — מה עושים,
              באיזה סדר ועם אילו מסמכים.
            </p>
          </div>
          <FooterList
            links={[
              { href: "/", label: "בית" },
              { href: "/search", label: "חיפוש" },
              { href: "/about", label: "אודות" },
            ]}
            title="האתר"
          />
          <FooterList
            links={popular.map((step) => ({
              href: `/steps/${step.id}`,
              label: step.shortTitle ?? step.title,
            }))}
            title="צעדים זמינים"
          />
          <FooterList
            links={[
              ...categories.map((category) => ({
                href: `/categories/${category.id}`,
                label: category.title,
              })),
              { href: "/privacy", label: "פרטיות" },
              { href: "/terms", label: "תנאי שימוש" },
            ]}
            title="מידע"
          />
        </div>
        <hr className="border-block-start my-6 border-0 border-[var(--gray-200)]" />
        <p className="text-sm text-[var(--gray-500)]">
          המידע באתר הוא מידע כללי בלבד ואינו מהווה ייעוץ משפטי, פיננסי או
          רפואי. אגרות, סכומים ומועדים משתנים — יש לאמת מול הגורם הרשמי הרלוונטי
          לפני ביצוע. © {new Date().getFullYear()} צעדי חיים.
        </p>
      </Container>
    </footer>
  );
}

function FooterList({
  links,
  title,
}: {
  links: { href: string; label: string }[];
  title: string;
}) {
  return (
    <div>
      <h2 className="mb-2 text-base font-semibold text-[var(--gray-900)]">
        {title}
      </h2>
      <ul className="m-0 list-none space-y-1 p-0">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <a className="text-sm text-[var(--gray-500)]" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
