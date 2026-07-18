import { expect, test, type Page } from "@playwright/test";

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Start Exploring" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

async function expectSingleActiveItem(page: Page, label: string) {
  const navigation = page.getByRole("navigation", { name: "Demo navigation" });
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
}

async function expectPlanSelectedWithoutCoachHighlight(page: Page) {
  const navigation = page.getByRole("navigation", { name: "Demo navigation" });
  const plan = navigation.getByRole("link", { name: "Plan", exact: true });
  const coach = navigation.getByRole("link", { name: "AI Coach", exact: true });

  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(plan).toHaveAttribute("aria-current", "page");
  await expect(plan).toHaveClass(/border-mint\/40/);
  await expect(plan).toHaveClass(/bg-mint\/10/);
  await expect(plan).toHaveClass(/text-mint/);
  await expect(plan.locator("span.absolute.bg-mint")).toHaveCount(1);
  await expect(coach).not.toHaveAttribute("aria-current", "page");
  await expect(coach).toHaveClass(/border-transparent/);
  await expect(coach).toHaveClass(/text-steel/);
  await expect(coach).not.toHaveClass(/border-mint\/40/);
  await expect(coach).not.toHaveClass(/bg-mint\/10/);
  await expect(coach.locator("span.absolute.bg-mint")).toHaveCount(0);
}

test("desktop demo navigation exposes exactly one active item on every route", async ({ page }) => {
  const routes = [
    ["/demo", "Dashboard"],
    ["/demo/plan", "Plan"],
    ["/demo/coach", "AI Coach"],
    ["/demo/forecast", "Forecast"],
    ["/demo/decisions", "Decision Simulator"],
    ["/demo/memory", "Financial Memory"],
    ["/demo/reminders", "Reminders"],
    ["/demo/income", "Income"],
    ["/demo/expenses", "Expenses"],
    ["/demo/debts", "Debts"],
  ] as const;

  for (const [route, label] of routes) {
    await page.goto(route);
    await dismissIntro(page);
    await expectSingleActiveItem(page, label);
  }
});

test("mobile demo navigation keeps one active item after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/coach");
  await dismissIntro(page);

  await page.getByRole("button", { name: "Open menu" }).click();
  await expectSingleActiveItem(page, "AI Coach");
  await page
    .getByRole("navigation", { name: "Demo navigation" })
    .getByRole("link", { name: "Forecast", exact: true })
    .click();
  await expect(page).toHaveURL(/\/demo\/forecast$/);

  await page.getByRole("button", { name: "Open menu" }).click();
  await expectSingleActiveItem(page, "Forecast");
});

test("only Plan uses the selected visual state across themes and navigation layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/demo/plan");
  await dismissIntro(page);

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expectPlanSelectedWithoutCoachHighlight(page);

  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectPlanSelectedWithoutCoachHighlight(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expectPlanSelectedWithoutCoachHighlight(page);
});
