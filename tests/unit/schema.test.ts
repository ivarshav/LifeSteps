import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CatalogSchema, CategorySchema, StepSchema } from "@/lib/schema";

const contentDirectory = join(process.cwd(), "content");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("content schemas", () => {
  it("accepts the real content store as its fixture", () => {
    const categories = CategorySchema.array().parse(
      readJson(join(contentDirectory, "categories.json")),
    );
    const catalog = CatalogSchema.parse(
      readJson(join(contentDirectory, "catalog.json")),
    );
    const steps = readdirSync(join(contentDirectory, "steps"))
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) =>
        StepSchema.parse(readJson(join(contentDirectory, "steps", fileName))),
      );

    expect(categories.length).toBeGreaterThan(0);
    expect(steps).toHaveLength(catalog.steps.length);
    expect(new Set(steps.map((step) => step.id))).toEqual(
      new Set(catalog.steps.map((step) => step.id)),
    );
  });

  it("allows empty sections only for coming-soon steps", () => {
    const validStep = StepSchema.parse(
      readJson(join(contentDirectory, "steps", "buy-used-car.json")),
    );
    const emptyComingSoonStep = {
      ...validStep,
      sections: [],
      status: "coming-soon" as const,
    };

    expect(StepSchema.safeParse(emptyComingSoonStep).success).toBe(true);
    expect(
      StepSchema.safeParse({
        ...emptyComingSoonStep,
        status: "published",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid calendar dates and non-HTTPS sources", () => {
    const fixture = readJson(
      join(contentDirectory, "steps", "buy-used-car.json"),
    );
    expect(
      StepSchema.safeParse({
        ...(fixture as object),
        lastReviewed: "2026-02-30",
      }).success,
    ).toBe(false);
    expect(
      StepSchema.safeParse({
        ...(fixture as object),
        sources: [{ label: "source", url: "http://example.com" }],
      }).success,
    ).toBe(false);
  });
});
