import { expect, test, type Page } from "@playwright/test";

const viewports = [360, 768, 1280];

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

for (const width of viewports) {
  test(`pre-V3 text changes stay usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    await page.goto("/");
    await expectNoPageOverflow(page);
    if (width < 640) {
      await expect(
        page.locator('summary[aria-label="פתיחת תפריט"]'),
      ).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "ניווט ראשי" })).toBeVisible();
    }

    await page.goto("/categories/housing/");
    const filters = page.getByRole("group", { name: "סינון צעדים" });
    await expect(filters.getByRole("button")).toHaveCount(2);
    await expect(
      filters.getByRole("button", { name: "זמין עכשיו" }),
    ).toHaveCount(0);
    await expect(filters.getByRole("button", { name: "בקרוב" })).toHaveCount(0);
    await filters.getByRole("button", { name: "עד 20 משימות" }).focus();
    await expect(filters.getByRole("button", { name: "עד 20 משימות" })).toBeFocused();
    await expectNoPageOverflow(page);

    await page.goto("/steps/rent-apartment/");
    await expect(page.getByText("בדרך כלל אלפי שקלים", { exact: true })).toBeVisible();
    const insuranceTask = page.locator('[data-task-id="arrange-renters-insurance"]');
    await expect(insuranceTask.getByText("רשות", { exact: true })).toHaveCount(0);
    await expect(insuranceTask.getByText("חשוב", { exact: true })).toHaveCount(0);
    await insuranceTask
      .locator('summary[aria-label*="פרטים נוספים"]')
      .press("Enter");
    await expect(
      insuranceTask.getByText(/ויתור על שיבוב\(תחלוף\) כנגד השוכר/),
    ).toBeVisible();
    await expectNoPageOverflow(page);

    await page.goto("/steps/childbirth/");
    await expect(page.locator("[data-task-id]")).not.toHaveCount(0);
    await expectNoPageOverflow(page);

    await page.goto("/search/");
    const search = page.getByRole("searchbox", { name: "חיפוש", exact: true });
    await search.focus();
    await search.fill("רכב");
    await expect(
      page.getByRole("link", { name: /קניית רכב יד שנייה/ }),
    ).toBeVisible();
    await expectNoPageOverflow(page);

    for (const route of ["/about/", "/privacy/", "/terms/"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expectNoPageOverflow(page);
    }
  });
}
