import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  CatalogSchema,
  CategorySchema,
  HomepageDiscoverySchema,
  StepSchema,
  type Category,
  type HomepageDiscoveryItem,
  type Step,
} from "./schema";

const CONTENT_DIRECTORY = join(process.cwd(), "content");
const STEPS_DIRECTORY = join(CONTENT_DIRECTORY, "steps");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

const categories = CategorySchema.array()
  .parse(readJson(join(CONTENT_DIRECTORY, "categories.json")))
  .sort((left, right) => left.order - right.order);

const catalog = CatalogSchema.parse(
  readJson(join(CONTENT_DIRECTORY, "catalog.json")),
);
const homepageDiscovery = HomepageDiscoverySchema.parse(
  readJson(join(CONTENT_DIRECTORY, "homepage-discovery.json")),
);
const parsedSteps = new Map(
  readdirSync(STEPS_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const step = StepSchema.parse(readJson(join(STEPS_DIRECTORY, fileName)));
      return [step.id, step] as const;
    }),
);

const steps = catalog.steps.map((entry) => {
  const step = parsedSteps.get(entry.id);
  if (!step) {
    throw new Error(`Missing content file for catalog step "${entry.id}"`);
  }
  return step;
});

if (steps.length !== parsedSteps.size) {
  const catalogIds = new Set(catalog.steps.map((entry) => entry.id));
  const undeclared = [...parsedSteps.keys()].filter(
    (id) => !catalogIds.has(id),
  );
  throw new Error(
    `Step files missing from content/catalog.json: ${undeclared.join(", ")}`,
  );
}

const categoryById = new Map(
  categories.map((category) => [category.id, category]),
);
const stepById = new Map(steps.map((step) => [step.id, step]));
const stepByNid = new Map(steps.map((step) => [step.nid, step]));

export type HomepageDiscovery =
  { type: "step"; item: Step } | { type: "category"; item: Category };

export function getAllCategories(): Category[] {
  return [...categories];
}

export function getCategory(id: string): Category | null {
  return categoryById.get(id) ?? null;
}

export function getAllSteps(): Step[] {
  return [...steps];
}

export function getStep(id: string): Step | null {
  return stepById.get(id) ?? null;
}

export function getStepByNid(nid: number): Step | null {
  return stepByNid.get(nid) ?? null;
}

export function getStepsByCategory(categoryId: string): Step[] {
  return steps.filter((step) => step.categoryId === categoryId);
}

export function getPublishedSteps(): Step[] {
  return steps.filter((step) => step.status !== "coming-soon");
}

export function getHomepageDiscovery(): HomepageDiscovery[] {
  return homepageDiscovery.items.map((entry: HomepageDiscoveryItem) => {
    if (entry.type === "step") {
      const step = stepById.get(entry.id);
      if (!step || step.status === "coming-soon") {
        throw new Error(
          `Homepage discovery step "${entry.id}" must be published and exist`,
        );
      }
      return { type: "step", item: step };
    }

    const category = categoryById.get(entry.id);
    if (!category) {
      throw new Error(`Homepage discovery category "${entry.id}" must exist`);
    }
    return { type: "category", item: category };
  });
}

export function countTasks(step: Step): number {
  return step.sections.reduce(
    (total, section) => total + section.tasks.length,
    0,
  );
}
