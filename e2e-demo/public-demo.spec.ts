import { expect, test, type Page } from "@playwright/test";

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Start Exploring" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

async function openDemoRoute(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Demo navigation" }).getByRole("link", { name, exact: true }).click();
}

async function gotoAfterDevReload(page: Page, route: string) {
  try {
    await page.goto(route);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("ERR_ABORTED")) throw error;
    await page.goto(route);
  }
}

async function expectEnglishDemoCopy(page: Page) {
  const visibleText = await page.locator("body").innerText();
  const turkishUserFacingCopy =
    /[çğıöşüİÇĞÖŞÜ]|\b(?:Bu|için|önce|gün|kaldı|maaş|borç|gider|gelir|ödeme|yaşam|bütçe|görünüyor|yaklaşıyor|zorunlu|asgari|güvenli|kontrol|örnek|faturalar|ulaşım|barınma|seyahat|mağazası)\b/i;

  expect(visibleText).not.toMatch(turkishUserFacingCopy);
}

test("public demo entry explains boundaries without blocking exploration", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator(".product-shell")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Explore Atlas AI safely." })).toBeVisible();
  await expect(page.getByText("Nothing is connected to a bank, stored in a database or retained after the session ends.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Public Demo/ })).toBeVisible();

  await page.getByRole("button", { name: "How the Demo Works" }).click();
  const safety = page.getByRole("dialog", { name: "How the public demo works" });
  await expect(safety).toBeVisible();
  for (const boundary of ["Synthetic Data", "Session Isolated", "No Persistence", "Mock AI"]) await expect(safety.getByText(boundary, { exact: true })).toBeVisible();
  await expect(safety).toContainText("No bank or financial account connection");
  await page.keyboard.press("Escape");
  await expect(safety).toHaveCount(0);
  await expect(page.getByRole("button", { name: "How the Demo Works" })).toBeFocused();

  await page.getByRole("button", { name: "Start Exploring" }).click();
  await expect(page.getByTestId("demo-onboarding")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("demo navigation stays under the canonical demo route", async ({ page }) => {
  await page.goto("/demo");
  await dismissIntro(page);
  const expected = [
    ["Dashboard", "/demo"], ["Plan", "/demo/plan"], ["AI Coach", "/demo/coach"], ["Forecast", "/demo/forecast"],
    ["Decision Simulator", "/demo/decisions"], ["Financial Memory", "/demo/memory"], ["Reminders", "/demo/reminders"],
    ["Income", "/demo/income"], ["Expenses", "/demo/expenses"], ["Debts", "/demo/debts"],
  ] as const;
  const nav = page.getByRole("navigation", { name: "Demo navigation" });
  for (const [name, href] of expected) await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);

  await openDemoRoute(page, "Income");
  await expect(page).toHaveURL(/\/demo\/income$/);
  await expect(page.getByRole("heading", { name: "Income", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Income", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByLabel("Fictional monthly salary (TRY)")).toHaveValue("150000");
  await expect(page.getByText("₺150,000", { exact: true })).toBeVisible();

  await openDemoRoute(page, "Plan");
  await expect(page.getByText("₺150,000", { exact: true })).toBeVisible();
});

test("temporary CRUD, memory and Mock AI state reset together", async ({ page }) => {
  const debtName = `Fictional reset debt ${Date.now()}`;
  const expenseName = `Fictional reset expense ${Date.now()}`;
  await page.goto("/demo");
  await dismissIntro(page);

  await openDemoRoute(page, "Debts");
  await page.getByLabel("Debt label").fill(debtName);
  await page.getByLabel("Balance (TRY)").fill("1000");
  await page.getByLabel("Minimum payment (TRY)").fill("100");
  await page.getByRole("button", { name: "Add temporary debt" }).click();
  await expect(page.getByText(debtName)).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Temporary debt added");

  await openDemoRoute(page, "Expenses");
  await page.getByLabel("Expense label").fill(expenseName);
  await page.getByLabel("Category").fill("Demo");
  await page.getByLabel("Amount (TRY)").fill("500");
  await page.getByRole("button", { name: "Add temporary expense" }).click();
  await expect(page.getByText(expenseName)).toBeVisible();

  await openDemoRoute(page, "Financial Memory");
  await page.getByRole("button", { name: "Refresh temporary snapshot" }).click();
  await expect(page.getByRole("status")).toContainText("Financial Memory refreshed");

  await openDemoRoute(page, "AI Coach");
  await page.getByRole("button", { name: "Generate Mock AI explanation" }).click();
  await expect(page.getByText("Demo explanation generated by Mock AI")).toBeVisible();

  const resetTrigger = page.getByTestId("reset-demo-data");
  await resetTrigger.click();
  const resetDialog = page.getByRole("dialog", { name: "Reset the public demo?" });
  await expect(resetDialog).toBeVisible();
  await expect(resetDialog.getByRole("button", { name: "Reset Demo" })).toBeFocused();
  await resetDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(resetTrigger).toBeFocused();
  await resetTrigger.click();
  await resetDialog.getByRole("button", { name: "Reset Demo" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("status")).toContainText("Original fictional data restored");

  await openDemoRoute(page, "Debts");
  await expect(page.getByText(debtName)).toHaveCount(0);
  await openDemoRoute(page, "Expenses");
  await expect(page.getByText(expenseName)).toHaveCount(0);
  await openDemoRoute(page, "AI Coach");
  await expect(page.getByText("Demo explanation generated by Mock AI")).toHaveCount(0);
});

test("refresh, new tab and new browser context restore the immutable seed", async ({ browser }) => {
  const context = await browser.newContext();
  const firstPage = await context.newPage();
  const secondPage = await context.newPage();
  const marker = `Isolated expense ${Date.now()}`;

  await firstPage.goto("/demo/expenses");
  await firstPage.getByLabel("Expense label").fill(marker);
  await firstPage.getByLabel("Category").fill("Demo");
  await firstPage.getByLabel("Amount (TRY)").fill("500");
  await firstPage.getByRole("button", { name: "Add temporary expense" }).click();
  await expect(firstPage.getByText(marker)).toBeVisible();

  await secondPage.goto("/demo/expenses");
  await expect(secondPage.getByText(marker)).toHaveCount(0);
  await firstPage.reload();
  await expect(firstPage.getByText(marker)).toHaveCount(0);

  const separateContext = await browser.newContext();
  const separatePage = await separateContext.newPage();
  await separatePage.goto("/demo/expenses");
  await expect(separatePage.getByText(marker)).toHaveCount(0);
  await separateContext.close();
  await context.close();
});

test("demo financial state leaves no browser persistence artifact", async ({ page }) => {
  const marker = `No storage debt ${Date.now()}`;
  await page.goto("/demo/debts");
  await page.getByLabel("Debt label").fill(marker);
  await page.getByLabel("Balance (TRY)").fill("1000");
  await page.getByLabel("Minimum payment (TRY)").fill("100");
  await page.getByRole("button", { name: "Add temporary debt" }).click();

  const evidence = await page.evaluate(async (value) => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
    databases: typeof indexedDB.databases === "function" ? (await indexedDB.databases()).map((database) => database.name) : [],
    caches: "caches" in window ? await caches.keys() : [],
    cookies: document.cookie,
    history: JSON.stringify(history.state),
    url: location.href,
    workers: "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
    marker: value,
  }), marker);

  expect(evidence.local.filter(([key]) => key !== "finance-theme-mode")).toEqual([]);
  expect(evidence.session).toEqual([]);
  expect(evidence.databases).toEqual([]);
  expect(evidence.caches).toEqual([]);
  expect(evidence.cookies).toBe("");
  expect(evidence.history).not.toContain(marker);
  expect(evidence.url).not.toContain(marker);
  expect(evidence.workers).toBe(0);
});

test("forecast, simulator, reminders and Mock AI remain reversible and network-free", async ({ page }) => {
  const forbiddenRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/|neon|openai\.com|googleapis\.com|anthropic\.com|openrouter\.ai/i.test(request.url())) forbiddenRequests.push(request.url());
  });

  await page.goto("/demo/forecast");
  await page.getByRole("button", { name: "Compare a 10% expense decrease" }).click();
  await expect(page.getByText("Hypothetical scenario result")).toBeVisible();
  await page.reload();
  await expect(page.getByText("No temporary comparison selected")).toBeVisible();

  await openDemoRoute(page, "Decision Simulator");
  await page.getByLabel("Scenario type").selectOption("salary_increase");
  await page.getByLabel("Amount (TRY)").fill("2500");
  await page.getByRole("button", { name: "Run scenario" }).click();
  await expect(page.getByText("No permanent data was changed")).toBeVisible();

  await openDemoRoute(page, "Reminders");
  await expect(page.getByRole("heading", { name: "Reminders", exact: true })).toBeVisible();
  const dismissButtons = page.getByRole("button", { name: "Dismiss for this session" });
  await expect(dismissButtons.first()).toBeVisible();
  const originalCount = await dismissButtons.count();
  expect(originalCount).toBeGreaterThan(0);
  await dismissButtons.first().click();
  await expect(dismissButtons).toHaveCount(originalCount - 1);
  await page.reload();
  await expect(page.getByRole("button", { name: "Dismiss for this session" })).toHaveCount(originalCount);

  await openDemoRoute(page, "AI Coach");
  await page.getByRole("button", { name: "Generate Mock AI explanation" }).click();
  await expect(page.getByText("No OpenAI, Gemini, Anthropic or OpenRouter request occurred.")).toBeVisible();
  expect(forbiddenRequests).toEqual([]);
});

test("unsupported persistence and routes fail closed without technical leakage", async ({ page, request }) => {
  const response = await request.post("/api/coach", { data: { financialData: "must-not-be-accepted" } });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error).toContain("unavailable in the public demo");
  expect(JSON.stringify(body)).not.toMatch(/Prisma|DATABASE_URL|stack|provider response/i);

  await page.goto("/demo/unsupported-persistence");
  await expect(page.getByRole("heading", { name: "This feature is unavailable in the public demo." })).toBeVisible();
  await expect(page.getByText("No persistence operation was attempted.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to Demo" })).toHaveAttribute("href", "/demo");
});

test("demo controls remain accessible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  await dismissIntro(page);
  const indicator = page.getByRole("button", { name: /Public Demo/ });
  await indicator.click();
  await expect(page.getByRole("dialog", { name: "How the public demo works" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(indicator).toBeFocused();
  await expect(page.getByTestId("reset-demo-data")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test("all demo routes expose the indicator without overflow or console errors", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectBrowserErrors(page);
  const viewports = [
    { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1440, height: 1000 }, { width: 1728, height: 1117 },
  ];
  const routes = ["/demo", "/demo/income", "/demo/debts", "/demo/expenses", "/demo/plan", "/demo/forecast", "/demo/decisions", "/demo/memory", "/demo/reminders", "/demo/coach"];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: /Public Demo/ })).toBeVisible();
      await expectEnglishDemoCopy(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `${route} at ${viewport.width}x${viewport.height}`).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});

test("public website demo calls to action use the canonical entry", async ({ page }) => {
  for (const route of ["/", "/product", "/architecture", "/docs", "/this-route-does-not-exist"]) {
    await gotoAfterDevReload(page, route);
    const links = page.locator('a[href^="/demo"]');
    const count = await links.count();
    expect(count, `${route} should expose a demo recovery or CTA`).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) await expect(links.nth(index)).toHaveAttribute("href", "/demo");
  }
});
