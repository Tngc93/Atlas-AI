import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/product", "/product/dashboard", "/product/forecast", "/product/decision-simulator", "/product/financial-memory", "/product/reminders", "/product/ai-coach",
  "/architecture", "/architecture/finance-engine", "/architecture/repository", "/architecture/database", "/architecture/ai-provider-registry", "/architecture/self-hosting",
  "/docs", "/docs/getting-started", "/docs/installation", "/docs/configuration", "/docs/running-locally", "/docs/demo-mode", "/docs/postgresql", "/docs/ai-providers", "/docs/testing", "/docs/faq", "/docs/api-overview", "/docs/security", "/docs/self-hosting",
  "/security", "/contributing", "/roadmap", "/license", "/github",
] as const;

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("every public information-architecture route renders intentional content", async ({ page }) => {
  test.setTimeout(180_000);
  const browserErrors = collectBrowserErrors(page);

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should return a successful response`).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".public-site")).toHaveAttribute("lang", "en");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.locator(".landing-footer")).toBeAttached();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length, `${route} should have a useful meta description`).toBeGreaterThan(40);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  }

  expect(browserErrors).toEqual([]);
});

test("header, footer and GitHub destinations are deliberate and accessible", async ({ page, request }) => {
  await page.goto("/product");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Product" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "GitHub", exact: true }).first()).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("navigation", { name: "Open Source links" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Legal links" })).toBeVisible();

  const internalHrefs = await page.locator(".landing-header a, .landing-footer a").evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href && href.startsWith("/"))))]);
  for (const href of internalHrefs) {
    const response = await request.get(href);
    expect(response.ok(), `${href} should resolve`).toBe(true);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Product" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("public recovery, sitemap and robots routes are production-ready", async ({ page, request }) => {
  const missing = await page.goto("/this-public-route-does-not-exist");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This path is outside the Atlas." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("main").getByRole("link", { name: "Documentation" })).toHaveAttribute("href", "/docs");

  await page.goto("/offline");
  await expect(page.getByRole("heading", { name: "Atlas AI needs a connection for this route." })).toBeVisible();

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapBody = await sitemap.text();
  for (const route of ["/product", "/architecture", "/docs", "/security", "/contributing", "/roadmap", "/license", "/github"]) expect(sitemapBody).toContain(route);

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("sitemap.xml");
  expect(robotsBody).toContain("Disallow: /dashboard");
  expect(robotsBody).toContain("Disallow: /coach");

  const poster = await request.get("/media/atlas-jellyfish-poster.jpg");
  expect(poster.ok()).toBe(true);
  expect(poster.headers()["cache-control"]).toContain("stale-while-revalidate=604800");
});

test("core public pages remain overflow-free across the release viewport matrix", async ({ page }) => {
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
  const routes = ["/", "/product", "/architecture", "/docs", "/security", "/contributing", "/roadmap", "/license", "/github"];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasHorizontalOverflow, `${route} should not overflow at ${viewport.width}x${viewport.height}`).toBe(false);
    }
  }

  expect(browserErrors).toEqual([]);
});
