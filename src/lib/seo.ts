import type { Metadata } from "next";

export const SITE_NAME = "צעדי חיים";
export const SITE_DESCRIPTION =
  "צ'ק ליסטים מסודרים לאירועי החיים הגדולים בישראל — מה עושים, באיזה סדר, עם אילו מסמכים.";

const FALLBACK_SITE_URL = "https://life-steps.herokuapp.com";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || FALLBACK_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl()}/`).toString();
}

type PageMetadataInput = {
  description: string;
  path: string;
  title: string;
};

export function pageMetadata({
  description,
  path,
  title,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      images: [{ url: absoluteUrl("/opengraph-image") }],
      locale: "he_IL",
      siteName: SITE_NAME,
      type: "website",
      url: absoluteUrl(path),
    },
  };
}
