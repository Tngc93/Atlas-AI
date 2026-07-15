import { expect, test } from "@playwright/test";

test("public landing preserves its English product story and interactions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Turn financial data/ })).toBeVisible();
  await expect(page.locator("[data-intro-layer], .hands-intro-stage, .hands-intro-video")).toHaveCount(0);
  const backgroundVideo = page.locator("[data-background-video]");
  await expect(backgroundVideo).toHaveAttribute("autoplay", "");
  await expect(backgroundVideo).toHaveAttribute("muted", "");
  await expect(backgroundVideo.locator("source").last()).toHaveAttribute("src", "/media/atlas-jellyfish-1080.mp4");
  await expect(page.locator('source[src="/media/atlas-jellyfish.mp4"]')).toHaveCount(0);
  await expect(page.locator(".landing-title")).toHaveCSS("font-family", /Inter Tight/);
  await expect(page.locator(".landing-root")).toHaveCSS("font-family", /Barlow/);

  await expect(page.locator("video")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Product" })).toBeVisible();
  await expect(page.locator(".landing-header-cta")).toHaveAttribute("href", "/demo");
  await expect(page.locator(".landing-overlay, .video-overlay, [data-video-overlay]")).toHaveCount(0);

  await page.getByRole("link", { name: "Explore Atlas AI" }).first().click();
  await expect(page).toHaveURL(/#features$/);
  await expect(page.getByRole("heading", { name: /An open system/ })).toBeVisible();

  await page.getByRole("heading", { name: /See the outcome/ }).scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: "Salary Increase" }).click();
  await expect(page.getByText("₺19,850")).toBeVisible();

  await page.getByRole("heading", { name: /Clear boundaries/ }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "AI Provider Registry" }).click();
  await expect(page.getByText(/Optional explanation layer/)).toBeVisible();

  await page.locator(".landing-footer").scrollIntoViewIfNeeded();
  await expect(page.getByRole("navigation", { name: "Product links" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Resources links" })).toBeVisible();
  await expect(page.getByText("Built with an AI-assisted engineering workflow using Codex.")).toHaveCount(0);

  await page.waitForTimeout(700);
  await page.getByRole("link", { name: "Try the Live Demo" }).first().click();
  await expect(page).toHaveURL(/\/demo$/);
});

test("landing avoids mobile overflow and keeps dashboard reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

  await page.locator(".landing-footer").scrollIntoViewIfNeeded();
  await expect(page.getByRole("navigation", { name: "Legal links" })).toBeVisible();
  const footerHasHorizontalOverflow = await page.locator(".landing-footer").evaluate((footer) => footer.scrollWidth > footer.clientWidth);
  expect(footerHasHorizontalOverflow).toBe(false);

  const dashboardResponse = await page.request.get("/dashboard");
  expect(dashboardResponse.ok()).toBe(true);
});

test("reduced motion disables reveals and pauses the background frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator(".hero-reveal").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator("[data-background-video]")).toHaveCSS("display", "block");
  await expect(page.locator("[data-background-video]")).toHaveJSProperty("paused", true);
  await expect(page.locator("[data-background-video]")).toHaveJSProperty("currentSrc", "");
  await expect(page.locator("[data-intro-layer], .hands-intro-stage, .hands-intro-video")).toHaveCount(0);
});
