import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--maxw)] px-5", className)}
      {...props}
    />
  );
}
