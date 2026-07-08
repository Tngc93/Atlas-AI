# Güvenlik ve Gizlilik Kontrol Listesi

- Gerçek finansal veriyi iskele dışında tutun.
- API anahtarlarını yalnızca `.env.local` içinde saklayın.
- `NEXT_PUBLIC_OPENAI_API_KEY` kullanmayın.
- OpenAI kullanımını yalnızca sunucu tarafında tutun.
- SQLite veritabanı dosyalarını git dışında bırakın.
- Loglarda hassas değerleri maskeleyin.
- AI tarafına ham özel notlar yerine özet finans verisi gönderin.
- Kalıcı kayıttan önce sayısal girişleri doğrulayın.
- TCMB verisini halka açık yasal azami faiz bağlamı olarak ele alın.
- Faiz yenileme başarısız olursa eski/örnek veri uyarısı gösterin.
- Gerçek veri eklemeden veya dağıtıma çıkmadan önce güvenlik incelemesi yapın.
