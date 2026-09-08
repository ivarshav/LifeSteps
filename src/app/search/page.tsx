import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { pageMetadata } from "@/lib/seo";

import { SearchClient } from "./SearchClient";

export const metadata: Metadata = pageMetadata({
  title: "חיפוש צעדים ומשימות",
  description:
    "חיפוש בעברית בכל צעדי החיים ובכל המשימות — כולל מונחים, מסמכים וטפסים.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <Container>
      <Breadcrumbs
        items={[{ href: "/", label: "בית" }, { label: "תוצאות חיפוש" }]}
      />
      <section className="py-4">
        <h1 className="mb-4 text-3xl font-bold text-[var(--gray-900)]">
          תוצאות חיפוש
        </h1>
        <SearchClient />
      </section>
    </Container>
  );
}
