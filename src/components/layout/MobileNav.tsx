"use client";

import type { KeyboardEvent } from "react";

const links = [
  { href: "/", label: "בית" },
  { href: "/#categories", label: "קטגוריות" },
  { href: "/search", label: "חיפוש" },
  { href: "/about", label: "אודות" },
];

function closeOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== "Escape" || !event.currentTarget.open) return;

  event.preventDefault();
  event.currentTarget.open = false;
  event.currentTarget.querySelector<HTMLElement>("summary")?.focus();
}

export function MobileNav() {
  return (
    <details className="group sm:hidden" onKeyDown={closeOnEscape}>
      <summary
        aria-label="פתיחת תפריט"
        className="grid size-11 cursor-pointer list-none place-items-center rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] text-[var(--gray-600)] [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden="true"
          className="group-open:hidden"
          fill="none"
          height="18"
          viewBox="0 0 24 24"
          width="18"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
        <span
          aria-hidden="true"
          className="hidden text-xl leading-none group-open:block"
        >
          ×
        </span>
      </summary>
      <nav
        aria-label="ניווט לנייד"
        className="top-[var(--hdr-h)] inset-x-0 border-block-end absolute flex flex-col border-[var(--gray-200)] bg-[var(--surface)] p-3 shadow-[var(--shadow-md)]"
      >
        {links.map((link) => (
          <a
            className="rounded-lg px-4 py-2.5 font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </details>
  );
}
