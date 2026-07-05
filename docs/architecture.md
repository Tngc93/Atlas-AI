# Teknik Mimari

## Uygulama Katmanları

- `src/app`: Next.js rotaları ve API handler dosyaları.
- `src/components`: panel UI, grafikler, tablolar ve örnek giriş panelleri.
- `src/features/finance`: deterministik para, risk, dağılım, sıralama ve borç kapatma projeksiyonu mantığı.
- `src/features/rates`: TCMB sağlayıcı arayüzü, ayrıştırıcı ve örnek yedek veri.
- `src/features/coach`: server-only OpenAI servis yer tutucusu ve yanıt şeması.
- `src/lib/sample-data`: kurgusal MVP verisi.
- `src/lib/db`: Prisma istemci sınırı.
- `prisma`: SQLite şeması.

## Veri Akışı

1. Örnek profil, borç ve gider verileri deterministik hesaplama fonksiyonlarını besler.
2. Panel bileşenleri KPI kartlarını, grafikleri, öncelik tablolarını ve yol haritasını gösterir.
3. `/api/rates/refresh` TCMB sağlayıcısını çağırır ve alınan veriyi ya da örnek yedek veriyi döndürür.
4. `/api/coach` server-only OpenAI servisini çağırır. `OPENAI_API_KEY` yoksa Türkçe örnek eğitim yanıtı döndürür.

## Hesaplama Sahipliği

Sayısal kararların tamamı `src/features/finance/calculations.ts` içindeki deterministik koddan gelir. AI çıktısı yalnızca açıklayıcıdır.
