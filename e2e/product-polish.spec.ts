import { expect, test, type Page } from "@playwright/test";

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("product shell exposes the active route and an accessible mobile drawer", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".product-shell")).toHaveCount(1);
  await expect(page.locator(".product-shell")).toHaveAttribute("lang", "tr");

  await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeVisible();
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(page.getByRole("complementary", { name: "Mobil menü" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bugün" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "Menüyü kapat" }).last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("complementary", { name: "Mobil menü" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeFocused();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
  expect(browserErrors).toEqual([]);
});

test("product controls preserve visible focus and reduced-motion behavior", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/decisions");

  await expect(page.getByRole("button", { name: "Sıfırla" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const scenario = page.getByLabel("Senaryo türü");
  await scenario.focus();
  await expect(scenario).toBeFocused();
  await expect(page.locator(".product-shell")).toBeVisible();
  await expect(page.locator(".product-drawer")).toHaveCount(0);
});

test("product routes remain overflow-free across required responsive viewports", async ({ page }) => {
  test.setTimeout(180_000);
  const browserErrors = collectBrowserErrors(page);
  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
    { width: 1728, height: 1117 },
  ];
  const routes = ["/dashboard", "/forecast", "/decisions", "/memory", "/reminders", "/coach", "/income", "/expenses", "/debts"];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Sayfa yükleniyor", { exact: true })).toHaveCount(0);
      await expect(page.locator(".product-shell")).toHaveCount(1);
      await expect(page.locator(".product-shell")).toBeVisible();
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow, `${route} should not overflow at ${viewport.width}x${viewport.height}`).toBe(false);
    }
  }

  expect(browserErrors).toEqual([]);
});
