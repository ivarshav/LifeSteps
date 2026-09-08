import { expect, test } from "@playwright/test";

test("search handles niqqud, final letters and task-only terms", async ({
  page,
}) => {
  await page.goto("/search/");
  const search = page.getByRole("searchbox", { exact: true, name: "חיפוש" });

  await search.fill("רֶכֶב");
  await expect(
    page.getByRole("link", { name: /קניית רכב יד שנייה/ }),
  ).toBeVisible();

  await search.fill("שעבודים");
  await expect(
    page.getByText("בדיקת שעבודים ועיקולים ברשם המשכונות"),
  ).toBeVisible();

  await search.fill("טופס 161");
  await expect(page.locator("article").first()).toBeVisible();
});
