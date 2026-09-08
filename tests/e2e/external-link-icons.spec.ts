import { expect, test } from "@playwright/test";

test("external links have decorative icons and internal links do not", async ({
  page,
}) => {
  await page.goto("/steps/buy-used-car/");

  const externalLinks = page.locator('a[target="_blank"]');
  expect(await externalLinks.count()).toBeGreaterThan(0);
  for (const link of await externalLinks.all()) {
    await expect(link.locator("[data-external-link-icon]")).toHaveCount(1);
    await expect(link).not.toHaveAttribute("aria-hidden", "true");
  }

  await expect(
    page.locator(
      'a[href^="/"] [data-external-link-icon], a[href^="#"] [data-external-link-icon]',
    ),
  ).toHaveCount(0);

  const sources = page.locator("#sources");
  await sources.scrollIntoViewIfNeeded();
  await expect(
    sources
      .locator('a[target="_blank"]')
      .first()
      .locator("svg[aria-hidden=true]"),
  ).toBeVisible();
});
