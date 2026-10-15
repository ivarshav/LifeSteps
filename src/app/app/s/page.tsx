import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SharedList } from "@/components/share/SharedList";
import { getPublishedSteps } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "מישהו שיתף איתך רשימת צעדים",
  description: "רשימת משימות מותאמת מתוך צעדי חיים",
  openGraph: {
    title: "מישהו שיתף איתך רשימת צעדים",
    description: "רשימת משימות מותאמת מתוך צעדי חיים",
    images: [{ url: absoluteUrl("/opengraph-image") }],
  },
};

export default function SharedPage() {
  return <Container><SharedList steps={getPublishedSteps()} /></Container>;
}
