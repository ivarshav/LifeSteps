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
      <div className="py-6">
        <h1 className="text-3xl font-bold text-[var(--gray-900)]">
          שיתוף רשימת צעדים
        </h1>
        <p className="mt-3 max-w-3xl text-[var(--gray-600)]">
          בוחרים את מה שרוצים להעביר הלאה, בלי חשבון ובלי לשמור את הרשימה אצלנו.
        </p>
      </div>
      <SharePicker categories={getAllCategories()} steps={getPublishedSteps()} />
    </Container>
  );
}