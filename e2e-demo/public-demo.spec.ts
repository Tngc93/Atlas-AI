import { expect, test } from "@playwright/test";

test("public demo boots without a database and resets ephemeral CRUD", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Demo Mode", { exact: true })).toBeVisible();
  await expect(page.getByText("Bu ayın karar özeti")).toBeVisible();

  await page.goto("/debts");
  const name = `Kurgusal test borcu ${Date.now()}`;
  await page.getByPlaceholder("Kurgusal borç adı").fill(name);
  await page.getByPlaceholder("Bakiye (TL)").fill("1000");
  await page.getByPlaceholder("Asgari ödeme (TL)").fill("100");
  await page.getByRole("button", { name: "Geçici borç ekle" }).click();
  await expect(page.getByText(name)).toBeVisible();

  await page.getByTestId("reset-demo-data").click();
  await expect(page.getByText(name)).toHaveCount(0);
});

test("refresh and separate browser contexts do not share demo finance state", async ({ browser }) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const firstPage = await first.newPage();
  const secondPage = await second.newPage();
  const name = `İzole demo gideri ${Date.now()}`;

  await firstPage.goto("/expenses");
  await firstPage.getByPlaceholder("Kurgusal gider adı").fill(name);
  await firstPage.getByPlaceholder("Kategori").fill("Demo");
  await firstPage.getByPlaceholder("Tutar (TL)").fill("500");
  await firstPage.getByRole("button", { name: "Geçici gider ekle" }).click();
  await expect(firstPage.getByText(name)).toBeVisible();

  await secondPage.goto("/expenses");
  await expect(secondPage.getByText(name)).toHaveCount(0);
  await firstPage.reload();
  await expect(firstPage.getByText(name)).toHaveCount(0);

  for (const page of [firstPage, secondPage]) {
    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage).filter((key) => key !== "finance-theme-mode"),
      session: Object.keys(sessionStorage),
      cookies: document.cookie,
    }));
    expect(storage).toEqual({ local: [], session: [], cookies: "" });
  }

  await first.close();
  await second.close();
});

test("demo pages use deterministic features and mock coach", async ({ page }) => {
  const checks = [
    ["/plan", "Aylık Plan"],
    ["/forecast", "Finansal Tahmin"],
    ["/decisions", "Karar Simülatörü"],
    ["/memory", "Finansal Hafıza"],
    ["/reminders", "Hatırlatmalar"],
    ["/coach", "Demo AI"],
  ] as const;

  for (const [path, text] of checks) {
    await page.goto(path);
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});
