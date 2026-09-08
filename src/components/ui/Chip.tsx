import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
};

export function Chip({
  children,
  className,
  onRemove,
  removeLabel = "הסרה",
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--gray-200)] bg-[var(--surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)]",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          aria-label={removeLabel}
          className="grid size-5 place-items-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 transition-opacity hover:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </span>
  );
}
