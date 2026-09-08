import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> & {
  label: string;
  max?: number;
  min?: number;
  sticky?: boolean;
  value: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ProgressBar({
  className,
  label,
  max = 100,
  min = 0,
  sticky = false,
  value,
  ...props
}: ProgressBarProps) {
  const safeValue = clamp(value, min, max);
  const percentage = max === min ? 0 : ((safeValue - min) / (max - min)) * 100;

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={safeValue}
      className={cn(
        "flex h-2.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--gray-200)]",
        sticky && "sticky top-[var(--hdr-h)] z-50",
        className,
      )}
      role="progressbar"
      {...props}
    >
      <span
        className="h-full rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,var(--accent-500),#38c79e)] transition-[width] duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
