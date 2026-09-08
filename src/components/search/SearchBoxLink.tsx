"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBoxLink() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }
  return (
    <form
      className="relative mx-auto mt-5 max-w-md"
      onSubmit={submit}
      role="search"
    >
      <label className="sr-only" htmlFor="not-found-search">
        חיפוש
      </label>
      <Search
        aria-hidden
        className="inset-block-start-1/2 inset-inline-start-4 absolute -translate-y-1/2 text-[var(--gray-500)]"
        size={18}
      />
      <input
        className="w-full rounded-full border border-[var(--gray-200)] bg-[var(--surface)] py-3 ps-11 pe-4"
        id="not-found-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="מה חיפשתם? למשל: משכנתא"
        type="search"
        value={query}
      />
    </form>
  );
}
