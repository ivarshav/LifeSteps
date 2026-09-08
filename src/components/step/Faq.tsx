import { Accordion } from "@/components/ui/Accordion";
import type { Step } from "@/lib/schema";

export function Faq({ items }: { items: NonNullable<Step["faq"]> }) {
  if (items.length === 0) return null;
  return (
    <section className="scroll-mt-32 py-6" id="faq">
      <h2 className="mb-3 text-2xl font-semibold text-[var(--gray-900)]">
        שאלות נפוצות
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Accordion key={item.q} title={item.q}>
            <p>{item.a}</p>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
