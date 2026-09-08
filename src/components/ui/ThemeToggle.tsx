"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { setTheme, THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore<Theme>(
    (onStoreChange) => {
      window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () =>
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    () => "light",
  );

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "dark" ? "מעבר למצב כהה" : "מעבר למצב בהיר";

  return (
    <button
      aria-label={label}
      className={cn(
        "grid size-[38px] place-items-center rounded-[var(--radius-md)] border border-[var(--gray-200)] bg-[var(--surface)] text-[var(--gray-600)] transition-colors duration-200 hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]",
        className,
      )}
      onClick={() => {
        setTheme(nextTheme);
      }}
      title="מצב כהה / בהיר"
      type="button"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </button>
  );
}
