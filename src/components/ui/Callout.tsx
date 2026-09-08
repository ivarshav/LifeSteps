import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "warn" | "info";
};

export function Callout({
  children,
  className,
  variant = "info",
  ...props
}: CalloutProps) {
  const warn = variant === "warn";

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm leading-[1.55]",
        warn
          ? "border-[color-mix(in_srgb,var(--warn-500)_30%,transparent)] bg-[var(--warn-50)] text-[var(--warn-500)]"
          : "border-[var(--brand-100)] bg-[var(--brand-50)] text-[var(--brand-700)]",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{warn ? "⚠" : "💡"}</span>
      <div>{children}</div>
    </div>
  );
}
