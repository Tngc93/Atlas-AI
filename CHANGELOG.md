# Changelog

Bu proje Türkçe kullanıcı deneyimine sahip, local-first kişisel finans koçu panelidir. Bu dosya ürün sürümleri ve önemli teknik değişiklikleri özetler.

## Unreleased

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
