import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--gray-100)] px-2.5 py-[3px] text-xs font-semibold whitespace-nowrap text-[var(--gray-600)]",
        className,
      )}
      {...props}
    />
  );
}
