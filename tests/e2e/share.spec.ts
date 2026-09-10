import { expect, test } from "@playwright/test";

async function expectNoOverflow(page: import("@playwright/test").Page) {
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

test("shares selected steps through a hash-only link", async ({ browser, page }) => {
  await page.goto("/share/");
  await page.locator("summary").filter({ hasText: "רכב ותחבורה" }).click();
  await page.getByLabel("בחירת קניית רכב יד שנייה").click();
  const link = await page.getByLabel("קישור לשיתוף").inputValue();
  expect(new URL(link).hash).not.toBe("");

  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  const requests: string[] = [];
  recipientPage.on("request", (request) => requests.push(request.url()));
  await recipientPage.goto(link);
  await expect(recipientPage.getByText("רשימה ששותפה איתך")).toBeVisible();
  await expect(recipientPage.getByText("הגדרת תקציב כולל — לא רק מחיר הרכב")).toBeVisible();
  await expect(recipientPage.getByText("בדיקת היסטוריית הרכב במאגרים הרשמיים")).toBeVisible();
  await recipientPage.locator("summary").filter({ hasText: "קניית רכב יד שנייה" }).click();
  await expect(recipientPage.getByText("הגדרת תקציב כולל — לא רק מחיר הרכב")).not.toBeVisible();
  await recipientPage.locator("summary").filter({ hasText: "קניית רכב יד שנייה" }).click();
  expect(requests).toEqual(expect.not.arrayContaining([expect.stringContaining("#")]));
  await recipientPage.getByRole("button", { name: "שמור את הרשימה אצלי" }).click();
  await expect(recipientPage.getByText("הרשימה נשמרה אצלך", { exact: true })).toBeVisible();
  await expect(recipientPage.getByRole("button", { name: "הרשימה נשמרה אצלך" })).toHaveCount(0);
  await recipientPage.getByRole("link", { name: "לרשימות ששמרתי" }).click();
  await expect(recipientPage.getByRole("heading", { name: "הרשימות ששמרתי" })).toBeVisible();
  await expect(recipientPage.getByRole("link", { name: "פתיחת הרשימה" })).toBeVisible();
  await recipient.close();
});

test("starts with an empty selection to assemble a multi-step list", async ({
  page,
}) => {
  await page.goto("/share/");
  await expect(page.getByText("עדיין לא נבחרו צעדים.")).toBeVisible();
  await expect(
    page.getByLabel("בחירת קניית רכב יד שנייה"),
  ).toHaveAttribute("aria-checked", "false");
});

test("shows a friendly state for an invalid share link", async ({ page }) => {
  await page.goto("/s/#not-a-share");
  await expect(page.getByRole("heading", { name: "לא הצלחנו לפתוח את הרשימה" })).toBeVisible();
});

for (const width of [360, 768, 1280]) {
  test(`share pages have no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/share/");
    await expectNoOverflow(page);
    await page.locator("summary").filter({ hasText: "רכב ותחבורה" }).click();
    await page.getByLabel("בחירת קניית רכב יד שנייה").click();
    const link = await page.getByLabel("קישור לשיתוף").inputValue();
    await page.goto(link);
    await expect(page.getByText("רשימה ששותפה איתך")).toBeVisible();
    await expectNoOverflow(page);
  });
}
