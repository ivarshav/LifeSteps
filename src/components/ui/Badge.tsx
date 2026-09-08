import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "optional" | "important" | "due" | "personalized";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant: BadgeVariant;
};

const labels: Record<Exclude<BadgeVariant, "due">, string> = {
  optional: "רשות",
  important: "חשוב",
  personalized: "רלוונטי עבורך",
};

const variants: Record<BadgeVariant, string> = {
  optional: "bg-[var(--gray-100)] text-[var(--gray-500)]",
  important: "bg-[var(--warn-50)] text-[var(--warn-500)]",
  due: "bg-[var(--brand-50)] text-[var(--brand-600)]",
  personalized: "bg-[var(--accent-50)] text-[var(--accent-500)]",
};

export function Badge({ children, className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-[9px] py-0.5 text-[.6875rem] font-bold whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    >
      {variant === "due" ? (
        <>
          <span aria-hidden="true">⏳</span>
          {children}
        </>
      ) : (
        (children ?? labels[variant])
      )}
    </span>
  );
}
