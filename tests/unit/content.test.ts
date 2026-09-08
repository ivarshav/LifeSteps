import { describe, expect, it } from "vitest";

import {
  countTasks,
  getAllCategories,
  getAllSteps,
  getCategory,
  getPublishedSteps,
  getStep,
  getStepByNid,
  getStepsByCategory,
} from "@/lib/content";

describe("content loader", () => {
  it("loads the real baseline once and exposes stable lookups", () => {
    const allSteps = getAllSteps();
    const publishedSteps = getPublishedSteps();
    const expectedPublished = allSteps.filter(
      (step) => step.status !== "coming-soon",
    );
    const expectedTaskCount = allSteps.reduce(
      (total, step) =>
        total +
        step.sections.reduce(
          (sectionTotal, section) => sectionTotal + section.tasks.length,
          0,
        ),
      0,
    );

    expect(allSteps.length).toBeGreaterThan(0);
    expect(publishedSteps).toEqual(expectedPublished);
    expect(
      allSteps.reduce((total, step) => total + countTasks(step), 0),
    ).toBe(expectedTaskCount);

    const usedCar = getStep("buy-used-car");
    expect(usedCar?.nid).toBe(12);
    expect(getStepByNid(12)).toBe(usedCar);
    expect(getStep("missing")).toBeNull();
    expect(getStepByNid(999_999)).toBeNull();
  });

  it("sorts categories and groups steps by permanent category id", () => {
    const categories = getAllCategories();
    expect(categories.map((category) => category.order)).toEqual(
      [...categories].map((category) => category.order).sort((a, b) => a - b),
    );
    expect(getCategory("vehicle")?.nid).toBe(1);
    expect(getCategory("missing")).toBeNull();
    const vehicleSteps = getStepsByCategory("vehicle");
    expect(vehicleSteps).toEqual(
      getAllSteps().filter((step) => step.categoryId === "vehicle"),
    );
    expect(vehicleSteps.length).toBeGreaterThan(0);
  });
});
