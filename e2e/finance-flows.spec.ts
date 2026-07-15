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

async function assertNoHorizontalOverflow(page: Page, context: string) {
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  expect(hasHorizontalOverflow, `${context} yatay taşma üretmemeli`).toBe(false);
}

async function assertVisibleTexts(page: Page, texts: string[]) {
  for (const text of texts) {
    await expect
      .poll(async () => {
        const matches = page.getByText(text, { exact: true });
        const count = await matches.count();
        for (let index = 0; index < count; index += 1) {
          if (await matches.nth(index).isVisible()) return true;
        }
        return false;
      }, { message: `"${text}" görünür olmalı` })
      .toBe(true);
  }
}

test("ilk kurulum akışı ve gerçek form submitleri çalışır", async ({ page }) => {
  test.setTimeout(60_000);

  const browserErrors = collectBrowserErrors(page);

  await page.goto("/dashboard");
  await expect(page.getByText("İlk kurulum")).toBeVisible();
  await expect(page.getByText("Güncel maaşını ekle")).toBeVisible();
  await expect(page.getByText("Zorunlu giderlerini yaz")).toBeVisible();
  await expect(page.getByText("Aktif borçlarını gir")).toBeVisible();

  await page.goto("/income");
  await page.getByLabel("Aylık maaş").fill("85.000,50");
  await page.getByLabel("Hayatta kalma eşiği").fill("12.000");
  await page.getByLabel("Maaş günü").first().selectOption("1");
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
  await page.getByLabel("Son ödeme günü").selectOption("5");
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
  await expect(page.getByText("₺7.200")).toBeVisible();
  await page.getByLabel("Manuel aylık faiz (%)").fill("4.25");
  await page.getByLabel("Son ödeme günü").selectOption("15");
  await page.getByRole("button", { name: "Borç ekle" }).click();
  await expect(page.getByText("Borç kaydı eklendi.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Örnek E2E Kart")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 2, name: "Hatırlatmalar" })).toBeVisible();
  await expect(page.getByText("Dikkat gerektirenler")).toBeVisible();
  await expect(page.getByText("Tümünü aç")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bu ayın karar özeti" })).toBeVisible();
  await assertVisibleTexts(page, [
    "Önce korunması gereken şey",
    "En önemli risk",
    "Sıradaki güvenli adım",
    "Neden?",
    "Bu özet hesaplama motorundan gelir; son karar sizindir.",
  ]);
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

  await page.goto("/reminders");
  await expect(page.getByRole("heading", { level: 1, name: "Hatırlatmalar" })).toBeVisible();
  await expect(page.getByText("Dış bildirim, e-posta veya SMS gönderilmez.")).toBeVisible();

  await page.goto("/decisions");
  await expect(page.getByRole("heading", { name: "Karar Simülatörü" })).toBeVisible();
  await page.getByLabel("Senaryo türü").selectOption("extra_debt_payment");
  await page.getByLabel("Tutar").fill("3.000");
  await page.getByRole("button", { name: "Simüle Et" }).click();
  await expect(page.getByText("Senaryo hesaplandı.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Karar çerçevesi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trade-off özeti" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kısa ve uzun vade etkisi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Detay farklar" })).toBeVisible();
  await expect(page.getByText("Son karar sizindir")).toBeVisible();
  await expect(page.getByText("İlk ay kalan borç farkı")).toBeVisible();
  await expect(page.locator("p").filter({ hasText: /^Günlük limit farkı:/ })).toBeVisible();
  await expect(page.getByText("Neden?")).toBeVisible();

  await page.getByLabel("Senaryo türü").selectOption("specific_debt_payment");
  await page.getByLabel("Tutar").fill("2.000");
  await page.getByLabel("Hedef borç").selectOption({ label: "Örnek E2E Kart" });
  await page.getByRole("button", { name: "Simüle Et" }).click();
  await expect(page.getByText("Belirli borca ekstra ödeme")).toBeVisible();

  await page.goto("/forecast");
  await expect(page.getByRole("heading", { name: "Finansal Tahmin" })).toBeVisible();
  await expect(page.getByText("24 ay sonu kalan borç")).toBeVisible();
  await expect(page.getByText("Bu tahmin neye dayanıyor?")).toBeVisible();
  await expect(page.getByText("Senaryo karşılaştır")).toBeVisible();
  await expect(page.getByText("Tahmin dönemleri")).toBeVisible();
  await expect(page.getByText("Risk trendi")).toBeVisible();
  await expect(page.getByText("Risk zaman çizgisi")).toBeVisible();
  await expect(page.getByText("İstersen deneyebileceğin senaryolar")).toBeVisible();
  await expect(page.getByText("Forecast varsayımları")).toBeVisible();
  await page.getByLabel("Senaryo türü").selectOption("salary_increase");
  await page.getByLabel("Tutar").fill("5.000");
  await page.getByRole("button", { name: "Karşılaştır" }).click();
  await expect(page.getByText("Geçici senaryo sonucu")).toBeVisible();
  await expect(page.getByText("Mevcut veri değişmedi")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Karşılaştırma özeti" })).toBeVisible();
  await expect(page.getByText("Detay farklar")).toBeVisible();
  await expect(page.getByText("İyileşen taraflar")).toBeVisible();
  await expect(page.getByText("Zorlaşan taraflar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trade-off" })).toBeVisible();
  await expect(page.getByText("Risk etkisi")).toBeVisible();
  await expect(page.getByText("Ödeme kapasitesi etkisi")).toBeVisible();
  await expect(page.getByText("Geçici senaryo karşılaştırıldı. Mevcut verileriniz değişmedi.")).toBeVisible();

  await page.goto("/memory");
  await expect(page.getByRole("heading", { name: "Finansal Hafıza" })).toBeVisible();
  await expect(page.getByText("Bu analiz kayıtlı finansal hafıza snapshot’larına dayanır.", { exact: false })).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/memory\?notice=memoryUpdated/, { timeout: 30_000 }),
    page.getByRole("button", { name: "Hafızayı güncelle" }).click(),
  ]);
  await expect(page.getByRole("status")).toContainText("Finansal hafıza güncellendi.");
  await expect(page.getByText("Deterministik koç içgörüleri")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("responsive smoke: ana finansal sayfalarda yatay taşma ve kritik metinler korunur", async ({ page }) => {
  test.setTimeout(90_000);

  const browserErrors = collectBrowserErrors(page);
  const viewports = [
    { label: "mobil", width: 375, height: 812 },
    { label: "tablet", width: 768, height: 1024 },
    { label: "desktop", width: 1440, height: 1000 },
  ];
  const pages = [
    {
      path: "/dashboard",
      texts: ["Bu ayın karar özeti", "Önce korunması gereken şey", "En önemli risk", "Sıradaki güvenli adım", "Neden?"],
    },
    {
      path: "/coach",
      texts: ["Bu yorum şunlara dayanıyor", "Bu ayın hesaplama özeti", "Finansal hafıza durumu", "Trendler"],
    },
    {
      path: "/plan",
      texts: ["Aylık plan"],
    },
    {
      path: "/decisions",
      texts: ["Karar Simülatörü"],
    },
    {
      path: "/reminders",
      texts: ["Uygulama içi hatırlatma", "Hatırlatmalar"],
    },
    {
      path: "/forecast",
      texts: ["Finansal Tahmin", "Bu tahmin neye dayanıyor?", "Senaryo karşılaştır", "İstersen deneyebileceğin senaryolar"],
    },
    {
      path: "/memory",
      texts: ["Finansal Hafıza"],
    },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const item of pages) {
      await page.goto(item.path);
      await assertNoHorizontalOverflow(page, `${viewport.label} ${item.path}`);
      await assertVisibleTexts(page, item.texts);
    }
  }

  expect(browserErrors).toEqual([]);
});

test("AI sağlayıcı ayarları anahtarı yalnız geçici oturumda tutar", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  const temporaryKey = "temporary-browser-key-for-e2e";

  await page.route("http://127.0.0.1:1234/v1/models", async (route) => {
    const headers = route.request().headers();
    expect(headers.authorization).toBe(`Bearer ${temporaryKey}`);
    expect(route.request().postData()).toBeNull();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });
  await page.route("http://127.0.0.1:1234/v1/chat/completions", async (route) => {
    const headers = route.request().headers();
    expect(headers.authorization).toBe(`Bearer ${temporaryKey}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Geçici sağlayıcı bağlantısı doğrulandı.",
                strengths: ["Deterministik özet korunuyor."],
                risks: ["Bu bağlantı yalnız açık sekmede geçerlidir."],
                recommendations: ["Son kararı mevcut hesaplama sonuçlarıyla birlikte gözden geçir."],
                priority: "LOW",
                confidence: 0.8,
              }),
            },
          },
        ],
      }),
    });
  });

  await page.goto("/coach");
  await expect(page.getByRole("heading", { name: "AI Sağlayıcı Ayarları" })).toBeVisible();
  await page.getByRole("button", { name: "Kendi anahtarım" }).click();
  await page.getByRole("combobox", { name: "Sağlayıcı" }).selectOption("lm-studio");
  await expect(page.getByRole("combobox", { name: "Sağlayıcı" }).locator("option[value='openai']"),).toHaveCount(0);
  await expect(page.getByLabel("Base URL")).toHaveAttribute("readonly", "");
  await page.getByLabel(/API anahtarı/).fill(temporaryKey);
  await page.getByRole("button", { name: "Bağlantıyı test et" }).click();
  await expect(page.getByText("Bağlantı doğrulandı. Henüz finansal özet gönderilmedi.")).toBeVisible();
  await page.getByRole("button", { name: "Koç yorumunu oluştur" }).click();
  await expect(page.getByText("Bağlı. Koç yorumu seçtiğiniz sağlayıcıdan alındı.")).toBeVisible();
  await expect(page.getByText("Geçici sağlayıcı bağlantısı doğrulandı.", { exact: true })).toBeVisible();

  const persistedStorage = await page.evaluate(async () =>
    JSON.stringify({
      local: Object.entries(localStorage),
      session: Object.entries(sessionStorage),
      indexedDb: await indexedDB.databases(),
      cookie: document.cookie,
      url: window.location.href,
    }),
  );
  expect(persistedStorage).not.toContain(temporaryKey);

  await page.getByRole("button", { name: "Bağlantıyı kes" }).click();
  await expect(page.getByText("Bağlantı kesildi. Geçici anahtar temizlendi.")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Kendi anahtarım" }).click();
  await page.getByRole("combobox", { name: "Sağlayıcı" }).selectOption("lm-studio");
  await expect(page.getByLabel(/API anahtarı/)).toHaveValue("");

  await page.goto("/plan");
  await page.goto("/coach");
  await page.getByRole("button", { name: "Kendi anahtarım" }).click();
  await page.getByRole("combobox", { name: "Sağlayıcı" }).selectOption("lm-studio");
  await expect(page.getByLabel(/API anahtarı/)).toHaveValue("");
  expect(browserErrors).toEqual([]);
});

test("browser provider hatası ham response göstermeden güvenli mesaj üretir", async ({ page }) => {
  await page.route("http://127.0.0.1:1234/v1/models", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "raw-secret-provider-body" }) });
  });

  await page.goto("/coach");
  await page.getByRole("button", { name: "Kendi anahtarım" }).click();
  await page.getByRole("combobox", { name: "Sağlayıcı" }).selectOption("lm-studio");
  await page.getByLabel(/API anahtarı/).fill("temporary-invalid-key");
  await page.getByRole("button", { name: "Bağlantıyı test et" }).click();
  await expect(page.getByText("AI sağlayıcısı anahtarı doğrulayamadı.")).toBeVisible();
  await expect(page.getByText("raw-secret-provider-body")).toHaveCount(0);
});

test("borç formu minimum ödeme ve gün seçici davranışlarını korur", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

  await page.goto("/debts");
  await page.getByRole("button", { name: "Borç ekle" }).click();
  await expect(page.getByLabel("Banka veya alacaklı").first()).toBeFocused();
  await expect(page.getByLabel("Banka veya alacaklı").first()).toHaveJSProperty("validity.valueMissing", true);

  await page.getByLabel("Borç türü").first().selectOption("credit_card");
  await page.getByRole("textbox", { name: /^Kalan borç/ }).first().fill("10.000");
  await expect(page.getByText("₺4.000")).toBeVisible();
  await expect(page.getByText("Kredi kartı için kalan borcun %40’ı otomatik hesaplanır.").first()).toBeVisible();
  await page.getByLabel("Son ödeme günü").first().selectOption("10");
  await page.getByLabel("Hesap kesim günü").first().selectOption("3");

  await page.getByLabel("Borç türü").first().selectOption("personal_loan");
  await page.getByLabel("Banka veya alacaklı").first().fill("Örnek E2E Finans");
  await page.getByLabel("Borç adı").first().fill("Örnek E2E Kredi");
  await page.getByLabel("Toplam borç").first().fill("50.000");
  await page.getByRole("textbox", { name: /^Kalan borç/ }).first().fill("40.000");
  await page.getByRole("textbox", { name: /^Minimum ödeme/ }).first().fill("5.000");
  await page.getByLabel("Son ödeme günü").first().selectOption("20");
  await page.getByRole("button", { name: "Borç ekle" }).click();
  await expect(page.getByText("Borç kaydı eklendi.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Örnek E2E Kredi")).toBeVisible();

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
