import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  measure?: "wide" | "reading";
};

export function Container({
  className,
  measure = "wide",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5",
        measure === "reading" ? "max-w-3xl" : "max-w-[var(--maxw)]",
        className,
      )}
      {...props}
    />
  );
}
