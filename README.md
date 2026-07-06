# Kişisel Finans Koçu Paneli

Türkiye / TRY odağında maaş planlama, kredi kartı borcu kapatma, zorunlu gider takibi, nakit akışı riski ve eğitim amaçlı finans koçu yorumları için yerel öncelikli bir kontrol paneli.

Faz 3 itibarıyla gelir, borç ve zorunlu gider ekranları yerel SQLite veritabanına yazar. Başlangıçta gerçek veri veya otomatik seed yoktur; veritabanı boş gelir.

## Teknoloji Yığını

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- SQLite + Prisma
- Recharts
- Mock-first AI provider katmanı
- OpenAI/Gemini provider yer tutucuları
- TCMB faiz verisi sağlayıcı yer tutucusu

## Başlangıç

```bash
npm install
cp .env.example .env.local
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Ortam Değişkenleri

`.env.example` dosyasından `.env.local` oluşturun:

```bash
DATABASE_URL="file:./dev.db"
AI_PROVIDER=mock
AI_DAILY_REQUEST_LIMIT=20
AI_MONTHLY_BUDGET_LIMIT_TRY=100
AI_MAX_INPUT_SUMMARY_CHARS=4000
OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
```

Faz 6'da varsayılan sağlayıcı `mock` değeridir. OpenAI ve Gemini alanları yalnızca gelecek entegrasyonlar için boş placeholder olarak durur; bu fazda gerçek API çağrısı yapılmaz.

Önemli notlar:

- API anahtarlarını istemci tarafı koda koymayın.
- Anahtarı `NEXT_PUBLIC_` ile başlatmayın.
- AI provider kodu server-only çalışır.
- `/api/coach` client payload'a güvenmez; server tarafında mevcut aylık plan snapshot'ından minimize edilmiş özet üretir.
- Finansal raw veri bu fazda üçüncü parti AI sağlayıcısına gönderilmez.

## Mevcut Sayfalar

- `/` panel özeti
- `/income` güncel maaş, maaş günü ve maaş geçmişi CRUD
- `/debts` borçlar ve kredi kartları CRUD
- `/expenses` zorunlu giderler CRUD
- `/plan` SQLite verisine dayalı deterministik aylık borç kapatma yol haritası
- `/decisions` gerçek kayıtları değiştirmeyen deterministik karar simülatörü
- `/forecast` 3, 6, 12 ve 24 aylık deterministik finansal tahmin ekranı
- `/memory` lokal SQLite snapshot’larından finansal davranış ve trend hafızası

## Veri ve Gizlilik

- Uygulama başlangıçta gerçek veri veya otomatik seed oluşturmaz.
- `src/lib/sample-data/finance.ts` yalnızca test/demo amaçlı kurgusal örnek veridir; gerçek dashboard akışında kullanılmaz.
- Prisma şeması `prisma/schema.prisma` içinde tanımlıdır.
- Yerel SQLite dosyaları git dışında bırakılır.
- `.env.local` git dışında bırakılır.
- Banka senkronizasyonu, otomatik ödeme veya bulut kalıcılığı dahil değildir.
- API anahtarları, SQLite veritabanı dosyaları ve yedekler commit edilmemelidir.
- Testlerde, mock verilerde ve dokümantasyon örneklerinde gerçek finansal veri kullanılmamalıdır.
- GitHub'a push öncesi `.gitignore`, dry-run stage ve secret taraması yapılmalıdır.

## Faz 3 CRUD Notları

- Authentication yoktur; uygulama tek lokal kullanıcı varsayımıyla çalışır.
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

`/forecast` sayfası mevcut lokal SQLite kayıtlarından 3, 6, 12 ve 24 aylık finansal projeksiyon üretir.

- Finans motoru tek hesaplama kaynağıdır.
- Forecast sonuçları veritabanına kaydedilmez.
- AI/OpenAI/Gemini çağrısı yapılmaz.
- Pasif ve kapanmış borçlar tahmine dahil edilmez.
- Çıktılar tahmin ve karar desteği niteliğindedir; kesin finansal tavsiye değildir.

## Financial Memory

`/memory` sayfası gelir, borç, gider, risk ve yaşam bütçesi snapshot’larını lokal SQLite içinde aylık olarak tutar.

- Memory snapshot’ları aynı ay içinde tekrar üretilirse güncellenir.
- CRUD işlemlerinden sonra memory kaydı best-effort denenir; ana kayıt akışı bu işleme bağımlı değildir.
- Kullanıcı `/memory` üzerinde `Hafızayı güncelle` butonuyla manuel snapshot oluşturabilir.
- Trendler için en az iki aylık geçmiş gerekir; geçmiş azsa ekran açıkça `Yeterli geçmiş yok` der.
- Financial Memory AI/OpenAI/Gemini çağrısı yapmaz ve üçüncü partiye finansal veri göndermez.

## Doğrulama

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## GitHub ve Release Akışı

- `main`: stable release branch.
- `develop`: aktif geliştirme ve faz entegrasyonu.
- `feature/*`: yeni faz veya feature branch'leri.
- Release tag'leri `main` üzerinden oluşturulur.
- İlk release önerisi: `v0.1.0 — Personal Finance OS Foundation`.
- GitHub Actions bu fazda eklenmez; ileride lint, test, build, e2e ve secret kontrollerini çalıştıracak şekilde eklenebilir.

## Notlar

Bu uygulama yalnızca eğitim amaçlı planlama desteği sağlar. Hukuki, vergisel, yatırım veya düzenlemeye tabi finansal tavsiye değildir.
