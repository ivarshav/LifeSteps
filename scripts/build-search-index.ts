import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getAllSteps } from "../src/lib/content";
import { normalize } from "../src/lib/hebrew";
import type { SearchIndexEntry } from "../src/lib/search";

const index: SearchIndexEntry[] = getAllSteps().map((step) => ({
  id: step.id,
  title: step.title,
  titleN: normalize(step.title),
  summary: step.summary,
  categoryId: step.categoryId,
  emoji: step.emoji,
  keywords: step.keywords.map(normalize),
  tasks: step.sections.flatMap((section) =>
    section.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      titleN: normalize(task.title),
    })),
  ),
}));

const publicDirectory = join(process.cwd(), "public");
mkdirSync(publicDirectory, { recursive: true });
writeFileSync(
  join(publicDirectory, "search-index.json"),
  `${JSON.stringify(index)}\n`,
  "utf8",
);

console.log(
  `Built search index: ${index.length} steps · ${index.reduce((total, step) => total + step.tasks.length, 0)} tasks`,
);
