import { expect, test } from "@playwright/test";

test("builds, persists, edits, and clears a browser-local personal path", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "בניית מסלול" }).click();
  await expect(page.getByText("שאלה 1 מתוך 6")).toBeVisible();
  await page.getByLabel("תחילת קריירה").check();
  await page.getByRole("button", { name: "הבא" }).click();
  await page.getByRole("button", { name: "דלג" }).click();
  await page.getByRole("button", { name: "דלג" }).click();
  await page.getByLabel("בשכירות").check();
  await page.getByRole("button", { name: "הבא" }).click();
  await page.getByRole("button", { name: "דלג" }).click();
  await page.getByLabel("קריירה וכספים").check();
  await page.getByRole("button", { name: "לסיכום" }).click();

  await expect(page.getByText("סיכום הבחירות")).toBeVisible();
  await page.getByRole("button", { name: "הצג את המסלול שלי" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "למסלול שלי" })).toBeVisible();

  await page.goto("/my-path/");
  await expect(page.getByLabel("הבחירות שלכם")).toBeVisible();
  await expect(page.getByText("למה ההצעה מוצגת?").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "מומלץ עבורך" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("הבחירות שלכם")).toBeVisible();
  await page.getByRole("button", { name: /הסרת בשכירות/ }).click();
  await expect(page.getByText("בשכירות")).not.toBeVisible();

  await page.getByRole("button", { name: "מחיקת הבחירות" }).click();
  await expect(page.getByRole("button", { name: "בניית מסלול" })).toBeVisible();
  await expect(page.getByText(/כל הצעדים פתוחים לעיון/)).toBeVisible();
});

test("profile dialog is keyboard operable on a narrow RTL viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const start = page.getByRole("button", { name: "בניית מסלול" });
  await start.focus();
  await start.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "סגירת חלון" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(start).toBeFocused();

  await start.click();
  await page.getByRole("button", { name: "דלג" }).click();
  await expect(page.getByText("שאלה 2 מתוך 6")).toBeVisible();
  await page.getByRole("button", { name: "הקודם" }).click();
  await expect(page.getByText("שאלה 1 מתוך 6")).toBeVisible();
  await page.getByRole("button", { name: "סגירת חלון" }).click();

  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
});

test("keeps a clean path neutral and makes an exact voluntary event removable", async ({
  page,
}) => {
  await page.goto("/my-path/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(
    page.getByRole("heading", { name: "מומלץ עבורך" }),
  ).not.toBeVisible();
  await expect(page.getByText("למה ההצעה מוצגת?")).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "צעדים נוספים לעיון" }),
  ).toBeVisible();

  const chooseEvent = page.getByRole("button", {
    name: "בחירת נושא למסלול",
  });
  await expect(page.getByRole("checkbox", { name: "גירושין" })).toHaveCount(0);
  await chooseEvent.focus();
  await chooseEvent.press("Enter");
  const dialog = page.getByRole("dialog", { name: "בחירת נושא למסלול" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "סגירת חלון" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(chooseEvent).toBeFocused();

  await chooseEvent.click();
  await dialog.getByRole("searchbox", { name: "חיפוש נושא" }).fill("גירושין");
  const event = dialog.getByRole("checkbox", { name: "גירושין" });
  await expect(event).not.toBeChecked();
  await event.check();

  await expect(
    page.getByRole("heading", { name: "מומלץ עבורך" }),
  ).toBeVisible();
  await expect(
    page.getByText("הצעד מוצג כי בחרתם לטפל ב: גירושין."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "הסרת הנושא גירושין מהמסלול" }),
  ).toBeVisible();
  await expect(page).toHaveURL("/my-path/");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("ls_event_selections_v1")),
    )
    .toBe(JSON.stringify({ version: 1, stepIds: ["divorce"] }));

  await page.reload();
  await page.getByRole("button", { name: "בחירת נושא למסלול" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "בחירת נושא למסלול" })
      .getByRole("checkbox", { name: "גירושין" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "סגירת חלון" }).click();
  await page
    .getByRole("button", { name: "הסרת הנושא גירושין מהמסלול" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "מומלץ עבורך" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "הסרת הנושא גירושין מהמסלול" }),
  ).not.toBeVisible();
  await expect(
    page.evaluate(() => localStorage.getItem("ls_event_selections_v1")),
  ).resolves.toBeNull();
  await expect(page).toHaveURL("/my-path/");
});

test("keeps profile and event state out of URLs and requests", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/my-path/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page
    .getByRole("button", { name: "בחירת נושא למסלול" })
    .click();
  await page
    .getByRole("dialog", { name: "בחירת נושא למסלול" })
    .getByRole("checkbox", { name: "גירושין" })
    .check();
  await page.getByRole("button", { name: "סגירת חלון" }).click();
  await page.getByRole("button", { name: "בניית מסלול" }).click();
  await page.getByLabel("תחילת קריירה").check();
  await page.getByRole("button", { name: "הבא" }).click();
  await page.getByRole("button", { name: "סגירת חלון" }).click();

  expect(await page.url()).toBe(`${test.info().project.use.baseURL}/my-path/`);
  expect(requests.join("\n")).not.toContain("divorce");
  expect(requests.join("\n")).not.toContain("early-career");
});
