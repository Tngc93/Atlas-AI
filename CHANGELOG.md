# Changelog

Atlas AI Türkçe-first kullanıcı deneyimine sahip açık kaynak bir AI Financial Intelligence Platform'dur. Bu dosya ürün sürümlerini ve önemli teknik değişiklikleri özetler.

## Unreleased

### v1.0.0-beta - Open-source Release Preparation

- Product presentation standardized as **Atlas AI — Open-source AI Financial Intelligence Platform** while repository and package names remain unchanged.
- README rewritten with architecture, quick start, self-hosting, BYOAI/BYODB, demo mode, security, testing, roadmap, contribution, license, and FAQ guidance.
- MIT license, security policy, contributor guide, Contributor Covenant, issue templates, and pull request template prepared.
- Product philosophy, technical architecture, self-hosting, delivery roadmap, GitHub Discussions, and repository topic recommendations documented.
- Live demo URL and screenshots remain explicit placeholders; no deployment or GitHub settings change was performed.

### Phase 7 - Zero-Cost Public Demo

- PostgreSQL ve ücretli AI anahtarı gerektirmeyen açık `PUBLIC_DEMO_MODE` execution sınırı eklendi.
- Immutable kurgusal seed ve sekmeye özel browser-memory store ile geçici gelir, borç, gider, reminder ve memory işlemleri eklendi.
- Dashboard, plan, forecast, decisions, memory, reminders ve Mock coach akışları client-only demo route tree üzerinden deterministic olarak çalışır hale getirildi.
- Demo modunda Prisma ve DB-backed API erişimi fail-closed yapıldı; self-host PostgreSQL akışı varsayılan olarak korundu.
- Reset, onboarding, Demo Mode göstergeleri ile DB'siz build ve Playwright demo test akışı eklendi.

### Phase 6.1 - Provider Reality Check and Demo Safety

- Provider registry `Demo`, `Local`, `Deneysel Browser` ve `Self-host` availability durumlarıyla zenginleştirildi.
- Gemini ve OpenRouter browser flag'leri ayrıldı; custom remote browser desteği public build'den kaldırıldı.
- Production demo-data guard'ı, cloud CSP fail-closed kuralı, provider-aware `connect-src` ve sabit local port politikası eklendi.
- Bağlantı testi finansal context göndermeyen metadata çağrısına ayrıldı; gerçek koç yorumu ayrı kullanıcı onayı gerektirir.
- Browser retry kapatıldı; disconnect, navigation ve unmount credential/cache cleanup kapsamına alındı.
- `402`, `408`, `429`, `5xx`, network/CORS ve invalid response durumları güvenli Türkçe hata sınıflarına bağlandı.

### Phase 6 - AI Provider Abstraction

- Mock, OpenAI, Gemini, Anthropic, OpenRouter, Ollama, LM Studio ve custom OpenAI-compatible sağlayıcıları için ortak registry ve adapter sözleşmesi eklendi.
- Public demo, session-only Browser BYOK ve self-host execution sınırları birbirinden ayrıldı.
- Browser credential'ın storage, URL, DB, server route, cache ve loglara taşınmasını önleyen credential vault ve güvenli hata/redaction katmanı eklendi.
- `/coach` sayfasına varsayılan olarak kapalı Browser BYOK capability flag'leriyle AI Sağlayıcı Ayarları paneli eklendi.
- Public demo varsayılanı Mock olarak korundu; ücretli server key kullanılmadan deterministic içerik ve fallback davranışı devam ediyor.

### Phase 2 - PostgreSQL Test Branch and Baseline

- Mevcut SQLite migration geçmişi içerik değiştirilmeden `prisma/migrations-sqlite` altında arşivlendi.
- Mevcut Prisma schema'dan çevrimdışı PostgreSQL baseline üretildi ve aktif migration geçmişi PostgreSQL olarak başlatıldı.
- Integration ve Playwright testleri için endpoint doğrulamalı, geçici schema oluşturan ve temizleyen ortak PostgreSQL test harness'ı eklendi.
- Unit ve integration test komutları ayrıldı; CI yalnız test branch secret'larını integration/E2E job'larına verir.
- Production Neon branch'e migration uygulanmadı; gerçek veri, Auth veya user ownership eklenmedi.

### Phase 2 Milestone D - User Ownership Architecture

- Gelecekteki Auth ve PostgreSQL yapısı için user-owned ve shared veri sınırları dokümante edildi.
- Profile, core finance, Financial Memory, Reminder ve Coach kayıtlarının hedef ownership ilişkileri tanımlandı.
- Repository owner context sözleşmesi, user-scoped unique constraint'ler, migration sırası ve cross-user test kriterleri belgelendi.
- Kod, Prisma schema, migration, Auth, PostgreSQL provider veya runtime davranışı değiştirilmedi.

### Phase 2 Milestone B - PostgreSQL Provider and Connection Strategy

- Production PostgreSQL için önerilen sağlayıcı Neon Postgres via Vercel Marketplace olarak dokümante edildi.
- Neon, Supabase, Railway ve Render seçenekleri avantaj/dezavantaj ve MVP uygunluğu açısından karşılaştırıldı.
- Pooled `DATABASE_URL`, direct `DIRECT_URL`, `sslmode=require`, connection pooling, Prisma Accelerate kararı ve preview/production ortam akışı netleştirildi.
- Backup, disaster recovery, maliyet varsayımları ve en düşük riskli PostgreSQL altyapı sırası belgelendi.
- Kod, Prisma datasource, migration, provider provision, deploy, Auth veya yeni dependency eklenmedi.

### Phase 2 Milestone A - PostgreSQL Migration Planning

- SQLite local-first MVP'den gelecekteki production PostgreSQL yapısına geçiş planı belgelendi.
- Mevcut SQLite bağımlılıkları, provider değişiminde korunacak/değişecek noktalar ve migration riskleri netleştirildi.
- PostgreSQL baseline migration, `prisma migrate deploy`, veri taşıma ve test stratejisi dokümante edildi.
- Auth ve user ownership olmadan PostgreSQL'e geçmenin public beta için yeterli olmadığı vurgulandı.
- Kod, Prisma migration, PostgreSQL provider seçimi, Auth, deploy veya yeni dependency eklenmedi.

### Sprint 5.2 - Deployment Readiness Plan

- Vercel deployment öncesi minimum proje ayarları, env değişkenleri ve validation kapıları belgelendi.
- SQLite ile Vercel preview denenirse hangi akışların güvenilir olmayacağı netleştirildi.
- PostgreSQL geçişi, Auth/veri sahipliği ve public beta için güvenli sıra tanımlandı.
- Auth olmadan yalnızca gerçek veri içermeyen private/demo preview yapılabileceği kayda geçirildi.
- Deploy, PostgreSQL, Auth, yeni dependency veya kod davranışı eklenmedi.

### Sprint 5 - Production Hardening

- Vercel/production hazırlığı için operasyon dokümantasyonu eklendi.
- SQLite’ın local-first MVP sınırları ve Vercel/serverless production riskleri açıklandı.
- Environment variable sözleşmesi, server-only AI key yönetimi ve `.env.local` güvenliği netleştirildi.
- Prisma local/CI/future production akışları ayrıştırıldı.
- Deploy öncesi secret scan, audit, Prisma generate, lint, test, build ve E2E checklist’i belgelendi.
- PostgreSQL, authentication, deploy workflow, yeni dependency veya ürün davranışı eklenmedi.

### Sprint 4 - Notification & Reminder Engine

- Lokal-first Reminder Engine eklendi.
- Yaklaşan borç son ödeme tarihi, maaş günü, zorunlu gider tarihi, yüksek risk, eksik veri ve eksik faiz sinyallerinden uygulama içi hatırlatmalar üretildi.
- `ReminderState` modeliyle yalnızca kullanıcı durumları (`Görüldü`, `Ertele`, `Gizle`) saklanır; reminder içeriği veritabanına yazılmaz.
- Dashboard üzerinde top-3 hatırlatma paneli ve `/reminders` sayfası eklendi.
- Push notification, e-posta, SMS, AI veya dış servis entegrasyonu eklenmedi.

### Faz 12B Sprint 3 - Goal & Recommendation Intelligence

- Deterministik recommendation analyzer eklendi.
- `CoachContext` içine minimize `recommendations` alanı eklendi.
- Borç azaltma, yaşam bütçesi koruma, nakit sıkışıklığı azaltma, yüksek faiz önceliği, risk azaltma, tasarruf kapasitesi ve finansal alışkanlık önerileri üretildi.
- Öneriler `priority`, `category`, `reason`, `expectedImpact`, `confidence` ve `sourceSignals` ile sıralandı.
- Gemini prompt builder recommendation context’i güvenli ve Türkçe açıklama kurallarıyla kullanacak şekilde güncellendi.

### Faz 12B Sprint 2 - Trend Intelligence

- Financial Memory snapshot’larından deterministik Trend Intelligence sinyalleri üretildi.
- `CoachContext` içine minimize `trends` alanı eklendi.
- Gelir, zorunlu gider, toplam borç, aktif borç, yaşam bütçesi, minimum ödeme yükü, risk, borç kapatma hızı ve nakit sıkışıklığı trendleri hesaplandı.
- Gemini prompt builder trend bağlamını güvenli ve Türkçe açıklama kurallarıyla kullanacak şekilde güncellendi.
- Trend analyzer, prompt builder ve coach context builder için unit testler eklendi.

### Faz 12B Sprint 1 - Coach Context Builder

- `CoachContext` tipi ve `coach-context-builder` servisi eklendi.
- AI koç finans özeti üretimi orchestrator içinden ayrılarak builder katmanına taşındı.
- Financial Memory sinyalleri veri minimizasyonu korunarak coach context içine eklendi.
- Gemini prompt builder yalnızca `CoachContext` kullanacak şekilde güncellendi.
- Eski `CoachInputSummary` tabanlı çağrılar geriye uyumlu tutuldu.
- Coach Context Builder için unit testler eklendi.

### Faz 12A - Gemini AI Provider

- Gerçek Gemini provider eklendi ve varsayılan model `gemini-2.5-flash` olarak ayarlandı.
- `AI_PROVIDER=gemini` seçildiğinde `GEMINI_API_KEY` yalnızca server-side ortam değişkeninden okunur.
- Gemini çağrıları timeout, retry, exponential backoff, JSON doğrulama ve güvenli Mock fallback ile dayanıklı hale getirildi.
- AI prompt sistemi Türkçe, veri minimizasyonlu ve finans motorunu tek doğruluk kaynağı kabul edecek şekilde ayrıştırıldı.
- Aynı minimize finans özeti için process içi cache ve provider kullanım metrikleri eklendi.
- Gemini provider, invalid JSON, timeout, retry, fallback ve cache davranışları için testler eklendi.

### Faz 11 - Engineering Excellence / GitHub Actions CI

- GitHub Actions CI workflow eklendi.
- PR ve `main`/`develop` push akışlarında Prisma generate, secret scan, dependency audit, lint, test, build ve Playwright E2E kontrolleri tanımlandı.
- Playwright raporları ve test sonuçları GitHub Actions artifact olarak saklanacak şekilde yapılandırıldı.
- Dependency’siz secret scan script’i ve güvenlik npm scriptleri eklendi.
- README, AGENTS.md ve Obsidian Project Brain CI/branch protection beklentileriyle güncellendi.

### Faz 10 - Financial Memory

- `/memory` sayfası eklendi.
- Lokal SQLite üzerinde aylık `FinancialMemorySnapshot` ve kategori toplamı kayıtları oluşturuldu.
- Gelir, borç ve gider değişikliklerinden sonra memory snapshot kaydı best-effort çalışacak şekilde bağlandı.
- 3, 6 ve 12 aylık borç, yaşam bütçesi, gider/maaş oranı, risk ve kategori trendleri için deterministik rapor üretildi.
- Geçmiş veri az olduğunda Türkçe `Yeterli geçmiş yok` boş/yetersiz veri deneyimi eklendi.
- AI/OpenAI/Gemini çağrısı yapılmadı; finansal veri üçüncü partiye gönderilmedi.

### Faz 9 - Forecast Engine

- `/forecast` sayfası eklendi.
- 3, 6, 12 ve 24 aylık deterministik finansal tahmin raporu oluşturuldu.
- Kalan borç trendi, yaşam bütçesi trendi, toplam tahmini faiz, risk trendi ve borç kapanış kilometre taşları gösterildi.
- Forecast Engine, mevcut finans motorunun `MonthlyFinancePlan.payoffForecast` çıktısını kullanır; AI/OpenAI/Gemini çağrısı yapmaz.
- Forecast sonuçları SQLite’a kaydedilmez.

## v0.1.0 - Personal Finance OS Foundation

Tarih: 2026-07-05

### Kapsam

- Finance Engine: maaş, zorunlu gider, minimum ödeme, yaşam bütçesi, risk ve borç kapatma hesapları.
- SQLite CRUD: gelir, maaş geçmişi, borçlar ve zorunlu giderler için local-first veri akışı.
- UX + E2E: Türkçe dashboard, form akışları, iki aşamalı silme, mobil taşma kontrolleri ve Playwright testleri.
- Interest Engine: manuel faiz, çözümlenmiş faiz, TCMB/cache/fallback sağlayıcı mimarisi.
- AI Provider Layer: mock-first OpenAI/Gemini provider altyapısı, server-only placeholder yaklaşımı ve maliyet kontrol tasarımı.
- AI Financial Coach Engine: çok katmanlı mock finans koçu, Türkçe bölümlü koç çıktısı.
- Decision Intelligence Engine: `/decisions` üzerinde deterministik karar simülasyonu.
- Obsidian Project Brain: `Personal Finance OS` yaşayan proje hafızası.
- AGENTS.md workflow: GitHub, release, test ve gizlilik checklist kuralları.

### Doğrulama

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

### Gizlilik Notu

Gerçek finansal veri, SQLite veritabanı dosyaları, `.env.local`, API anahtarları ve lokal test çıktıları commit edilmemelidir.
