# User Ownership Architecture

Status: Planned

Milestone: Phase 2 Milestone D

Bu doküman, mevcut local-first ve tek kullanıcılı veri modelinin gelecekte Auth ve PostgreSQL ile çok kullanıcılı bir yapıya taşınırken izleyeceği sahiplik sınırlarını tanımlar.

Bu bir hedef mimari kaydıdır. Mevcut Prisma schema, migration geçmişi, repository imzaları veya runtime davranışı bu dokümanla değişmez.

## Amaç

Her kişisel finans kaydı, server tarafında doğrulanmış tek bir kullanıcıya açıkça bağlanmalıdır. Kullanıcı kimliği istemciden güvenilir veri olarak alınmamalı; Auth katmanının ürettiği server-side owner context üzerinden repository sınırına taşınmalıdır.

Finance Engine deterministik doğruluk kaynağı olarak kalır. Forecast, Decision, Reminder, Memory ve Coach katmanları yalnızca aynı kullanıcıya ait repository verilerinden üretilen snapshot ve bağlamları tüketir.

## Temel İlkeler

- Auth kimliği ile veri sahipliği aynı kavram değildir: Auth kullanıcıyı doğrular, `userId` veri sınırını kurar.
- Her user-owned repository sorgusu sahibi filtrelemelidir; yalnız kayıt `id` değeriyle okuma, güncelleme veya silme yapılmamalıdır.
- UI, Client Component veya form payload içinden gelen `userId` yetkilendirme kaynağı kabul edilmemelidir.
- Shared veriler kişisel finans kaydı, kullanıcı notu veya kullanıcıya özgü cache içermemelidir.
- Forecast ve Decision gibi geçici hesaplar ayrıca kalıcı ownership tablosu gerektirmez; user-scoped `FinanceSnapshot` yeterlidir.
- AI yalnız minimize edilmiş user-scoped `CoachContext` tüketir; raw Prisma kayıtları provider'a gönderilmez.

## Ownership Matrisi

| Model | Hedef sahiplik | Gerekçe |
| --- | --- | --- |
| `User` | Kimlik kökü | Auth kimliğini uygulama içi veri sahibine bağlar. |
| `Profile` | Doğrudan `userId` | Her kullanıcı için en fazla bir finans profili vardır. |
| `SalaryRecord` | Doğrudan `userId` | Maaş geçmişi kişisel finans verisidir. |
| `DebtAccount` | Doğrudan `userId` | Borç, lender ve ödeme verileri kullanıcıya özeldir. |
| `MandatoryExpense` | Doğrudan `userId` | Gider, kategori ve not verileri kullanıcıya özeldir. |
| `PaymentPlanMonth` | Doğrudan `userId`, kalıcı tutulursa | Projection kaydı başka kullanıcıyla paylaşılmamalıdır. |
| `DebtProjection` | Parent plan üzerinden; gerekirse doğrudan `userId` | Normal sahiplik `PaymentPlanMonth` ilişkisi üzerinden kurulabilir. |
| `FinancialMemorySnapshot` | Doğrudan `userId` | Aylık hafıza ve trend verileri kullanıcıya özeldir. |
| `FinancialMemoryCategoryTotal` | Parent snapshot üzerinden | Aynı sahiplik alanını tekrar etmeden cascade sınırı korunur. |
| `ReminderState` | Doğrudan `userId` | Görüldü, ertele ve gizle kararları kullanıcıya özeldir. |
| `CoachInsight` | Doğrudan `userId` | Persisted insight ve cache sonucu kullanıcılar arasında paylaşılmamalıdır. |
| `InterestRateSnapshot` | Shared | TCMB/provider kaynaklı oran cache'i kullanıcı verisi içermez. |

Static copy, sample/fallback rate metadata ve gelecekteki sistem config kayıtları kişisel veri içermedikleri sürece shared kalabilir.

## Hedef User Modeli

Aşağıdaki alanlar kavramsal hedeftir; bu milestone Prisma schema değişikliği yapmaz:

```text
User
- id: cuid tabanlı uygulama içi kimlik
- email: opsiyonel; unique kararı Auth sağlayıcısına göre verilecek
- authProvider: opsiyonel geçiş alanı
- authSubjectId: opsiyonel geçiş alanı
- displayName: opsiyonel
- locale: varsayılan tr-TR
- currency: varsayılan TRY
- createdAt
- updatedAt
```

Auth kimliği için hedef unique sınır `authProvider + authSubjectId` bileşimidir. Email'in kimlik anahtarı veya zorunlu unique alan olup olmayacağı Auth sağlayıcısı seçilmeden kesinleştirilmemelidir.

## İlişki Kararları

### Profile ve Core Finance

- `Profile.userId` zorunlu ve unique olur; bir kullanıcı en fazla bir profile sahip olur.
- `getProfile()` gelecekte `getProfile(userId)` veya `getProfile(ownerContext)` olur.
- Global `findFirst()` kaldırılır; profile `userId` ile unique okunur.
- `SalaryRecord`, `DebtAccount` ve `MandatoryExpense` doğrudan zorunlu `userId` taşır.
- Update ve delete akışları yalnız `id` ile çalışmaz. Composite unique mümkün değilse transaction içinde önce owner check yapılır, ardından mutation gerçekleştirilir.

### Financial Memory

- `FinancialMemorySnapshot.userId` zorunlu olur.
- Global `periodMonth @unique` yerine kullanıcı bazlı `userId + periodMonth` unique sınırı kullanılır.
- Snapshot upsert, category total replace ve reread aynı transaction içinde kalır.
- `FinancialMemoryCategoryTotal`, parent snapshot ilişkisi ve cascade davranışı üzerinden sahiplenilir.

### Reminders

- `ReminderState.userId` zorunlu olur.
- Global `reminderKey @unique` yerine kullanıcı bazlı `userId + reminderKey` unique sınırı kullanılır.
- Reminder içeriği yine kalıcılaştırılmaz; yalnız state kullanıcıya bağlı saklanır.
- Aynı deterministic reminder key farklı kullanıcılarda bağımsız state oluşturabilir.

### Coach

- Persisted `CoachInsight.userId` zorunlu olur.
- Global `inputHash @unique` kaldırılarak `userId + inputHash` unique sınırı kullanılır.
- In-memory cache de süreç içinde kullanıcı sınırını korumalıdır; cache key kullanıcı bağlamını içermeden cross-user sonuç döndürmemelidir.
- Gemini, Mock veya gelecekteki provider'lar DB okumaz; yalnız minimize edilmiş `CoachContext` tüketir.

### Forecast ve Decision

- Forecast ve Decision geçici hesaplama katmanları olarak kalır ve yeni ownership tablosu gerektirmez.
- Her iki katman da `getFinanceSnapshot(userId)` ile üretilmiş aynı kullanıcıya ait snapshot üzerinden çalışır.
- Senaryo verileri açıkça kaydedilmedikçe DB'ye veya Financial Memory'ye yazılmaz.

### Shared Interest Rates

- `InterestRateSnapshot` shared kalır ve repository fonksiyonları `userId` almaz.
- Shared rate cache kişisel borç adı, lender, manual note veya kullanıcıya özgü resolved context içermemelidir.
- Kullanıcıya özgü manual rate değerleri `DebtAccount` sahipliği içinde kalır.

## Repository Sözleşmesi

Hedef repository sınırı, doğrulanmış sahipliği açık parametre olarak alır:

```text
OwnerContext
- userId: server-side authenticated application user id
```

Geçişte şu kurallar uygulanmalıdır:

- Income repository: profile ve salary kayıtlarının tüm read/write işlemleri user-scoped olur.
- Debt ve expense repository: list/create/update/delete işlemleri user-scoped olur.
- Memory repository: list, month lookup, upsert ve report verisi user-scoped olur.
- Reminder repository: list ve upsert state işlemleri user-scoped olur.
- Coach persistence/cache: kullanıcı sınırını key ve query seviyesinde korur.
- Rate repository: shared kalır.
- `getFinanceSnapshot()` gelecekte `getFinanceSnapshot(ownerContext)` olur ve profile, debt ve expense verilerini aynı owner context ile paralel okur.

Server Actions ve route handler'lar owner context'i Auth session'dan üretir. Client payload içindeki user id, email veya profile id erişim yetkisi sağlamaz.

## Request ve Veri Akışı

```text
Authenticated request
  -> server-side auth/session resolution
  -> OwnerContext { userId }
  -> user-scoped repository reads/writes
  -> deterministic FinanceSnapshot / MonthlyFinancePlan
  -> Forecast / Decision / Reminder / Memory
  -> minimized CoachContext
  -> optional AI explanation
```

Her sınırda hata davranışı fail-closed olmalıdır: authenticated user veya owner context üretilemiyorsa kişisel veri okunmamalı ve mutation yapılmamalıdır.

## Migration Sırası

1. Bu ownership dokümanı mimari karar olarak kabul edilir.
2. PostgreSQL baseline hazırlandıktan sonra `User` modeli eklenir.
3. Mevcut tek lokal kullanıcıyı temsil eden bootstrap user stratejisi belirlenir.
4. User-owned tablolara önce nullable `userId` eklenir.
5. Mevcut local veriler bootstrap user'a backfill edilir.
6. Orphan kayıt kalmadığı doğrulanır; ardından `userId` alanları required yapılır.
7. Global unique sınırlar user-scoped hale getirilir:
   - `Profile.userId`
   - `FinancialMemorySnapshot(userId, periodMonth)`
   - `ReminderState(userId, reminderKey)`
   - `CoachInsight(userId, inputHash)`
8. Repository fonksiyonları owner context'i zorunlu alacak şekilde taşınır.
9. Server Actions ve route handler'lara authenticated owner resolution ve owner checks eklenir.
10. Cross-user authorization testleri tamamlanır.
11. PostgreSQL, Auth, owner checks ve restore drill tamamlanmadan public beta açılmaz.

Backfill ve constraint değişiklikleri tek, geniş migration yerine doğrulanabilir adımlara ayrılmalıdır. Rollback ve backup kontrolü gerçek veri taşıma milestone'unda ayrıca tanımlanmalıdır.

## Test ve Kabul Kriterleri

Multi-user implementasyonu başladığında en az şu senaryolar doğrulanmalıdır:

- User A, User B'nin profile, salary, debt, expense, memory, reminder veya coach kayıtlarını okuyamaz.
- User A, User B'ye ait id değerini bilse bile update veya delete yapamaz.
- Aynı `periodMonth`, farklı kullanıcılar için ayrı memory snapshot oluşturabilir.
- Aynı `reminderKey`, farklı kullanıcılar için bağımsız state oluşturabilir.
- Aynı `inputHash`, farklı kullanıcılar için bağımsız persisted coach insight/cache sonucu oluşturabilir.
- Shared `InterestRateSnapshot` tüm authenticated kullanıcılar tarafından okunabilir ve kişisel veri içermez.
- Forecast ve Decision yalnız request sahibine ait snapshot ile çalışır.
- Auth session veya owner context yoksa kişisel repository işlemleri fail-closed davranır.

Test fixture'ları yalnız kurgusal veri kullanmalı ve cross-user negatif testleri repository, Server Action ve route seviyelerinde kapsamalıdır.

## Riskler

- Mevcut `Profile.findFirst()` davranışı çok kullanıcılı ortamda yanlış kullanıcı verisi döndürebilir.
- Yalnız record id ile yapılan update/delete işlemleri IDOR ve cross-user mutation riski taşır.
- Global `periodMonth`, `reminderKey` ve `inputHash` unique sınırları kullanıcılar arasında çakışma veya veri sızıntısı yaratabilir.
- Auth eklemek tek başına authorization sağlamaz; repository ve server sınırlarında owner check zorunludur.
- User-owned ve shared cache ayrımı yanlış kurulursa kişisel bağlam başka kullanıcıya dönebilir.
- Nullable `userId` geçiş dönemi uzarsa sahipsiz kayıtlar production'a taşınabilir.
- Projection verilerinin kalıcı tutulup tutulmayacağı netleşmeden gereksiz ownership ve migration yükü oluşabilir.

## Kapsam Dışı

- Auth sağlayıcısı seçimi veya implementasyonu
- Prisma schema ve migration değişikliği
- PostgreSQL provider'a geçiş
- Gerçek local data backfill veya export/import
- Public beta veya Vercel deploy
- Row-level security kararı
- Email unique politikası

Bu kararlar sonraki Auth, PostgreSQL migration ve production data isolation milestone'larında ayrı ayrı onaylanmalıdır.
