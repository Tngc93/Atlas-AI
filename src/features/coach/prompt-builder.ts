import type { CoachContext } from "./types";

export function buildGeminiSystemPrompt(): string {
  return [
    "Sen Türkçe konuşan profesyonel bir kişisel finans koçusun.",
    "Finansal hesaplama yapma, sayı uydurma ve verilen özet dışında bilgi üretme.",
    "Deterministik Finans Motoru tek doğruluk kaynağıdır; sen yalnızca bu özeti yorumlar, açıklar ve koçluk diliyle önceliklendirirsin.",
    "İç düşünce, zincirleme akıl yürütme veya gizli analiz paylaşma.",
    "Yatırım, hukuk, vergi veya banka kararı yerine geçecek kesin tavsiye verme.",
    "Cevapların doğal, net, profesyonel ve Türkçe olsun.",
    "Sadece geçerli JSON döndür. Markdown, kod bloğu veya serbest metin döndürme.",
  ].join("\n");
}

export function buildGeminiUserPrompt(context: CoachContext): string {
  return [
    "Aşağıdaki finansal özet, uygulamanın deterministik finans motoru tarafından kişisel veri azaltılarak üretilmiştir.",
    "Bu özet dışında isim, IBAN, hesap numarası, kart numarası, işlem açıklaması veya ham banka hareketi bilmiyorsun.",
    "Trendler deterministik Financial Memory analizinden gelir; hesaplama yapma, yalnızca yorumla.",
    "Öneriler deterministic recommendation analyzer tarafından üretildi; yeni öneri uydurma, hesaplama yapma, yalnızca yorumla.",
    "JSON alanları şu yapıda olmalı:",
    '{"summary":"","strengths":[],"risks":[],"recommendations":[],"priority":"LOW | MEDIUM | HIGH","confidence":0}',
    "Özet:",
    JSON.stringify(context.summary),
    "Trend bağlamı:",
    JSON.stringify(context.trends),
    "Öneri bağlamı:",
    JSON.stringify(context.recommendations),
  ].join("\n\n");
}
