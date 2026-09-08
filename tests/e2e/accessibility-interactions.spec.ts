import { expect, test } from "@playwright/test";

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
  await expect(
    page.getByRole("button", { name: "סגירת חלון" }),
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
  await expect(reset).toBeFocused();
});
