import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

test("ilk kurulum akışı ve gerçek form submitleri çalışır", async ({ page }) => {
  test.setTimeout(60_000);

  const browserErrors = collectBrowserErrors(page);

  await page.goto("/");
  await expect(page.getByText("İlk kurulum")).toBeVisible();
  await expect(page.getByText("Güncel maaşını ekle")).toBeVisible();
  await expect(page.getByText("Zorunlu giderlerini yaz")).toBeVisible();
  await expect(page.getByText("Aktif borçlarını gir")).toBeVisible();

  await page.goto("/income");
  await page.getByLabel("Aylık maaş").fill("85.000,50");
  await page.getByLabel("Hayatta kalma eşiği").fill("12.000");
  await page.getByLabel("Maaş günü").first().fill("1");
  await page.getByRole("button", { name: "Gelir ekle" }).click();
  await expect(page.getByText("Gelir bilgileri kaydedildi.")).toBeVisible();

  await page.getByLabel("Maaş tutarı").fill("80.000");
  await page.getByLabel("Geçerlilik tarihi").fill("2026-07-01");
  await page.getByRole("button", { name: "Geçmişe ekle" }).click();
  await expect(page.getByText("Maaş geçmişi kaydı eklendi.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("80.000")).toBeVisible();

  await page.goto("/expenses");
  await page.getByLabel("Gider adı").fill("Örnek E2E Kira");
  await page.getByLabel("Kategori").selectOption("rent");
  await page.getByLabel("Tutar").fill("20.000");
  await page.getByLabel("Son ödeme günü").fill("5");
  await page.getByRole("button", { name: "Gider ekle" }).click();
  await expect(page.getByText("Gider kaydı eklendi.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Örnek E2E Kira")).toBeVisible();

  await page.goto("/debts");
  await page.getByLabel("Borç türü").selectOption("credit_card");
  await page.getByLabel("Banka veya alacaklı").fill("Örnek E2E Banka");
  await page.getByLabel("Borç adı").fill("Örnek E2E Kart");
  await page.getByLabel("Durum").selectOption("active");
  await page.getByLabel("Toplam borç").fill("30.000");
  await page.getByLabel("Kalan borç").fill("18.000");
  await page.getByLabel("Minimum ödeme").fill("2.000");
  await page.getByLabel("Manuel aylık faiz (%)").fill("4.25");
  await page.getByLabel("Son ödeme günü").fill("15");
  await page.getByRole("button", { name: "Borç ekle" }).click();
  await expect(page.getByText("Borç kaydı eklendi.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Örnek E2E Kart")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Aylık maaş")).toBeVisible();
  await expect(page.getByText("Borç öncelik sırası")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Finansal Durum" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bu Ay Yapılacaklar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Koç Yorumu" })).toBeVisible();
  await expect(page.getByText("Örnek E2E Kart", { exact: true })).toBeVisible();
  await expect(page.getByText("Manuel", { exact: true })).toBeVisible();

  await page.goto("/plan");
  await expect(page.getByText("Bu ayın aksiyon planı")).toBeVisible();
  await expect(page.getByText("Bu ay önerilen ödemeler")).toBeVisible();
  await expect(page.getByText("Örnek E2E Kart", { exact: true })).toBeVisible();

  await page.goto("/decisions");
  await expect(page.getByRole("heading", { name: "Karar Simülatörü" })).toBeVisible();
  await page.getByLabel("Senaryo türü").selectOption("extra_debt_payment");
  await page.getByLabel("Tutar").fill("3.000");
  await page.getByRole("button", { name: "Simüle Et" }).click();
  await expect(page.getByText("Senaryo hesaplandı.")).toBeVisible();
  await expect(page.getByText("İlk ay kalan borç farkı")).toBeVisible();
  await expect(page.getByText("Neden?")).toBeVisible();

  await page.getByLabel("Senaryo türü").selectOption("specific_debt_payment");
  await page.getByLabel("Tutar").fill("2.000");
  await page.getByLabel("Hedef borç").selectOption({ label: "Örnek E2E Kart" });
  await page.getByRole("button", { name: "Simüle Et" }).click();
  await expect(page.getByText("Belirli borca ekstra ödeme")).toBeVisible();

  await page.goto("/forecast");
  await expect(page.getByRole("heading", { name: "Finansal Tahmin" })).toBeVisible();
  await expect(page.getByText("24 ay sonu kalan borç")).toBeVisible();
  await expect(page.getByText("Tahmin dönemleri")).toBeVisible();
  await expect(page.getByText("Risk trendi")).toBeVisible();
  await expect(page.getByText("Forecast varsayımları")).toBeVisible();

  await page.goto("/memory");
  await expect(page.getByRole("heading", { name: "Finansal Hafıza" })).toBeVisible();
  await expect(page.getByText("Bu analiz sadece lokal SQLite verinize dayanır.")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/memory\?notice=memoryUpdated/, { timeout: 30_000 }),
    page.getByRole("button", { name: "Hafızayı güncelle" }).click(),
  ]);
  await expect(page.getByRole("status")).toContainText("Finansal hafıza güncellendi.");
  await expect(page.getByText("Deterministik koç içgörüleri")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("mobil görünümde ana akışlarda yatay taşma oluşmaz", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

  await page.setViewportSize({ width: 375, height: 812 });

  for (const path of ["/", "/income", "/debts", "/expenses", "/plan", "/decisions", "/forecast", "/memory"]) {
    await page.goto(path);
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow, `${path} mobil yatay taşma üretmemeli`).toBe(false);
  }
  expect(browserErrors).toEqual([]);
});

test("silme onayı iki aşamalıdır", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

  await page.goto("/expenses");
  await page.getByText("Örnek E2E Kira").click();
  await page.getByRole("button", { name: "Sil" }).first().click();
  await expect(page.getByText("Bu gider kaydı silinsin mi?")).toBeVisible();
  await page.getByRole("button", { name: "Vazgeç" }).click();
  await expect(page.getByText("Bu gider kaydı silinsin mi?")).toBeHidden();

  await page.getByRole("button", { name: "Sil" }).first().click();
  await page.getByRole("button", { name: "Eminim sil" }).click();
  await expect(page.getByText("Gider kaydı silindi.")).toBeVisible();
  expect(browserErrors).toEqual([]);
});
