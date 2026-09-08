const DEFAULT_DISCLAIMER =
  "המידע בעמוד זה הוא מידע כללי בלבד ואינו מהווה ייעוץ משפטי, פיננסי או רפואי. אגרות, סכומים, מועדים ונהלים משתנים מעת לעת. יש לאמת כל פרט מול הגורם הרשמי לפני ביצוע פעולה.";

export function Disclaimer({ children }: { children?: string }) {
  return (
    <aside className="my-6 rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--gray-50)] p-4 text-sm text-[var(--gray-600)]">
      ⚠ {children || DEFAULT_DISCLAIMER}
    </aside>
  );
}
