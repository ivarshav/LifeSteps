import { LinkWithExternalIcon } from "@/components/layout/LinkWithExternalIcon";
import type { Link } from "@/lib/schema";

export function Sources({ sources }: { sources: Link[] }) {
  return (
    <section className="scroll-mt-32 py-4" id="sources">
      <h2 className="mb-2 text-xl font-semibold text-[var(--gray-900)]">
        מקורות ואסמכתאות
      </h2>
      <ul className="space-y-1 ps-5 text-sm">
        {sources.map((source) => (
          <li key={source.url}>
            <LinkWithExternalIcon className="px-1 text-start" href={source.url}>
              {source.label}
              {source.official ? " — מקור רשמי" : ""}
            </LinkWithExternalIcon>
          </li>
        ))}
      </ul>
    </section>
  );
}
