import { expect, test } from "@playwright/test";

test("privacy section links move keyboard focus to the selected section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ["/privacy/", "/app/privacy/"]) {
    await page.goto(route);

    const links = page.locator("article nav a");
    const count = await links.count();
    expect(count, route).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const link = links.nth(index);
      const target = await link.getAttribute("href");
      if (!target)
        throw new Error("Privacy section link is missing its target");
      expect(target).toMatch(/^#[a-z-]+$/);
      const linkBox = await link.boundingBox();
      expect(linkBox?.height).toBeGreaterThanOrEqual(44);
      await link.focus();
      await page.keyboard.press("Enter");

      const section = page.locator(target);
      await expect(section).toBeFocused();
      await expect(page).toHaveURL(new RegExp(`${target}$`));

      const targetTop = await section.evaluate(
        (element) => element.getBoundingClientRect().top,
      );
      const headerBottom = await page
        .locator("header")
        .first()
        .evaluate((element) => element.getBoundingClientRect().bottom);
      expect(targetTop).toBeGreaterThanOrEqual(headerBottom);
    }
  }
});

test("skip navigation focuses main content on root and compatibility pages", async ({
  page,
}) => {
  for (const route of ["/", "/app/"]) {
    await page.goto(route);
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "דילוג לתוכן הראשי" });
    await expect(skipLink).toHaveCount(1);
    await expect(skipLink).toBeFocused();
    await expect(
      page.getByRole("navigation", { name: "ניווט ראשי" }),
    ).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  }
});

test("search index failures have a visible retry path", async ({ page }) => {
  let requests = 0;
  await page.route("**/search-index.json", async (route) => {
    requests += 1;
    if (requests % 2 === 1) {
      await route.abort();
      return;
    }
    await route.fulfill({
      body: "[]",
      contentType: "application/json",
    });
  });

  for (const route of ["/search/?q=anything", "/app/search/?q=anything"]) {
    requests = 0;
    await page.goto(route);
    await expect(page.locator("p[role='alert']")).toContainText(
      "לא הצלחנו לטעון את החיפוש",
    );
    await page.getByRole("button", { name: "לנסות שוב" }).click();
    await expect(page.getByRole("status")).toContainText("נמצאו 0 צעדים");
  }
});

test("saved-list storage failures are not shown as an empty state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === "ls_saved_lists_v1") {
        throw new DOMException("Storage unavailable", "SecurityError");
      }
      return getItem.call(this, key);
    };
  });

  await page.goto("/saved/");
  await expect(page.locator("p[role='alert']")).toContainText(
    "לא הצלחנו לטעון את הרשימות",
  );
  await expect(
    page.getByRole("heading", { name: "עדיין לא נשמרו רשימות" }),
  ).toHaveCount(0);
});

test("mobile navigation opens from the keyboard and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const navigation = page.locator("details");
  const trigger = navigation.locator("summary");
  await trigger.focus();
  await trigger.press("Enter");
  await expect(navigation).toHaveAttribute("open", "");

  await trigger.press("Escape");
  await expect(navigation).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("step controls support keyboard progress and an escapable reset dialog", async ({
  page,
}) => {
  await page.goto("/steps/buy-used-car/");

  const firstTask = page.getByRole("checkbox").first();
  await firstTask.focus();
  await firstTask.press(" ");
  await expect(firstTask).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText(/השלמת 1 מתוך 22 משימות/)).toBeVisible();

  const details = page.locator("article details summary").first();
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await details.press("Enter");
  await expect(details.locator("..")).toHaveAttribute("open", "");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await details.press("Enter");
  await expect(details.locator("..")).not.toHaveAttribute("open", "");
  await expect(details).toHaveAttribute("aria-expanded", "false");

  const reset = page.getByRole("button", { name: "אפס התקדמות" });
  await reset.focus();
  await reset.press("Enter");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "סגירת חלון" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
  await expect(reset).toBeFocused();
});
