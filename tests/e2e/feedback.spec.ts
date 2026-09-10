import { expect, test, type Page } from "@playwright/test";

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
  test(`local feedback remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/steps/rent-apartment/");

    const feedback = page.getByRole("heading", { name: "חסר משהו בצעד הזה?" });
    await feedback.scrollIntoViewIfNeeded();
    await expect(feedback).toBeVisible();
    await expect(
      page.getByText("הטיוטה נשמרת רק בדפדפן ובמכשיר הזה"),
    ).toBeVisible();

    const githubButton = page.getByRole("button", {
      name: "פתיחת הצעה ב-GitHub",
    });
    await expect(githubButton).toBeDisabled();

    const textArea = page.getByLabel("מה כדאי להוסיף או לשפר?");
    await textArea.fill("חסר קישור רשמי לשירות");
    const githubLink = page.getByRole("link", {
      name: /פתיחת הצעה ב-GitHub/,
    });
    await expect(githubLink).toHaveAttribute(
      "href",
      /github\.com\/ivarshav\/LifeSteps\/issues\/new\?/,
    );
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(
      page.getByText("ב-GitHub תידרש התחברות ובדיקה של הטיוטה לפני שליחה."),
    ).toBeVisible();

    const task = page.locator("[data-task-id]").first();
    await task.scrollIntoViewIfNeeded();
    await task.locator("summary").click();
    const taskFeedback = task.getByRole("button", { name: "כן" });
    await taskFeedback.click();
    await expect(taskFeedback).toHaveAttribute("aria-pressed", "true");
    await expectNoPageOverflow(page);
  });
}
