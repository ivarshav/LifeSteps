import { expect, test } from "@playwright/test";

test("progress persists across reload and resets per step", async ({
  page,
}) => {
  await page.goto("/steps/buy-used-car/");
  const first = page.getByRole("checkbox").first();
  await expect(first).toHaveAttribute("aria-checked", "false");
  await first.click();
  await expect(first).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "אפס התקדמות" }).click();
  await page.getByRole("button", { name: "כן, אפס הכל" }).click();
  await expect(page.getByRole("checkbox").first()).toHaveAttribute(
    "aria-checked",
    "false",
  );
});
