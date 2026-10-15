import { expect, test } from "@playwright/test";

import { getAllCategories, getAllSteps } from "../../src/lib/content";

test.setTimeout(180_000);

const routes = [
  "/",
  "/search/",
  "/about/",
  "/privacy/",
  "/s/",
  "/saved/",
  "/share/",
  "/terms/",
  ...getAllCategories().map((category) => `/categories/${category.id}/`),
  ...getAllSteps().map((step) => `/steps/${step.id}/`),
];

for (const width of [360, 768, 1280]) {
  test(`all V1 routes are RTL without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, route).toBe(false);
    }
  });
}
