import { expect, test } from "@playwright/test";

import { encodeShare } from "../../src/lib/share";

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

async function createVehicleShareLink(
  page: import("@playwright/test").Page,
  stepLabels: string[],
) {
  await page.goto("/share/");
  await page.locator("summary").filter({ hasText: "רכב ותחבורה" }).click();
  for (const label of stepLabels) {
    await page.getByLabel(`בחירת ${label}`).click();
  }
  return page.getByLabel("קישור לשיתוף").inputValue();
}

test("shares selected steps through a hash-only link", async ({
  browser,
  page,
}) => {
  const link = await createVehicleShareLink(page, ["קניית רכב יד שנייה"]);
  expect(new URL(link).hash).not.toBe("");

  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  const requests: string[] = [];
  recipientPage.on("request", (request) => requests.push(request.url()));
  await recipientPage.goto(link);
  await expect(recipientPage.getByText("רשימה ששותפה איתך")).toBeVisible();
  await expect(
    recipientPage.getByText("הגדרת תקציב כולל — לא רק מחיר הרכב"),
  ).toBeVisible();
  await expect(
    recipientPage.getByText("בדיקת היסטוריית הרכב במאגרים הרשמיים"),
  ).toBeVisible();
  await recipientPage
    .locator("summary")
    .filter({ hasText: "קניית רכב יד שנייה" })
    .click();
  await expect(
    recipientPage.locator("details", { has: recipientPage.getByRole("heading", { name: "קניית רכב יד שנייה" }) }),
  ).not.toHaveAttribute("open", "");
  await expect(
    recipientPage.getByText("הגדרת תקציב כולל — לא רק מחיר הרכב"),
  ).not.toBeVisible();
  await recipientPage
    .locator("summary")
    .filter({ hasText: "קניית רכב יד שנייה" })
    .click();
  expect(requests).toEqual(
    expect.not.arrayContaining([expect.stringContaining("#")]),
  );
  await recipientPage
    .getByRole("button", { name: "שמור את הרשימה אצלי" })
    .click();
  await expect(
    recipientPage.getByText("הרשימה נשמרה אצלך", { exact: true }),
  ).toBeVisible();
  await expect(
    recipientPage.getByRole("button", { name: "הרשימה נשמרה אצלך" }),
  ).toHaveCount(0);
  await recipientPage.getByRole("link", { name: "לרשימות ששמרתי" }).click();
  await expect(
    recipientPage.getByRole("heading", { name: "הרשימות ששמרתי" }),
  ).toBeVisible();
  await expect(
    recipientPage.getByRole("link", { name: "פתיחת הרשימה" }),
  ).toBeVisible();
  await recipient.close();
});

test("keeps bulk selection separate from category disclosure", async ({
  page,
}) => {
  await page.goto("/share/");
  const categorySelection = page.getByRole("checkbox", {
    name: "בחירת כל צעדי רכב ותחבורה",
  });
  const firstStep = page.getByLabel("בחירת הוצאת רישיון נהיגה");

  await expect(firstStep).not.toBeVisible();
  await categorySelection.click();
  await expect(categorySelection).toHaveAttribute("aria-checked", "true");
  await expect(firstStep).not.toBeVisible();

  await page.locator("summary").filter({ hasText: "רכב ותחבורה" }).click();
  await expect(firstStep).toBeVisible();
  await expect(firstStep).toHaveAttribute("aria-checked", "true");
});

test("uses unique accessible ids and isolated progress in multi-step guides", async ({
  page,
}) => {
  const link = await createVehicleShareLink(page, [
    "קניית רכב חדש",
    "קניית רכב יד שנייה",
  ]);
  await page.goto(link);

  const duplicateIds = await page
    .locator("main [id]")
    .evaluateAll((elements) => {
      const counts = new Map<string, number>();
      elements.forEach((element) => {
        counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
      });
      return [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([id]) => id);
    });
  expect(duplicateIds).toEqual([]);
  await expect(
    page.locator("#shared-buy-new-car-section-before-signing"),
  ).toHaveCount(1);
  await expect(
    page.locator("#shared-buy-used-car-section-before-signing"),
  ).toHaveCount(1);

  const newCarTask = page.getByRole("checkbox", {
    name: "הגדרת תקציב כולל ולא רק מחיר הרכב",
    exact: true,
  });
  const usedCarTask = page.getByRole("checkbox", {
    name: "הגדרת תקציב כולל — לא רק מחיר הרכב",
    exact: true,
  });
  await expect(newCarTask).toHaveCount(1);
  await expect(usedCarTask).toHaveCount(1);

  await newCarTask.click();
  await expect(newCarTask).toHaveAttribute("aria-checked", "true");
  await expect(usedCarTask).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(newCarTask).toHaveAttribute("aria-checked", "true");
  await expect(usedCarTask).toHaveAttribute("aria-checked", "false");
});

test("keeps save and remove actions available when storage writes fail", async ({
  page,
}) => {
  const link = await createVehicleShareLink(page, ["קניית רכב יד שנייה"]);
  await page.addInitScript(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === "ls_saved_lists_v1") {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      }
      nativeSetItem.call(this, key, value);
    };
  });
  await page.goto(link);

  const saveButton = page.getByRole("button", {
    name: "שמור את הרשימה אצלי",
  });
  await saveButton.click();
  await expect(
    page.getByRole("alert").filter({ hasText: "לא הצלחנו לשמור" }),
  ).toBeVisible();
  await expect(saveButton).toBeVisible();
  await expect(
    page.getByText("הרשימה נשמרה אצלך", { exact: true }),
  ).toHaveCount(0);
});

test("keeps corrupt saved records from breaking or misleading the saved page", async ({
  page,
}) => {
  const payload = encodeShare({ v: 1, s: [[1, []]] });
  await page.addInitScript((savedPayload) => {
    const nativeSetItem = Storage.prototype.setItem;
    nativeSetItem.call(
      localStorage,
      "ls_saved_lists_v1",
      JSON.stringify([
        {
          id: "invalid-date",
          payload: savedPayload,
          savedAt: "not-a-date",
        },
        {
          id: "remove-failure",
          payload: savedPayload,
          savedAt: "2026-09-10T12:00:00.000Z",
        },
      ]),
    );
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === "ls_saved_lists_v1") {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      }
      nativeSetItem.call(this, key, value);
    };
  }, payload);
  await page.goto("/saved/");

  const removeButton = page.getByRole("button", { name: "הסרה" });
  await expect(removeButton).toHaveCount(1);
  await removeButton.click();
  await expect(
    page.getByRole("alert").filter({ hasText: "לא הצלחנו להסיר" }),
  ).toBeVisible();
  await expect(removeButton).toBeVisible();
});

test("starts with an empty selection to assemble a multi-step list", async ({
  page,
}) => {
  await page.goto("/share/");
  await expect(page.getByText("עדיין לא נבחרו צעדים.")).toBeVisible();
  await expect(page.getByLabel("בחירת קניית רכב יד שנייה")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("shows a friendly state for an invalid share link", async ({ page }) => {
  await page.goto("/s/#not-a-share");
  await expect(
    page.getByRole("heading", { name: "לא הצלחנו לפתוח את הרשימה" }),
  ).toBeVisible();
});

test("keeps global sharing navigation usable at responsive breakpoints", async ({
  page,
}) => {
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByLabel("פתיחת תפריט").click();
    const mobileNav = page.getByRole("navigation", { name: "ניווט לנייד" });
    await expect(
      mobileNav.getByRole("link", { name: "שיתוף רשימה" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "הרשימות ששמרתי" }),
    ).toBeVisible();
    await expectNoOverflow(page);
  }

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  const desktopNav = page.getByRole("navigation", { name: "ניווט ראשי" });
  const shareLink = desktopNav.getByRole("link", { name: "שיתוף רשימה" });
  const savedLink = desktopNav.getByRole("link", {
    name: "הרשימות ששמרתי",
  });
  await expect(shareLink).toBeVisible();
  await expect(savedLink).toBeVisible();
  await expect(shareLink).toHaveCSS("white-space", "nowrap");
  await expect(savedLink).toHaveCSS("white-space", "nowrap");
  await expectNoOverflow(page);
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
    await page.goto("/saved/");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoOverflow(page);
  });
}
