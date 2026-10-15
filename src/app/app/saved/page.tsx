import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SavedLists } from "@/components/share/SavedLists";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "הרשימות ששמרתי",
  description: "גישה לרשימות ששמרתם בדפדפן הזה.",
  path: "/saved",
});

export default function SavedListsPage() {
  return <Container><SavedLists /></Container>;
}
