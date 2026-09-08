"use client";

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type ModalProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  role?: "dialog" | "alertdialog";
  title: ReactNode;
};

export function Modal({
  children,
  className,
  closeLabel = "סגירת חלון",
  footer,
  onClose,
  open,
  role = "dialog",
  title,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable =
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
    (focusable ?? dialogRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      event.preventDefault();
      dialogRef.current.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(17,24,39,.55)] p-4 backdrop-blur-[3px]"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "animate-modal-in relative max-h-[88vh] w-full max-w-[620px] overflow-auto rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)]",
          className,
        )}
        onKeyDown={handleKeyDown}
        role={role}
        tabIndex={-1}
      >
        <header className="border-b border-[var(--gray-100)] px-6 pt-5 pb-3">
          <h2
            className="pe-10 text-2xl leading-[1.3] font-semibold text-[var(--gray-900)]"
            id={titleId}
          >
            {title}
          </h2>
          <button
            aria-label={closeLabel}
            className="absolute end-4 top-4 grid size-[34px] place-items-center rounded-[var(--radius-sm)] border-0 bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)] hover:text-[var(--gray-900)]"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="p-6">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
