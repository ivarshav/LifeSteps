import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  type CatalogEntry,
  type Step,
  StepSchema,
} from "@/lib/schema";

import { loadStore, validateStore } from "../../content/tools/rules.mjs";

describe("content governance", () => {
  it("accepts the canonical V2 profile values used by published audience rules", () => {
    const result = validateStore(loadStore());

    expect(
      result.errors.filter(
        (issue) =>
          issue.file === "content/profile-options.json" ||
          issue.path.includes(".audience"),
      ),
    ).toEqual([]);
  });

  it("keeps reviewed sensitive guides explicit-event and free of audience rules", () => {
    const sensitiveIds = new Set([
      "divorce",
      "end-employment",
      "unemployment-benefits",
      "pregnancy",
      "childbirth",
      "maternity-leave",
      "elder-care",
      "after-car-accident",
      "before-surgery",
      "medical-committee",
      "death-of-relative",
      "guardianship",
      "lasting-power-of-attorney",
    ]);
    const sensitiveSteps = loadStore().steps.filter((step: { data: Step }) =>
      sensitiveIds.has(step.data.id),
    );

    expect(sensitiveSteps).toHaveLength(sensitiveIds.size);
    for (const { data } of sensitiveSteps) {
      expect(data.recommendationEligibility).toEqual({ kind: "explicit-event" });
      expect(data.audience).toBeUndefined();
      expect(
        data.sections.flatMap(
          (section: Step["sections"][number]) => section.tasks,
        ),
      ).not.toContainEqual(
        expect.objectContaining({ audience: expect.anything() }),
      );
    }
  });

  it("rejects audience metadata anywhere on an explicit-event guide", () => {
    const store = structuredClone(loadStore());
    const buyUsedCar = store.steps.find(
      (step: { data: Step }) => step.data.id === "buy-used-car",
    );
    expect(buyUsedCar).toBeDefined();

    buyUsedCar!.data.recommendationEligibility = { kind: "explicit-event" };
    const errors = validateStore(store).errors;
    expect(errors).toContainEqual(
      expect.objectContaining({
        path: expect.stringContaining(".audience"),
        message: "tasks of explicit-event steps must not define audience metadata",
      }),
    );
  });

  it("rejects audience values and operator shapes outside the canonical contract", () => {
    const store = structuredClone(loadStore());
    const pregnancy = store.steps.find(
      (step: { data: Step }) => step.data.id === "pregnancy",
    );
    expect(pregnancy).toBeDefined();

    pregnancy!.data.audience = {
      all: [
        { key: "kids", op: "eq", value: ["young"] },
        { key: "interests", op: "has", value: ["family"] },
      ],
      any: [{ key: "housing", op: "eq", value: "unknown-housing" }],
    };

    const messages = validateStore(store).errors.map((issue) => issue.message);
    expect(messages).toContain(
      'audience.all[0].value must be a single code when op is "eq"',
    );
    expect(messages).toContain(
      'audience.all[1].value must be a single code when op is "has"',
    );
    expect(messages).toContainEqual(
      expect.stringContaining(
        '"unknown-housing" is not a valid code for "housing"',
      ),
    );
  });

  it("requires every catalog nid to remain registered to its original step", () => {
    const store = structuredClone(loadStore());
    const pregnancy = store.steps.find(
      (step: { data: Step }) => step.data.id === "pregnancy",
    );
    const catalogEntry = store.catalog.steps.find(
      (step: CatalogEntry) => step.id === "pregnancy",
    );
    expect(pregnancy).toBeDefined();
    expect(catalogEntry).toBeDefined();

    pregnancy!.data.nid = 10;
    catalogEntry!.nid = 10;

    expect(validateStore(store).errors).toContainEqual(
      expect.objectContaining({
        file: "content/catalog.json",
        message: expect.stringContaining(
          'nid 10 was allocated to "get-drivers-license"',
        ),
      }),
    );
  });

  it("keeps recommendation policy in the engine rather than allowing inert step metadata", () => {
    const step = JSON.parse(
      readFileSync(
        join(process.cwd(), "content", "steps", "pregnancy.json"),
        "utf8",
      ),
    );

    expect(
      StepSchema.safeParse({
        ...step,
        recommendation: { priority: 1 },
      }).success,
    ).toBe(false);
  });

  it("validates reviewed lifecycle prerequisites as an acyclic published graph", () => {
    const store = structuredClone(loadStore());
    const academicStudies = store.steps.find(
      (step: { data: Step }) => step.data.id === "academic-studies",
    );
    expect(academicStudies?.data.recommendationSequence).toEqual({
      after: ["idf-enlistment"],
    });

    academicStudies!.data.recommendationSequence = { after: ["unknown-step"] };
    expect(validateStore(store).errors).toContainEqual(
      expect.objectContaining({
        path: "recommendationSequence.after[0]",
        message: '"unknown-step" does not resolve to a published step',
      }),
    );
  });

  it("rejects duplicate, self-referential, and cyclic lifecycle prerequisites", () => {
    const store = structuredClone(loadStore());
    const academicStudies = store.steps.find(
      (step: { data: Step }) => step.data.id === "academic-studies",
    );
    const enlistment = store.steps.find(
      (step: { data: Step }) => step.data.id === "idf-enlistment",
    );
    expect(academicStudies).toBeDefined();
    expect(enlistment).toBeDefined();

    academicStudies!.data.recommendationSequence = {
      after: ["idf-enlistment", "idf-enlistment", "academic-studies"],
    };
    enlistment!.data.recommendationSequence = { after: ["academic-studies"] };
    const messages = validateStore(store).errors.map((issue) => issue.message);

    expect(messages).toContain('"idf-enlistment" is duplicated');
    expect(messages).toContain("a step cannot be its own prerequisite");
    expect(messages).toContain(
      "prerequisite cycle detected: academic-studies -> idf-enlistment -> academic-studies",
    );
  });
});
