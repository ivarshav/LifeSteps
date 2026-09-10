import { expect, test, type Page } from "@playwright/test";

const curatedLinks = [
  "/steps/rent-apartment",
  "/steps/childbirth",
  "/steps/job-search",
  "/categories/housing",
  "/categories/family",
  "/categories/vehicle",
];

async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

for (const width of [360, 768, 1280]) {
  test(`editorial discovery is RTL and fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const section = page.locator(
      "section[aria-labelledby='discovery-heading']",
    );
    await expect(
      section.getByRole("heading", { name: "לגלות באתר" }),
    ).toBeVisible();
    await expect(
      section.getByText("מבחר שנערך על ידי צוות התוכן כדי לעזור להתחיל לעיין."),
    ).toBeVisible();
    await expect(section.getByRole("link")).toHaveCount(curatedLinks.length);

    for (const href of curatedLinks) {
      await expect(section.locator(`a[href="${href}"]`)).toBeVisible();
    }

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoPageOverflow(page);
  });
}
