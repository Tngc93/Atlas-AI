# Güvenlik ve Gizlilik Kontrol Listesi

- Gerçek finansal veriyi iskele dışında tutun.
- Self-host API anahtarlarını yalnızca `.env.local` veya güvenli server environment içinde saklayın.
- Browser BYOK yalnız açıkça etkinleştirilen provider'larda geçici sekme belleği kullanır; localStorage, sessionStorage, IndexedDB, cookie, URL veya veritabanına yazmaz.
- Credential; disconnect, provider/mode değişimi, navigation ve component unmount sırasında temizlenir.
- `NEXT_PUBLIC_OPENAI_API_KEY` kullanmayın.
- OpenAI kullanımını yalnızca sunucu tarafında tutun.
- Anthropic kullanımını yalnızca sunucu tarafında tutun.
- Public demo varsayılanı Mock olmalı; proje sahibine ait ücretli AI anahtarı içermemelidir.
- OpenAI, Anthropic ve custom remote provider public browser'da kapalı kalmalıdır.
- Ollama/LM Studio base URL'leri sabit loopback portlarıyla sınırlandırılmalıdır.
- CSP `connect-src` yalnız etkin provider origin'lerini içermeli; kapalı provider origin'leri policy'de bulunmamalıdır.
- Connection test finansal context göndermemeli; context gönderimi ayrı kullanıcı onayı gerektirmelidir.
- Gerçek key yerine düşük limitli, kolayca iptal edilebilir test key kullanılmalıdır.
- PostgreSQL bağlantılarını yalnız server-side environment içinde tutun; arşivlenmiş veya lokal SQLite dosyalarını da git dışında bırakın.
- Loglarda hassas değerleri maskeleyin.
- AI tarafına ham özel notlar yerine özet finans verisi gönderin.
- Kalıcı kayıttan önce sayısal girişleri doğrulayın.
- TCMB verisini halka açık yasal azami faiz bağlamı olarak ele alın.
- Faiz yenileme başarısız olursa eski/örnek veri uyarısı gösterin.
- Gerçek veri eklemeden veya dağıtıma çıkmadan önce güvenlik incelemesi yapın.

## Public Demo Güvenlik Sınırı

- Public demo yalnız `/demo/*` altındaki client-only bileşenleri kullanır; self-host rotalarına sessiz geçiş yapmaz.
- Demo finans state'i, onboarding durumu, reminder değişiklikleri, snapshot yenilemeleri, senaryolar ve Mock AI çıktıları yalnız geçici sekme belleğindedir.
- Finans state'i `localStorage`, `sessionStorage`, IndexedDB, cookie, Cache Storage, service worker, URL, browser history, log veya veritabanına yazılmaz.
- `PUBLIC_DEMO_MODE=true` iken DB-backed API istekleri güvenli İngilizce mesajla `403` döner; Prisma başlatma ayrıca fail-closed kalır.
- Demo deployment'a `DATABASE_URL`, `DIRECT_URL` veya proje sahibine ait cloud AI anahtarı verilmemelidir.
- Mock AI yalnız minimize deterministic sonucu açıklar; dış provider çağrısı, API maliyeti veya finansal tavsiye üretmez.
- Reset iki aşamalı onayla immutable kurgusal seed'i geri yükler; refresh, yeni tab ve yeni browser context de aynı seed ile başlar.
