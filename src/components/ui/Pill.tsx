import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Pill({
  className,
  wrap = false,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { wrap?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--gray-100)] px-2.5 py-[3px] text-xs font-semibold text-[var(--gray-600)]",
        wrap ? "whitespace-normal break-words" : "whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
