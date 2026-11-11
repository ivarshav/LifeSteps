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

const compatibilityRoutes = [
  "/app/",
  "/app/search/",
  "/app/about/",
  "/app/privacy/",
  "/app/terms/",
  "/app/s/",
  "/app/saved/",
  "/app/share/",
  ...getAllCategories().map((category) => `/app/categories/${category.id}/`),
  ...getAllSteps().map((step) => `/app/steps/${step.id}/`),
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

test("all compatibility routes are RTL without mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  for (const route of compatibilityRoutes) {
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
