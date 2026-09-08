"use client";

import { Search } from "lucide-react";
import type { ChangeEvent, FocusEvent } from "react";

export function SearchBox({
  onChange,
  onFocus,
  value,
}: {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  value: string;
}) {
  return (
    <div className="relative w-full max-w-2xl">
      <Search
        aria-hidden
        className="inset-block-start-1/2 inset-inline-start-4 absolute -translate-y-1/2 text-[var(--gray-500)]"
        size={19}
      />
      <label className="sr-only" htmlFor="main-search">
        חיפוש
      </label>
      <input
        autoComplete="off"
        autoFocus
        className="w-full rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--surface)] py-3 ps-11 pe-4 text-base text-[var(--gray-800)] shadow-[var(--shadow-sm)]"
        id="main-search"
        onChange={onChange}
        onFocus={onFocus}
        placeholder="מה צריך לעשות? למשל: משכנתא, טופס 161 או דרכון"
        type="search"
        value={value}
      />
    </div>
  );
}
