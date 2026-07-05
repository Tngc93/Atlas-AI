# Changelog

Bu proje Türkçe kullanıcı deneyimine sahip, local-first kişisel finans koçu panelidir. Bu dosya ürün sürümleri ve önemli teknik değişiklikleri özetler.

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
