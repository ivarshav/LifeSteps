import { expect, test } from "@playwright/test";

test("root layout is Hebrew and RTL", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", "he");
  await expect(html).toHaveAttribute("dir", "rtl");
});

test("no horizontal overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("browser extension attributes do not cause a hydration mismatch", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text().includes("hydration-mismatch")
    ) {
      hydrationErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    const injectExtensionAttribute = () => {
      if (!document.body) return false;
      document.body.dataset.testimMainWordScriptsLoaded = "true";
      return true;
    };

    if (!injectExtensionAttribute()) {
      const observer = new MutationObserver(() => {
        if (injectExtensionAttribute()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  });

  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute(
    "data-testim-main-word-scripts-loaded",
    "true",
  );
  await page.waitForTimeout(500);

  expect(hydrationErrors).toEqual([]);
});
