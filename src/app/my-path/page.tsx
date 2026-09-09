import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { MyPathExperience } from "@/components/profile/MyPathExperience";
import { getPublishedSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "המסלול שלי",
  description: "צעדים אישיים והתקדמות מקומית בדפדפן.",
  path: "/my-path",
});

export default function MyPathPage() {
  return (
    <Container className="py-10 sm:py-14">
      <MyPathExperience steps={getPublishedSteps()} />
    </Container>
  );
}
