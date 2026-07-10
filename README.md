# Kişisel Finans Koçu Paneli

Türkiye / TRY odağında maaş planlama, kredi kartı borcu kapatma, zorunlu gider takibi, nakit akışı riski ve eğitim amaçlı finans koçu yorumları için gizlilik odaklı bir kontrol paneli.

Uygulama PostgreSQL geçiş hazırlığındadır. Prisma provider PostgreSQL olarak ayarlanmış, production Neon branch ise boş ve dokunulmamış bırakılmıştır. Başlangıçta gerçek veri veya otomatik seed yoktur.

## Product Philosophy

This project is governed by the Product Manifesto:
docs/product/PRODUCT_MANIFESTO.md

## Production Readiness

Vercel/production hazırlık notları:
docs/operations/production-readiness.md

PostgreSQL baseline ve test altyapısı yalnız izole Neon `test-preview` branch'i için hazırlanmıştır. Production branch'e migration uygulanmamıştır. Gerçek kişisel finans verisiyle production kullanım için authentication ve kullanıcı bazlı veri izolasyonu hâlâ zorunludur.

## Teknoloji Yığını

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Recharts
- Mock-first AI provider katmanı
- Gemini provider ve OpenAI placeholder katmanı
- TCMB faiz verisi sağlayıcı yer tutucusu

## Başlangıç

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Ortam Değişkenleri

`.env.example` dosyasından `.env.local` oluşturun:

```bash
DATABASE_URL=
DIRECT_URL=
AI_PROVIDER=mock
AI_DAILY_REQUEST_LIMIT=20
AI_MONTHLY_BUDGET_LIMIT_TRY=100
AI_MAX_INPUT_SUMMARY_CHARS=4000
OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=12000
GEMINI_RETRY_COUNT=2
```

Varsayılan sağlayıcı `mock` değeridir. Gemini kullanmak için kendi `.env.local` dosyanızda `AI_PROVIDER=gemini` yapın ve `GEMINI_API_KEY` değerini yalnızca lokal ortamda doldurun. Anahtarı README, kod, test, commit veya GitHub'a eklemeyin.

Gemini sağlayıcısı şu şekilde çalışır:

- Varsayılan model `gemini-2.5-flash`; gerekirse `GEMINI_MODEL` ile değiştirilebilir.
- API key eksikse, timeout olursa, Gemini hata döndürürse veya JSON doğrulama başarısız olursa uygulama otomatik olarak Mock Provider'a döner.
- AI'ya yalnızca deterministik finans motorunun ürettiği minimize özet gönderilir; isim, IBAN, hesap numarası, kart numarası, işlem açıklaması veya ham banka hareketi gönderilmez.
- Aynı finansal özet tekrar geldiğinde cache kullanılır; gereksiz Gemini çağrısı yapılmaz.

Önemli notlar:

- `DATABASE_URL` lokal `.env.local` içinde açıkça tanımlanmalıdır. Production ortamında sessiz SQLite fallback davranışına güvenilmemelidir.
- `DIRECT_URL` Prisma migration işlemleri için aynı Neon branch'in direct bağlantısı olmalıdır.
- Production branch bağlantıları integration test veya E2E için kullanılmamalıdır.
- API anahtarlarını istemci tarafı koda koymayın.
- Anahtarı `NEXT_PUBLIC_` ile başlatmayın.
- AI provider kodu server-only çalışır.
- `/api/coach` client payload'a güvenmez; server tarafında mevcut aylık plan snapshot'ından minimize edilmiş özet üretir.
- Canlı AI sağlayıcısı seçiliyse yalnız minimize edilmiş finans özeti gönderilebilir; ham Prisma kayıtları, isim, IBAN, kart numarası, işlem açıklaması ve kişisel notlar gönderilmez.

## Mevcut Sayfalar

- `/` panel özeti
- `/income` güncel maaş, maaş günü ve maaş geçmişi CRUD
- `/debts` borçlar ve kredi kartları CRUD
- `/expenses` zorunlu giderler CRUD
- `/plan` kayıtlı finans verisine dayalı deterministik aylık borç kapatma yol haritası
- `/decisions` gerçek kayıtları değiştirmeyen deterministik karar simülatörü
- `/reminders` yaklaşan ödeme, maaş günü, risk ve eksik kayıt sinyalleri için uygulama içi hatırlatmalar
- `/forecast` 3, 6, 12 ve 24 aylık deterministik finansal tahmin ekranı
- `/memory` aylık snapshot’lardan finansal davranış ve trend hafızası

## Veri ve Gizlilik

- Uygulama başlangıçta gerçek veri veya otomatik seed oluşturmaz.
- `src/lib/sample-data/finance.ts` yalnızca test/demo amaçlı kurgusal örnek veridir; gerçek dashboard akışında kullanılmaz.
- Prisma şeması `prisma/schema.prisma` içinde tanımlıdır.
- Eski SQLite migration geçmişi `prisma/migrations-sqlite` altında arşivlenir ve PostgreSQL'e uygulanmaz.
- `.env.local` git dışında bırakılır.
- Production Neon branch bu aşamada boş kalır; yalnız test branch'i kurgusal test verisiyle kullanılabilir.
- Banka senkronizasyonu, otomatik ödeme veya bulut kalıcılığı dahil değildir.
- API anahtarları, SQLite veritabanı dosyaları ve yedekler commit edilmemelidir.
- Testlerde, mock verilerde ve dokümantasyon örneklerinde gerçek finansal veri kullanılmamalıdır.
- GitHub'a push öncesi `.gitignore`, dry-run stage ve secret taraması yapılmalıdır.

## Faz 3 CRUD Notları

- Authentication yoktur; uygulama tek kullanıcı varsayımıyla çalışır ve public beta için hazır değildir.
- Gelir yönetimi `Profile` üzerinde güncel maaşı, `SalaryRecord` üzerinde maaş geçmişini tutar.
- Maaş güncellemesi otomatik maaş geçmişi kaydı oluşturmaz.
- Borç silme ve gider silme bu fazda hard delete olarak uygulanır.
- Formlarda TL girilir, veritabanında kuruş saklanır.
- UI durumları Türkçedir: loading, success, error ve boş durumlar.
- Business logic UI içinde değil, repository, Server Actions ve finance calculation engine katmanlarında tutulur.

## TCMB Faiz Verisi

Sağlayıcı yapısı `src/features/rates/tcmb-provider.ts` içinde bulunur.

Bu fazda yeni TCMB entegrasyonu yapılmaz. Mevcut sağlayıcı yapısı sonraki fazlar için yer tutucu olarak durur. Planlanan birincil kaynak resmi TCMB kredi kartı azami faiz oranları sayfasıdır:

https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Bankacilik+Verileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari

Bu oranlar yasal azami bağlamdır; sizin kartınıza uygulanan kesin oran olmayabilir. Gerçek karta özel aylık faiz oranını her zaman elle girin.

## Forecast Engine

`/forecast` sayfası mevcut kayıtlardan 3, 6, 12 ve 24 aylık finansal projeksiyon üretir.

- Finans motoru tek hesaplama kaynağıdır.
- Forecast sonuçları veritabanına kaydedilmez.
- AI/OpenAI/Gemini çağrısı yapılmaz.
- Pasif ve kapanmış borçlar tahmine dahil edilmez.
- Çıktılar tahmin ve karar desteği niteliğindedir; kesin finansal tavsiye değildir.

## Financial Memory

`/memory` sayfası gelir, borç, gider, risk ve yaşam bütçesi snapshot’larını aylık olarak tutar.

- Memory snapshot’ları aynı ay içinde tekrar üretilirse güncellenir.
- CRUD işlemlerinden sonra memory kaydı best-effort denenir; ana kayıt akışı bu işleme bağımlı değildir.
- Kullanıcı `/memory` üzerinde `Hafızayı güncelle` butonuyla manuel snapshot oluşturabilir.
- Trendler için en az iki aylık geçmiş gerekir; geçmiş azsa ekran açıkça `Yeterli geçmiş yok` der.
- Financial Memory AI/OpenAI/Gemini çağrısı yapmaz ve üçüncü partiye finansal veri göndermez.

## Reminder Engine

`/reminders` sayfası ve dashboard hatırlatma paneli, mevcut finans motoru çıktılarından uygulama içi hatırlatmalar üretir.

- Hatırlatmalar yalnızca uygulama içinde görünür; push notification, e-posta, SMS veya dış servis yoktur.
- Reminder içeriği veritabanına yazılmaz; veritabanı yalnızca `Görüldü`, `Ertele` ve `Gizle` durumlarını saklar.
- Yaklaşan borç son ödeme tarihleri, maaş günü, zorunlu gider tarihi, yüksek risk, eksik kayıt ve eksik faiz sinyalleri deterministik olarak üretilir.
- Hatırlatmalar ödeme yapmaz, veri değiştirmez ve kesin finansal tavsiye değildir.

## Coach Context Builder

AI koç katmanı `src/features/coach/context-builder.ts` üzerinden oluşturulan `CoachContext` nesnesini kullanır.

- `CoachContext`, deterministik finans motorundan gelen minimize finans özetini ve Financial Memory sinyallerini tek yerde toplar.
- Trend Intelligence katmanı Financial Memory snapshot’larından gelir, gider, borç, yaşam bütçesi, minimum ödeme yükü, risk, borç kapatma hızı ve nakit sıkışıklığı trendlerini minimize sinyallere dönüştürür.
- Goal & Recommendation Intelligence katmanı mevcut summary, memory ve trend sinyallerinden hedef benzeri deterministic öneriler üretir; öneriler öncelik, kategori, neden, beklenen etki ve kaynak sinyalleriyle taşınır.
- Prompt builder yalnızca bu context katmanını görür; raw Prisma kayıtları, kullanıcı notları, IBAN, kart numarası veya ham banka hareketi prompt’a taşınmaz.
- Eski `CoachInputSummary` tabanlı çağrılar geriye uyumluluk için korunur.

## Doğrulama

DB'den bağımsız testler:

```bash
npm run test:unit
```

PostgreSQL integration ve E2E testleri için `.env.test.local` içinde yalnız `test-preview` branch değerleri tanımlanmalıdır:

```bash
TEST_DATABASE_URL=
TEST_DIRECT_URL=
TEST_NEON_ENDPOINT_ID=
TEST_DATABASE_RESET_CONFIRM=test-preview
TEST_BASELINE_DEPLOY_CONFIRM=
```

Test harness her suite için geçici `pfc_it_*` veya `pfc_e2e_*` schema oluşturur ve test sonunda siler. `public`, `preview_app` ve production endpoint'leri cleanup hedefi olamaz.

Onaylı `test-preview` branch'inde kalıcı `preview_app` schema baseline'ı şu sırayla uygulanır:

```bash
npm run prisma:baseline:check
TEST_BASELINE_DEPLOY_CONFIRM=test-preview:preview_app npm run prisma:baseline:deploy:test
npm run test:integration
npm run test:e2e
```

Baseline deploy komutu yalnız `TEST_DATABASE_URL` ve `TEST_DIRECT_URL` kullanır. Normal `DATABASE_URL`/`DIRECT_URL` değerlerine veya production branch'e fallback yapmaz. Aynı komut ikinci kez çalıştırıldığında Prisma migrate no-op olmalıdır.

Yarım kalmış tek bir test schema'sı yalnız exact adı verilerek temizlenebilir:

```bash
npm run test:cleanup-schema -- pfc_it_<suite>_<runId>
```

```bash
npm run security:secrets
npm run security:audit
npm run prisma:generate
npm run lint
npm run test
npm run build
npm run test:e2e
```

## GitHub Actions CI

Pull request açıldığında ve `main` veya `develop` branch'lerine push yapıldığında `.github/workflows/ci.yml` otomatik çalışır.

CI kalite kapısı şunları kontrol eder:

- `npx prisma generate`
- `npm run security:secrets`
- `npm run security:audit`
- `npm run lint`
- `npm run test:unit`
- İzole Neon test branch'inde `npm run test:integration`
- `npm run build`
- `npm run test:e2e`

Playwright raporu ve test sonuçları GitHub Actions artifact olarak 14 gün saklanır.

Önerilen branch protection:

- `main`: PR zorunlu, CI required check, force push kapalı.
- `develop`: CI required check, doğrudan push yerine PR tercih edilir.
- Merge öncesi CI yeşil olmalıdır.

## Vercel / Production Öncesi Notlar

- Bu repo henüz gerçek production deploy için hazır kabul edilmez.
- Vercel preview yalnız `test-preview` branch veya ayrı güvenli preview veritabanıyla düşünülmelidir.
- Gerçek kişisel finans verisiyle production kullanım için PostgreSQL veya eşdeğer kalıcı veritabanı, authentication, authorization ve veri sahipliği modeli gerekir.
- Production benzeri bir denemeden önce `docs/operations/production-readiness.md` içindeki checklist uygulanmalıdır.
- Minimum Vercel ayarları, env listesi, PostgreSQL test-preview sınırları ve Auth geçiş sırası aynı operasyon dokümanında tanımlıdır.
- PostgreSQL migration planı aynı dokümandaki `PostgreSQL Migration Plan` bölümünde tutulur; mevcut SQLite migration geçmişi production PostgreSQL'e doğrudan uygulanmamalıdır.
- Demo/preview ortamlarında `AI_PROVIDER=mock` tercih edilmelidir; gerçek API key'ler yalnızca server-side environment variable olarak yönetilmelidir.

## GitHub ve Release Akışı

- `main`: stable release branch.
- `develop`: aktif geliştirme ve faz entegrasyonu.
- `feature/*`: yeni faz veya feature branch'leri.
- Release tag'leri `main` üzerinden oluşturulur.
- İlk release önerisi: `v0.1.0 — Personal Finance OS Foundation`.
- GitHub Actions CI, lint, test, build, e2e, Prisma generate, dependency audit ve secret scan kontrollerini çalıştırır.

## Notlar

Bu uygulama yalnızca eğitim amaçlı planlama desteği sağlar. Hukuki, vergisel, yatırım veya düzenlemeye tabi finansal tavsiye değildir.
