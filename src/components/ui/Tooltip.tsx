"use client";

import {
  cloneElement,
  useId,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

type TooltipTriggerProps = {
  "aria-describedby"?: string;
};

type TooltipProps = {
  children: ReactElement<TooltipTriggerProps>;
  content: ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const trigger = cloneElement(children, {
    "aria-describedby": open ? tooltipId : children.props["aria-describedby"],
  });

  const closeOnBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <span
      className="relative inline-flex"
      onBlur={closeOnBlur}
      onFocus={() => setOpen(true)}
      onKeyDown={closeOnEscape}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {trigger}
      {open ? (
        <span
          className="animate-fade-in absolute start-1/2 bottom-[calc(100%+8px)] z-30 w-max max-w-60 translate-x-1/2 rounded-[var(--radius-sm)] bg-[var(--gray-900)] px-2.5 py-1.5 text-xs leading-normal text-[var(--surface)] shadow-[var(--shadow-md)]"
          id={tooltipId}
          role="tooltip"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
