/* eslint-disable @next/next/no-html-link-for-pages -- Full-page navigation avoids hydrating static exports. */

import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeControl } from "./ThemeControl";

export function Header() {
  return (
    <header className="top-0 border-block-end sticky z-[60] border-[var(--gray-200)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-[10px]">
      <div className="mx-auto flex h-[var(--hdr-h)] max-w-[var(--maxw)] items-center gap-4 px-5">
        <a
          aria-label="צעדי חיים — לדף הבית"
          className="flex items-center gap-2 text-lg font-extrabold text-[var(--gray-900)] no-underline"
          href="/"
        >
          <Logo />
          <span>צעדי חיים</span>
        </a>
        <nav
          aria-label="ניווט ראשי"
          className="hidden items-center gap-1 sm:flex"
        >
          <a
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
            href="/"
          >
            בית
          </a>
          <a
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
            href="/#categories"
          >
            קטגוריות
          </a>
          <a
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
            href="/about"
          >
            אודות
          </a>
        </nav>
        <div className="flex-1" />
        <form
          action="/search"
          className="relative hidden w-full max-w-[300px] sm:block"
          method="get"
          role="search"
        >
          <label className="sr-only" htmlFor="header-search">
            חיפוש צעדים
          </label>
          <svg
            aria-hidden="true"
            className="top-1/2 end-3 absolute -translate-y-1/2 text-[var(--gray-500)]"
            fill="none"
            height="16"
            viewBox="0 0 20 20"
            width="16"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
            <path
              d="m13.5 13.5 3.5 3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <input
            className="w-full rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--gray-50)] py-2 ps-3.5 pe-9 text-sm text-[var(--gray-800)]"
            id="header-search"
            name="q"
            placeholder="חיפוש צעד, למשל: רכב"
            type="search"
          />
        </form>
        <ThemeControl />
        <MobileNav />
      </div>
    </header>
  );
}
