"use client";

import { useEffect, type ReactNode } from "react";

type ToastProps = {
  children: ReactNode;
  duration?: number;
  icon?: ReactNode;
  onDismiss: () => void;
};

export function Toast({
  children,
  duration = 3500,
  icon = "✅",
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onDismiss]);

  return (
    <div
      className="ui-toast animate-toast-in pointer-events-auto flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-semibold shadow-[var(--shadow-lg)]"
      role="status"
    >
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
      <button
        aria-label="סגירת הודעה"
        className="grid size-5 place-items-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 hover:opacity-100"
        onClick={onDismiss}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
