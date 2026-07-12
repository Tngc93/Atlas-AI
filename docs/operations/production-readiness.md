# Production Readiness

## Phase 6 AI Provider Deployment Modes

- Public demo `AI_PROVIDER=mock` ile açılır ve proje sahibine ait ücretli AI anahtarı içermez.
- Browser BYOK varsayılan olarak kapalıdır. Açıldığında credential yalnız client-side session vault içinde tutulur ve uygulama API route'larına gönderilmez.
- Gemini ve OpenRouter browser modları ayrı capability flag'leri gerektirir.
- Production Local Browser BYOK `AI_PUBLIC_DEMO_DATA_CONFIRMED=true` olmadan açılmaz. Cloud modlar nonce/hash tabanlı CSP uygulanana kadar production'da kod seviyesinde kapalıdır.
- OpenAI ve Anthropic yalnız self-host/server-side modda desteklenir.
- Self-host kurulumu provider anahtarlarını `.env` üzerinden, PostgreSQL bağlantısını kendi `DATABASE_URL`/`DIRECT_URL` değerlerinden sağlar.
- Browser custom endpoint public demo'da desteklenmez. Ollama yalnız `11434`, LM Studio yalnız `1234` loopback portunu kullanır.
- CSP `connect-src`, secret scan, Mock fallback ve storage-negative E2E kontrolleri public demo release gate'inin parçasıdır.
- Provider connection testleri finansal özet göndermez; browser calls otomatik retry yapmaz.
- Auth'suz ortak PostgreSQL ortamı demo-only kabul edilmez. Browser BYOK açılmadan önce read-only veya düzenli sıfırlanan kurgusal demo veri ortamı doğrulanmalıdır.

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
| `TEST_BASELINE_DEPLOY_CONFIRM` | Kalıcı preview baseline için tek kullanımlık açık onay |

Unit testler DB credential gerektirmez. `npm run test:integration` ve `npm run test:e2e` eksik test env durumunda skip edilmez, açık hata verir.

### Onaylı Test Baseline Uygulaması

Bu komut yalnız `test-preview` endpoint'inde sabit `preview_app` schema'sını hazırlar. Production `DATABASE_URL` veya `DIRECT_URL` değerlerine fallback yapmaz.

1. `.env.test.local` içinde `TEST_DATABASE_URL`, `TEST_DIRECT_URL`, `TEST_NEON_ENDPOINT_ID` ve `TEST_DATABASE_RESET_CONFIRM=test-preview` tanımlanır.
2. Baseline çevrimdışı kontrol edilir:

```bash
npm run prisma:baseline:check
```

3. Açık onay yalnız komut süresince verilerek baseline uygulanır:

```bash
TEST_BASELINE_DEPLOY_CONFIRM=test-preview:preview_app npm run prisma:baseline:deploy:test
```

4. Integration ve E2E doğrulanır:

```bash
npm run test:integration
npm run test:e2e
```

Komut `NODE_ENV=test`, exact Neon endpoint kimliği, pooled/direct eşleşmesi, `sslmode=require`, `test-preview` reset onayı ve `test-preview:preview_app` baseline onayı olmadan durur. İkinci deploy no-op olmalıdır. Production migration için ayrı, manuel onaylı bir runbook gerekir.

## Ortam Değişkenleri

`.env.local` dosyası lokal ortamda oluşturulur ve git'e gönderilmez.

| Değişken | Zorunluluk | Not |
| --- | --- | --- |
| `DATABASE_URL` | Uygulama runtime'ı için gerekli | PostgreSQL pooled bağlantısı. Test baseline komutu bu değişkene fallback yapmaz. |
| `DIRECT_URL` | Prisma CLI için gerekli | Aynı PostgreSQL branch'in direct bağlantısı. |
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

## Arşivlenmiş SQLite Geçmişi

SQLite önceki local-first MVP'de bilinçli bir seçimdi. Migration geçmişi `prisma/migrations-sqlite` altında arşivlenmiştir ve PostgreSQL'e uygulanmamalıdır.

- Serverless dosya sistemi kalıcı production veritabanı gibi ele alınamaz.
- Concurrent write davranışı gerçek çok kullanıcılı finans uygulaması için güvenilir değildir.
- Deployment veya cold start sırasında dosya tabanlı veri beklentisi kırılabilir.
- SQLite dosyası kişisel finans verisi içeriyorsa deploy artifact'i veya yanlış yapılandırılmış storage içinde risk yaratabilir.
- Authentication olmadığı için tüm veri tek lokal kullanıcı varsayımına bağlıdır.

Vercel preview yalnız `test-preview` PostgreSQL branch'i ve kurgusal veriyle teknik smoke test için düşünülmelidir. Auth ve user ownership olmadan gerçek kullanıcı verisiyle production kullanımı önerilmez.

## Prisma Akışı

Lokal geliştirme:

```bash
cp .env.example .env.local
npm run prisma:generate
```

CI:

- `npx prisma generate` çalışır.
- Unit testler veritabanı credential'ı kullanmaz.
- Integration testler ve Playwright E2E yalnız izole `test-preview` schema'larını kullanır.

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
- Kayıtlı finans verisi tek kullanıcıya ait kabul edilir.
- Server-side veri okuma/yazma akışları authenticated owner check içermez.
- AI context minimization vardır, ancak hesap bazlı erişim sınırı yoktur.

Bu nedenle gerçek production için önce authentication, authorization ve veri sahipliği modeli tasarlanmalıdır.

Hedef user ownership sınırları, user-owned/shared tablo ayrımı, repository sözleşmesi ve migration sırası `docs/architecture/user-ownership.md` içinde tanımlanmıştır. Bu doküman hedef mimaridir; mevcut Prisma schema veya runtime davranışını değiştirmez.

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
- Test-preview verisini production kalıcılığı veya kullanıcı izolasyonu kanıtı sayma
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

## PostgreSQL Provider and Connection Strategy

Bu bölüm Phase 2 Milestone B itibarıyla production PostgreSQL sağlayıcı ve bağlantı stratejisini tanımlar. Bu karar dokümantasyon düzeyindedir; bu milestone'da kod yazılmaz, Prisma provider değiştirilmez, migration yapılmaz, Neon/Supabase/Railway/Render kaynağı oluşturulmaz ve deploy yapılmaz.

### Sağlayıcı Kararı

En düşük riskli production PostgreSQL seçimi: Neon Postgres via Vercel Marketplace.

Bu proje Vercel hedefli, Prisma tabanlı, tek geliştiricili ve beta aşamasında olduğu için Neon'un serverless Postgres yaklaşımı, Vercel Marketplace uyumu, branching modeli, pooled/direct connection ayrımı ve düşük başlangıç maliyeti MVP için en iyi dengeyi verir.

Gerçek finansal veriyle beta için ücretsiz plan yerine paid/Launch veya eşdeğer production plan önerilir. Auth ve user/account ownership tamamlanmadan public beta açılmamalıdır.

### Provider Karşılaştırması

| Provider | Avantaj | Dezavantaj | MVP Uygunluğu |
| --- | --- | --- | --- |
| Neon | Vercel Marketplace uyumu, serverless scale-to-zero, branching, pooled/direct connection ayrımı, düşük başlangıç maliyeti, built-in connection pooling | Cold start riski, provider-specific branching modeli öğrenilmeli, gerçek production için restore window/plan seçimi önemli | Vercel-first MVP için önerilen seçenek |
| Supabase | Managed Postgres + Auth/RLS/Storage ekosistemi, pooler seçenekleri, paid planlarda backup desteği, ileride Auth/RLS için güçlü platform | Vercel Marketplace/branching akışı Neon kadar yalın değil; platform kapsamı bu proje için fazla genişleyebilir | Auth/RLS stratejisi Supabase platformuna bağlanacaksa güçlü alternatif |
| Railway | Basit developer experience, Postgres + app hosting, düşük giriş maliyeti, backup seçenekleri | Vercel hedef platformuyla marketplace/env entegrasyonu Neon kadar doğal değil; production DB governance daha manuel | Hızlı prototip için iyi, Vercel-first production için ikinci planda |
| Render | Managed Postgres, predictable tiers, PITR/backup özellikleri, full-stack hosting seçeneği | Vercel hedefiyle ek platform yönetimi doğurur; ücretsiz Postgres sınırlı/deneysel, paid tiers daha hızlı maliyetlenir | Vercel yerine Render'a taşınma düşünülürse uygun |

Karar: Vercel hedef platform korunacaksa Neon seçilmelidir. Supabase yalnızca Auth/RLS'in Supabase platformuna bağlanması yönünde ayrı bir ürün/mimari kararı alınırsa yeniden değerlendirilmelidir.

### Önerilen Bağlantı Mimarisi

Runtime:

- `DATABASE_URL`: pooled PostgreSQL connection string.
- `DIRECT_URL`: direct PostgreSQL connection string; yalnız Prisma CLI, migration, introspection, logical backup ve yönetim işleri için.
- SSL zorunlu olmalıdır; connection string `sslmode=require` içermelidir.

Prisma:

- Mevcut Prisma 6.19.3 ile production PostgreSQL fazına geçildiğinde datasource şu sözleşmeye hazırlanmalıdır:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- Prisma 7 veya driver adapter geçişi ayrı dependency/upgrade milestone olarak ele alınmalıdır.
- Bu doküman mevcut `provider = "sqlite"` davranışını değiştirmez.

Connection pooling:

- Vercel Serverless runtime pooled URL kullanmalıdır.
- Migration, introspection, `pg_dump` ve yönetim işleri direct URL kullanmalıdır.
- İlk beta için connection ayarları düşük ve kontrollü başlamalıdır. Referans başlangıç: `connection_limit=5`, `pool_timeout=15`, `connect_timeout=15`.
- Gerçek değerler seçilen Neon planı, Vercel runtime davranışı ve ölçülen traffic'e göre production öncesi doğrulanmalıdır.

Prisma Accelerate:

- Bu aşamada gerekli değildir.
- İlk çözüm provider pooler + doğru `DATABASE_URL`/`DIRECT_URL` ayrımı olmalıdır.
- Yüksek traffic, global read latency veya connection saturation gözlenirse ileride opsiyonel olarak değerlendirilebilir.

### Environment ve Ortam Akışı

Development:

- SQLite local-first akış korunur.
- PostgreSQL local development zorunlu değildir.
- `.env.local` içinde `DATABASE_URL="file:./dev.db"` kullanılmaya devam edebilir.

Preview:

- Neon branch veya ayrı preview database kullanılmalıdır.
- Preview DB boş veya demo veriyle çalışmalıdır.
- Gerçek finansal veri kullanılmamalıdır.
- Vercel preview environment için önerilen değerler:
  - `DATABASE_URL`: pooled preview database URL
  - `DIRECT_URL`: direct preview database URL
  - `AI_PROVIDER=mock`

Production:

- Neon primary branch/database kullanılmalıdır.
- `prisma migrate deploy` direct URL ile çalıştırılmalıdır.
- `AI_PROVIDER=mock` güvenli default olarak kalır; gerçek Gemini key ayrı server-side env kararı gerektirir.
- Auth ve user/account ownership olmadan public beta açılmaz.

Minimum production env seti:

- `DATABASE_URL`
- `DIRECT_URL`
- `AI_PROVIDER=mock`
- `AI_DAILY_REQUEST_LIMIT`
- `AI_MONTHLY_BUDGET_LIMIT_TRY`
- `AI_MAX_INPUT_SUMMARY_CHARS`

Opsiyonel ve yalnız server-side:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_MS`
- `GEMINI_RETRY_COUNT`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Backup ve Disaster Recovery

MVP beta için önerilen minimum:

- Neon paid/Launch veya eşdeğer restore window sunan plan kullanılmalıdır.
- Production migration öncesi manuel logical backup alınmalıdır.
- Haftalık `pg_dump` tabanlı encrypted/offsite backup prosedürü ayrı ops milestone olarak planlanmalıdır.
- Restore drill ayda bir boş staging/preview DB üzerinde denenmelidir.

Recovery hedefleri:

- RPO: ilk beta için 24 saat kabul edilebilir başlangıç hedefidir.
- RTO: ilk beta için 4-8 saat kabul edilebilir başlangıç hedefidir.

Derived data politikası:

- Core finance data restore edilir.
- Forecast/payment projection verileri yeniden üretilebilir kabul edilir.
- AI cache ve reminder state restore edilmesi zorunlu değildir.

### Maliyet Notları

- Neon Free: private preview/dev için uygun olabilir; gerçek finansal beta için restore/limit nedeniyle tek başına önerilmez.
- Neon Launch: küçük ve aralıklı MVP workload için yaklaşık 15 USD/ay referans alınabilir; storage ve compute kullanıma göre değişir.
- Supabase: free/dev mümkün; paid compute ve backup ihtiyaçlarıyla maliyet artar, Micro compute yaklaşık 10 USD/ay seviyesinden başlayabilir; platform planı satın alma öncesi doğrulanmalıdır.
- Railway Hobby: yaklaşık 5 USD minimum kullanım/ay; prototip için ucuz ama Vercel-first governance daha zayıftır.
- Render Postgres: free sınırlı; Starter yaklaşık 10 USD/ay, daha güçlü tier'lar hızlı maliyetlenebilir.

Provider fiyatları ve plan limitleri değişebilir. Satın alma, branch oluşturma veya beta açma öncesi resmi fiyat sayfaları tekrar kontrol edilmelidir.

### En Düşük Riskli PostgreSQL Altyapı Sırası

1. Neon via Vercel Marketplace seçimi mimari karar olarak tutulur.
2. `DATABASE_URL`/`DIRECT_URL` env sözleşmesi production dokümantasyonuna ve future `.env.example` kararına hazırlanır.
3. Production `DATABASE_URL` guard milestone'u uygulanır.
4. PostgreSQL schema compatibility audit yapılır.
5. PostgreSQL baseline migration oluşturulur.
6. Boş Neon preview branch üzerinde `prisma migrate deploy` doğrulanır.
7. Repository integration smoke testleri PostgreSQL'e karşı çalıştırılır.
8. Auth ve user/account ownership modeli eklenir.
9. Backup/restore drill tamamlanmadan gerçek kullanıcı verisi kabul edilmez.
10. Public beta yalnız PostgreSQL, Auth, owner checks ve restore drill sonrası değerlendirilir.

### Kabul Kriterleri

Production PostgreSQL hazırlık kabul kriterleri:

- `prisma migrate deploy` boş PostgreSQL DB'de geçer.
- Gelir, borç ve gider CRUD smoke geçer.
- Finance snapshot, Memory snapshot, ReminderState ve CoachInsight write/read smoke geçer.
- Runtime pooled URL, migration direct URL ile çalışır.
- Production ortamında eksik `DATABASE_URL` açık hata verir.
- Gerçek API key, `.env.local`, SQLite DB veya gerçek finansal veri repo içinde bulunmaz.

Mevcut local-first gate korunur:

```bash
npm run security:secrets
npm run security:audit
npx prisma generate
npm run lint
npm run test
npm run build
npm run test:e2e
```

### Kaynaklar

- Neon pricing ve pooling: https://neon.com/pricing, https://neon.com/docs/connect/connection-pooling
- Neon + Prisma setup: https://neon.com/docs/guides/prisma
- Prisma connection pooling / PgBouncer: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool, https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- Supabase compute, backups, poolers: https://supabase.com/docs/guides/platform/compute-and-disk, https://supabase.com/docs/guides/platform/backups, https://supabase.com/docs/guides/database/connecting-to-postgres
- Railway pricing: https://railway.com/pricing
- Render pricing: https://render.com/pricing

## Date and Decimal Readiness Notes

Bu bölüm Phase 2 Milestone C2 itibarıyla PostgreSQL migration öncesi tarih ve decimal davranışlarını belgelemek için eklenmiştir. Bu milestone Prisma schema, migration, provider, API, UI veya runtime davranışı değiştirmez.

### Date ve Date-Only Davranışları

- `YYYY-MM-DD` değerleri kullanıcıdan gelen date-only input veya hesaplama çıktısı olarak ele alınır.
- `YYYY-MM` değerleri aylık snapshot/key formatıdır; özellikle `FinancialMemorySnapshot.periodMonth` için kullanılır.
- `DateTime` alanları gerçek timestamp olarak ele alınır ve Prisma tarafından `Date` nesnesi olarak okunur.
- `toISOString()` çıktıları UTC temellidir. Bu nedenle `periodMonth` gibi ISO üzerinden türetilen değerler yerel saat dilimi değil UTC ayını temsil eder.
- `T12:00:00.000Z` kullanımı, date-only değerleri UI/hatırlatma hesaplarında gün kaymasını azaltmak için bilinçli bir orta-gün yorumudur.

PostgreSQL öncesi dikkat edilmesi gereken alanlar:

- `SalaryRecord.effectiveDate`: formdan `YYYY-MM-DD` gelir, repository içinde `new Date(value)` ile DateTime'a çevrilir. Bu mevcut davranış korunur; ileride date-only semantik netleştirilebilir.
- `FinancialMemorySnapshot.periodMonth`: `capturedAt.toISOString().slice(0, 7)` ile UTC ayından türetilir. Yerel ay sınırına yakın zamanlarda bu davranış bilinçli olarak testle korunmalıdır.
- `FinancialMemorySnapshot.capturedAt`: gerçek snapshot timestamp'idir; monthly key yerine geçmez.
- `InterestRateSnapshot.retrievedAt`: sağlayıcıdan verinin ne zaman alındığını gösteren timestamp'tir; `effectiveDate` ise kaynak dönem bilgisidir ve string olarak kalır.

### Decimal Davranışları

Faiz oranları para alanı değildir. Para alanları integer kuruş olarak saklanmaya devam eder.

Decimal alanlar:

- `DebtAccount.interestRateMonthly`
- `DebtAccount.interestRateAnnual`
- `DebtAccount.manualInterestRateMonthly`
- `DebtAccount.resolvedInterestRateMonthly`
- `InterestRateSnapshot.referenceRate`
- `InterestRateSnapshot.maxContractualRate`
- `InterestRateSnapshot.maxOverdueRate`

Mevcut repository ve mapper katmanları Prisma Decimal değerlerini domain tarafında number'a dönüştürür. Bu davranış PostgreSQL migration öncesi testle korunmalıdır.

PostgreSQL baseline migration sırasında decimal alanlar için açık precision/scale kararı verilmelidir. Bu karar bu milestone kapsamında uygulanmaz.

## Operasyon Notları

- Lokal SQLite dosyası gerçek veri içeriyorsa migration öncesi kullanıcı manuel yedek almalıdır.
- Bu repo içinde gerçek backup/export dosyaları tutulmamalıdır.
- Deployment yapılmış gibi dokümantasyon dili kullanılmamalıdır; bu sprint yalnızca production hazırlığıdır.
- Production readiness kararı için PostgreSQL, Auth, veri izolasyonu, monitoring ve rollback stratejisi ayrıca ele alınmalıdır.
