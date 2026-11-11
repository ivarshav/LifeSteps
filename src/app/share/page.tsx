import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SharePicker } from "@/components/share/SharePicker";
import { getAllCategories, getPublishedSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "שיתוף רשימת צעדים",
  description: "בוחרים צעדים ומשימות לשיתוף בקישור פרטי.",
  path: "/share",
});

export default function SharePage() {
  return (
    <Container>
      <div className="py-8 sm:py-10">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-[var(--gray-900)] sm:text-4xl">
          שיתוף רשימת צעדים
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--gray-600)]">
          בוחרים את מה שרוצים להעביר הלאה, בלי חשבון ובלי לשמור את הרשימה אצלנו.
        </p>
      </div>
      <SharePicker
        categories={getAllCategories()}
        steps={getPublishedSteps()}
      />
    </Container>
  );
}
