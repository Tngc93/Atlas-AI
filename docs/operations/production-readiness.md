# Production Readiness

Bu doküman uygulamanın Vercel/production hazırlığı ve PostgreSQL geçişi için operasyon notlarını özetler.

Durum: PostgreSQL provider ve çevrimdışı baseline hazırlanmıştır. Production Neon branch'e migration uygulanmamış, Vercel deploy veya authentication eklenmemiştir.

## Kapsam

Uygulamanın Prisma datasource'u PostgreSQL'e geçirilmiştir. Mevcut SQLite migration geçmişi yalnız arşiv olarak korunur ve PostgreSQL'e uygulanmaz.

PostgreSQL doğrulaması production'dan ayrılmış Neon `test-preview` branch'inde yapılmalıdır. Gerçek kişisel finans verisiyle production kullanım için authentication ve kullanıcı bazlı veri izolasyonu hâlâ gerekir.

## PostgreSQL Test Branch ve Baseline

- Production Neon branch boş ve migration uygulanmamış kalır.
- Integration ve E2E testleri yalnız `test-preview` branch'in pooled/direct endpoint'lerini kullanır.
- Lokal test credential'ları `.env.test.local` içinde tutulur ve git'e gönderilmez.
- Test harness yalnız endpoint kimliği doğrulanan Neon bağlantılarını ve `sslmode=require` URL'lerini kabul eder.
- Her integration suite `pfc_it_*`, her E2E koşusu `pfc_e2e_*` adlı geçici schema kullanır.
- `public`, `preview_app` ve boş schema adları otomatik cleanup hedefi olamaz.
- Existing SQLite migration SQL'leri `prisma/migrations-sqlite` altında içerik değiştirilmeden korunur.
- Aktif `prisma/migrations` yalnız çevrimdışı üretilmiş PostgreSQL baseline ve `provider = "postgresql"` lock dosyasını içerir.
- Baseline bu milestone'da hiçbir Neon branch'e uygulanmamıştır.

Test ortamı değişkenleri:

| Değişken | Amaç |
| --- | --- |
| `TEST_DATABASE_URL` | `test-preview` pooled bağlantısı |
| `TEST_DIRECT_URL` | Aynı branch direct bağlantısı |
| `TEST_NEON_ENDPOINT_ID` | Pooled/direct endpoint eşleşme guard'ı |
| `TEST_DATABASE_RESET_CONFIRM` | Yalnız `test-preview` cleanup onayı |

Unit testler DB credential gerektirmez. `npm run test:integration` ve `npm run test:e2e` eksik test env durumunda skip edilmez, açık hata verir.

## Ortam Değişkenleri

`.env.local` dosyası lokal ortamda oluşturulur ve git'e gönderilmez.

| Değişken | Zorunluluk | Not |
| --- | --- | --- |
| `DATABASE_URL` | Lokal çalışma için gerekli | SQLite local-first kullanımında örnek değer `file:./dev.db`. Production ortamında sessiz fallback'e güvenilmemelidir. |
| `AI_PROVIDER` | Önerilir | Güvenli varsayılan `mock`. Gerçek sağlayıcı seçilmedikçe AI çağrısı yapılmaz. |
| `AI_DAILY_REQUEST_LIMIT` | Önerilir | AI kullanım limitleri için server-side değer. |
| `AI_MONTHLY_BUDGET_LIMIT_TRY` | Önerilir | Maliyet kontrolü için server-side değer. |
| `AI_MAX_INPUT_SUMMARY_CHARS` | Önerilir | AI'ya gönderilen minimize özetin uzunluk sınırı. |
| `GEMINI_API_KEY` | Sadece Gemini için | Yalnızca server-side ortam değişkeni olarak tutulur. README, kod, test, log veya commit içine yazılmaz. |
| `GEMINI_MODEL` | Opsiyonel | Varsayılan `gemini-2.5-flash`. |
| `GEMINI_TIMEOUT_MS` | Opsiyonel | Gemini çağrısı timeout sınırı. |
| `GEMINI_RETRY_COUNT` | Opsiyonel | Gemini retry sayısı. |
| `OPENAI_API_KEY` | Placeholder | Bu aşamada OpenAI gerçek entegrasyonu aktif varsayılmaz; değer yalnızca server-side tutulmalıdır. |
| `OPENAI_MODEL` | Placeholder | OpenAI için gelecekteki model seçimi. |

API anahtarları hiçbir zaman `NEXT_PUBLIC_` prefix'i ile tanımlanmamalıdır.

## SQLite ve Vercel Sınırları

SQLite bu MVP'de lokal kullanım için bilinçli bir seçimdir. Vercel/serverless ortamında şu sınırlamalar vardır:

- Serverless dosya sistemi kalıcı production veritabanı gibi ele alınamaz.
- Concurrent write davranışı gerçek çok kullanıcılı finans uygulaması için güvenilir değildir.
- Deployment veya cold start sırasında dosya tabanlı veri beklentisi kırılabilir.
- SQLite dosyası kişisel finans verisi içeriyorsa deploy artifact'i veya yanlış yapılandırılmış storage içinde risk yaratabilir.
- Authentication olmadığı için tüm veri tek lokal kullanıcı varsayımına bağlıdır.

Bu nedenle Vercel preview yalnızca boş/demo veriyle teknik smoke test için düşünülmelidir. Gerçek kullanıcı verisiyle production kullanımı önerilmez.

## Prisma Akışı

Lokal geliştirme:

```bash
cp .env.example .env.local
npm run prisma:migrate
npm run prisma:generate
```

CI:

- `npx prisma generate` çalışır.
- Unit/integration testler izole test veritabanı kurulumunu kullanır.
- Playwright E2E akışı izole SQLite DB üzerinde çalışır.

Gelecek production veritabanı fazı:

- PostgreSQL veya production-grade kalıcı veritabanı seçilmeden `prisma migrate deploy` production runbook'u kabul edilmemelidir.
- Repository pattern korunmalı; UI doğrudan Prisma sorgusu yapmamalıdır.
- Para alanları integer kuruş yaklaşımını korumalıdır.
- Authentication fazında kullanıcı/account sahipliği alanları veri modeline eklenmelidir.

## Authentication Öncesi Veri İzolasyonu Riski

Bu uygulama şu anda tek lokal kullanıcı varsayımıyla çalışır.

Production veya multi-user kullanım için mevcut riskler:

- Kullanıcı hesabı yoktur.
- Tenant/user boundary yoktur.
- Aynı SQLite verisi tek kullanıcıya ait kabul edilir.
- Server-side veri okuma/yazma akışları authenticated owner check içermez.
- AI context minimization vardır, ancak hesap bazlı erişim sınırı yoktur.

Bu nedenle gerçek production için önce authentication, authorization ve veri sahipliği modeli tasarlanmalıdır.

## Deploy Öncesi Checklist

Her release veya deploy denemesi öncesi:

```bash
npm run security:secrets
npm run security:audit
npx prisma generate
npm run lint
npm run test
npm run build
npm run test:e2e
```

Ayrıca manuel kontrol:

- `.env.local` tracked değil.
- Gerçek API key commit edilmedi.
- SQLite `.db`, `.sqlite`, yedek veya export dosyaları commit edilmedi.
- `node_modules`, `.next`, `test-results`, `playwright-report`, `coverage` ve log dosyaları git dışında.
- Vercel preview kullanılacaksa gerçek kişisel finans verisi yok.
- `AI_PROVIDER=mock` demo/preview için tercih ediliyor.
- GitHub Actions CI yeşil.

## Vercel Preview Politikası

Vercel preview şu amaçlarla kullanılabilir:

- UI smoke test
- Build doğrulama
- Route/render kontrolü
- Demo veriyle sınırlı ürün inceleme

Vercel preview şu amaçlarla kullanılmamalıdır:

- Gerçek kişisel finans verisi saklama
- Çok kullanıcılı production kullanım
- Kalıcı SQLite veritabanı beklentisi
- Auth olmadan gerçek kullanıcı onboarding'i
- API key veya secret değerlerini test amaçlı commit etme

## Deployment Readiness Plan

Bu bölüm Sprint 5.2 itibarıyla Vercel deployment'a geçmeden önceki minimum hazırlık kararlarını tanımlar. Bu plan deploy yapmaz; yalnızca deploy'a güvenli şekilde yaklaşmak için gerekli sırayı netleştirir.

### Minimum Vercel Ayarları

Vercel proje ayarları şu şekilde olmalıdır:

| Ayar | Değer |
| --- | --- |
| Framework | `Next.js` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output | Vercel'in otomatik Next.js `.next` çıktısı |
| Node.js | `20.x` |

Deployment öncesi lokal ve CI doğrulama:

```bash
npm run security:secrets
npm run security:audit
npx prisma generate
npm run lint
npm run test
npm run build
npm run test:e2e
```

Vercel Environment Variables içinde minimum değerler:

- `DATABASE_URL`
- `AI_PROVIDER=mock`
- `AI_DAILY_REQUEST_LIMIT`
- `AI_MONTHLY_BUDGET_LIMIT_TRY`
- `AI_MAX_INPUT_SUMMARY_CHARS`

Opsiyonel ve yalnızca server-side değerler:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_MS`
- `GEMINI_RETRY_COUNT`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Hiçbir API key `NEXT_PUBLIC_` prefix'iyle tanımlanmamalıdır.

### SQLite ile Deploy Denenirse

SQLite ile Vercel preview build denenebilir; ancak bu production readiness kanıtı değildir.

Çalışabilecek kısımlar:

- `npm ci`
- `npx prisma generate`
- `npm run build`
- Statik render ve temel route smoke kontrolleri

Güvenilir kabul edilmemesi gereken kısımlar:

- Kalıcı CRUD verisi
- Çok kullanıcılı veri saklama
- Concurrent write davranışı
- Production migration stratejisi
- Gerçek kişisel finans verisiyle beta

Mevcut `DATABASE_URL` fallback davranışı local kullanımda pratik olabilir; production ortamında sessiz `file:./dev.db` fallback'i yanlış ortamı gizleyebilir. Bir sonraki hardening adımı production'da eksik `DATABASE_URL` için açık guard eklemek olmalıdır.

### PostgreSQL'e Geçiş Sırası

Gerçek production veya public beta için önerilen sıra:

1. Repository ve finance service katmanlarının Prisma datasource değişimine hazır olduğu doğrulanır.
2. Production ortamında `DATABASE_URL` eksikse açık hata veren guard eklenir.
3. Prisma schema PostgreSQL uyumluluğu açısından incelenir.
4. Migration akışı ayrıştırılır:
   - Lokal MVP: SQLite ve `npm run prisma:migrate`
   - Gelecek production: PostgreSQL ve `prisma migrate deploy`
5. Para alanları integer kuruş olarak korunur.
6. Auth fazından önce user/account ownership alanları planlanır.
7. PostgreSQL ve Auth tamamlanmadan gerçek kullanıcı verisiyle public beta açılmaz.

### Auth Olmadan Beta Kararı

Public beta: önerilmez.

Private internal/demo preview: koşullu olarak yapılabilir.

Koşullar:

- Gerçek finansal veri girilmez.
- `AI_PROVIDER=mock` tercih edilir.
- Preview link'i public onboarding için kullanılmaz.
- DB kalıcılığı beklenmez.
- CRUD akışları production readiness kanıtı sayılmaz.

Auth olmadan kalan blocker'lar:

- Kullanıcı izolasyonu yoktur.
- Tenant/user boundary yoktur.
- Server-side owner check yoktur.
- Tüm veriler tek lokal kullanıcı varsayımıyla çalışır.

### En Düşük Riskli Deployment Yolu

Önerilen sıra:

1. Dokümantasyon ve production guardrail'leri tamamla.
2. Private Vercel preview varsa yalnızca build/render smoke amacıyla kullan.
3. PostgreSQL geçiş planını ve migration deploy runbook'unu hazırla.
4. Authentication ve veri sahipliği modelini ekle.
5. Monitoring, rollback ve secret yönetimi netleşince public beta değerlendir.

Deployment veya release branch'i seçmeden önce local `main`, `develop` ve remote branch hizası kontrol edilmelidir.

## PostgreSQL Migration Plan

Bu bölüm Phase 2 Milestone A itibarıyla SQLite local-first MVP'den gelecekteki production PostgreSQL yapısına geçiş planını tanımlar. Bu plan migration üretmez, provider seçmez, Auth eklemez ve deploy yapmaz.

### Mevcut SQLite Bağımlılıkları

- Prisma datasource şu anda `provider = "sqlite"` kullanır.
- Lokal varsayılan `DATABASE_URL` örneği `file:./dev.db` şeklindedir.
- Mevcut migration SQL'leri SQLite biçimindedir: `TEXT`, `INTEGER`, `DATETIME`, `BOOLEAN`, `DECIMAL`, `CURRENT_TIMESTAMP` ve SQLite foreign key/index syntax.
- Integration testler migration SQL'lerini `sqlite3` CLI ile izole `.db` dosyalarına uygular.
- Playwright E2E webserver `prisma db push --skip-generate` ile izole SQLite DB kurar.
- `src/lib/db/prisma.ts` içinde `process.env.DATABASE_URL ?? "file:./dev.db"` fallback'i bulunur.
- Local DB, test DB, `.next`, `test-results` ve `playwright-report` çıktıları git dışında tutulur.

### PostgreSQL'e Geçince Değişecek Noktalar

- Prisma datasource `postgresql` provider'a taşınır.
- Migration SQL'leri PostgreSQL uyumlu baseline olarak yeniden üretilir.
- Production migration komutu `prisma migrate deploy` olur.
- Production ortamında `DATABASE_URL` zorunlu olur; SQLite fallback kullanılmaz.
- Test setup'ları SQLite migration SQL'lerine bağlı kalmamalı; PostgreSQL test stratejisi ayrıca kurulmalıdır.

### Değişmeyecek Noktalar

- Repository pattern korunur.
- Finance engine deterministik doğruluk kaynağı olarak kalır.
- Para alanları integer kuruş olarak kalır.
- AI raw finansal veri görmez.
- Kullanıcıya görünen risk dili `Düşük`, `Orta`, `Yüksek` olarak kalır.
- Reminder içerikleri veritabanına yazılmaz; yalnızca reminder state saklanır.

### Prisma Migration Stratejisi

SQLite migration geçmişi production PostgreSQL'e doğrudan uygulanmamalıdır.

Güvenli sıra:

1. Mevcut Prisma schema PostgreSQL uyumluluğu açısından incelenir.
2. Ayrı bir PostgreSQL migration baseline hazırlanır.
3. Boş PostgreSQL DB üzerinde `prisma migrate deploy` doğrulanır.
4. SQLite local-first geliştirme akışı korunacaksa environment bazlı migration runbook ayrılır.
5. Production ortamında eksik `DATABASE_URL` için açık guard eklenir.

Reminder migration özel notu:

- `ReminderState.reminderKey` unique yapısı PostgreSQL'e kavramsal olarak taşınabilir.
- `status`, `snoozedUntil`, `lastSeenAt`, `dismissedAt` alanları provider değişiminde korunmalıdır.
- Reminder content kalıcılaşmadığı için data migration riski düşüktür.

### Veri Taşıma Stratejisi

İlk production PostgreSQL geçişi için varsayılan öneri boş DB ile başlamaktır.

Gerçek lokal kullanıcı verisi taşınacaksa ayrı, opt-in export/import milestone'u gerekir.

Taşınabilir veri sınıfları:

- Core finance data: `Profile`, `SalaryRecord`, `DebtAccount`, `MandatoryExpense`
- Derived/local history: `FinancialMemorySnapshot`, `FinancialMemoryCategoryTotal`
- Cache/state: `CoachInsight`, `InterestRateSnapshot`, `ReminderState`
- Projection tables: `PaymentPlanMonth`, `DebtProjection`

Varsayılan taşıma ilkesi:

- Core finance data taşınabilir.
- Forecast/payment projection verileri yeniden üretilebilir kabul edilir.
- AI cache ve reminder state opsiyonel kabul edilir.
- Gerçek veri taşıma öncesi backup, redaction ve no-secret checklist zorunludur.

### Development, Preview ve Production Akışı

Development:

- SQLite local-first akış korunur.
- `npm run prisma:migrate`, `npm run prisma:generate`, unit/integration testler ve E2E mevcut şekilde çalışır.

Preview:

- PostgreSQL eklenmeden Vercel preview yalnızca build/render smoke için kullanılabilir.
- PostgreSQL preview DB eklenirse boş veya demo veri kullanılmalıdır.
- Gerçek finansal veri kullanılmaz.

Production:

- PostgreSQL veya eşdeğer kalıcı production DB zorunludur.
- `prisma migrate deploy` runbook'u zorunludur.
- Auth ve user ownership olmadan public beta açılmaz.
- `AI_PROVIDER=mock` güvenli default olarak kalır; gerçek Gemini key ayrı server-side env kararı gerektirir.

### En Düşük Riskli Migration Sırası

1. Production `DATABASE_URL` guard planı uygulanır.
2. PostgreSQL uyumluluk audit'i yapılır: Decimal, DateTime, enum, cascade, unique index ve default değerler.
3. PostgreSQL baseline migration planı hazırlanır.
4. Boş PostgreSQL DB üzerinde migration deploy dry-run doğrulanır.
5. Repository/integration testleri DB-provider bağımlılıklarından ayrıştırılır.
6. Opsiyonel data export/import ayrı milestone olarak tasarlanır.
7. Auth ve user ownership modeli tasarlanır.
8. PostgreSQL, Auth ve owner checks tamamlandıktan sonra public beta değerlendirilir.

### PostgreSQL Hazırlık Test Stratejisi

Mevcut SQLite doğrulaması korunur:

```bash
npm run security:secrets
npm run security:audit
npx prisma generate
npm run lint
npm run test
npm run build
npm run test:e2e
```

PostgreSQL hazırlık fazında eklenecek doğrulamalar:

- Boş PostgreSQL DB'ye `prisma migrate deploy`
- Repository integration smoke
- Gelir, borç ve gider CRUD smoke
- Finance snapshot generation
- Memory snapshot upsert
- Reminder state upsert
- CoachInsight cache write/read

Data migration fazı ayrıca test edilmelidir:

- Export schema validation
- Import idempotency
- Money integer preservation
- Date/Decimal precision
- Gerçek veri içermeyen fixture doğrulaması

### PostgreSQL Migration Riskleri

- SQLite migration SQL'leri PostgreSQL'e doğrudan taşınamaz.
- `DATABASE_URL` fallback'i production'da yanlışlıkla SQLite runtime'a düşebilir.
- Testler SQLite CLI ve `.db` dosyalarına bağlıdır; PostgreSQL provider testleri ayrıca tasarlanmalıdır.
- Auth yokken PostgreSQL'e geçmek veri izolasyonu sağlamaz.
- Derived tabloları taşımak stale veri riski yaratabilir.
- Decimal ve DateTime davranışları provider değişiminde ayrıca doğrulanmalıdır.
- PostgreSQL provider seçimi, bağlantı havuzu, SSL ve region/latency kararları sonraki milestone'a bırakılır.

## Operasyon Notları

- Lokal SQLite dosyası gerçek veri içeriyorsa migration öncesi kullanıcı manuel yedek almalıdır.
- Bu repo içinde gerçek backup/export dosyaları tutulmamalıdır.
- Deployment yapılmış gibi dokümantasyon dili kullanılmamalıdır; bu sprint yalnızca production hazırlığıdır.
- Production readiness kararı için PostgreSQL, Auth, veri izolasyonu, monitoring ve rollback stratejisi ayrıca ele alınmalıdır.
