import { ExternalLink } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { siteUrl } from "@/lib/seo";

export function isExternalHref(href: string): boolean {
  try {
    const base = new URL(siteUrl());
    const target = new URL(href, base);
    return (
      (target.protocol === "http:" || target.protocol === "https:") &&
      target.origin !== base.origin
    );
  } catch {
    return false;
  }
}

type LinkWithExternalIconProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function LinkWithExternalIcon({
  children,
  className,
  href,
  rel,
  target,
  ...props
}: LinkWithExternalIconProps) {
  const external = isExternalHref(href);

  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-md",
        className,
      )}
      href={href}
      rel={external ? (rel ?? "noreferrer") : rel}
      target={external ? (target ?? "_blank") : target}
      {...props}
    >
      <span>{children}</span>
      {external ? (
        <>
          <ExternalLink
            aria-hidden="true"
            className="shrink-0"
            data-external-link-icon
            focusable="false"
            size={15}
          />
          <span className="sr-only"> (נפתח בחלון חדש)</span>
        </>
      ) : null}
    </a>
  );
}
