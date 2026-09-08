"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type AccordionProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  title: ReactNode;
};

export function Accordion({
  children,
  className,
  defaultOpen = false,
  title,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)]",
        className,
      )}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-0 bg-transparent p-4 text-start font-semibold text-[var(--gray-800)] hover:bg-[var(--gray-50)]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {title}
        <svg
          aria-hidden="true"
          className={cn(
            "shrink-0 text-[var(--gray-500)] transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
          fill="none"
          height="18"
          viewBox="0 0 24 24"
          width="18"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        hidden={!open}
        id={panelId}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "px-4 pb-4 text-[.9375rem] text-[var(--gray-600)]",
              open && "animate-fade-in",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
