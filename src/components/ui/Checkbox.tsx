"use client";

import type { KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

export type CheckboxState = boolean | "mixed";

type CheckboxProps = {
  "aria-labelledby"?: string;
  checked: CheckboxState;
  className?: string;
  disabled?: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
};

export function Checkbox({
  "aria-labelledby": labelledBy,
  checked,
  className,
  disabled = false,
  label,
  onChange,
  size = "md",
}: CheckboxProps) {
  const toggle = () => {
    if (!disabled) {
      onChange(checked !== true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <span
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn(
        "grid shrink-0 place-items-center border-2 bg-[var(--surface)] transition-[background,border-color,transform,opacity] duration-200 ease-out hover:border-[var(--accent-500)] active:scale-90",
        size === "sm"
          ? "size-5 rounded-md"
          : "mt-0.5 size-[26px] rounded-[8px]",
        checked === true && "border-[var(--accent-500)] bg-[var(--accent-500)]",
        checked === "mixed" &&
          "border-[var(--brand-500)] bg-[var(--brand-500)]",
        disabled &&
          "cursor-not-allowed opacity-50 hover:border-[var(--gray-300)] active:scale-100",
        className,
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      role="checkbox"
      tabIndex={disabled ? -1 : 0}
    >
      {checked === true ? (
        <svg
          aria-hidden="true"
          className="animate-checkbox-in"
          fill="none"
          height="15"
          viewBox="0 0 24 24"
          width="15"
        >
          <path
            d="m5 12.5 4.6 4.6L19 7"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
        </svg>
      ) : null}
      {checked === "mixed" ? (
        <svg
          aria-hidden="true"
          className="animate-checkbox-in"
          fill="none"
          height="14"
          viewBox="0 0 24 24"
          width="14"
        >
          <path
            d="M6 12h12"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="3.4"
          />
        </svg>
      ) : null}
    </span>
  );
}
