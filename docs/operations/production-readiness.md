# Production Readiness

Bu doküman Sprint 5 itibarıyla uygulamanın Vercel/production hazırlığı için operasyon notlarını özetler.

Durum: hazırlık ve risk azaltma dokümanı. Bu sprintte Vercel deploy, PostgreSQL geçişi veya authentication eklenmemiştir.

## Kapsam

Uygulama şu anda local-first SQLite MVP olarak tasarlanmıştır. Lokal masaüstü geliştirme, demo ve kişisel test akışları için uygundur.

Vercel üzerinde SQLite ile çalıştırma ancak geçici preview/demo denemesi olarak değerlendirilmelidir. Gerçek kişisel finans verisiyle production kullanım için önce kalıcı production veritabanı, authentication ve kullanıcı bazlı veri izolasyonu gerekir.

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

## Operasyon Notları

- Lokal SQLite dosyası gerçek veri içeriyorsa migration öncesi kullanıcı manuel yedek almalıdır.
- Bu repo içinde gerçek backup/export dosyaları tutulmamalıdır.
- Deployment yapılmış gibi dokümantasyon dili kullanılmamalıdır; bu sprint yalnızca production hazırlığıdır.
- Production readiness kararı için PostgreSQL, Auth, veri izolasyonu, monitoring ve rollback stratejisi ayrıca ele alınmalıdır.
