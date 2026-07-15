"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link2, Link2Off, Server, ShieldCheck } from "lucide-react";
import type { AIProviderName, CoachContext, CoachInsight } from "@/features/coach/types";
import { createBrowserSessionCredential } from "@/features/coach/providers/browser-session";
import { clearBrowserCoachCache, generateBrowserCoachInsight, testBrowserProviderConnection } from "@/features/coach/providers/browser-provider";
import { listBrowserProviders, providerRegistry } from "@/features/coach/providers/registry";
import type { BrowserSessionCredential } from "@/features/coach/providers/contracts";
import { normalizeProviderError } from "@/features/coach/providers/safe-errors";
import { StatusPill } from "@/components/ui/Primitives";
import type { BrowserProviderFlags } from "@/features/coach/providers/browser-flags";

type Mode = "demo" | "byok" | "self-host";
type ConnectionStatus = "idle" | "testing" | "connected" | "error";

export function CoachProviderSettings({
  context,
  initialInsight,
  browserProviderFlags,
  onInsightChange,
}: {
  context: CoachContext;
  initialInsight: CoachInsight;
  browserProviderFlags: BrowserProviderFlags;
  onInsightChange: (insight: CoachInsight) => void;
}) {
  const initialMode: Mode = initialInsight.providerMode === "live" ? "self-host" : "demo";
  const providers = useMemo(
    () =>
      listBrowserProviders({
        geminiEnabled: browserProviderFlags.geminiEnabled,
        openRouterEnabled: browserProviderFlags.openRouterEnabled,
        localEnabled: browserProviderFlags.localEnabled,
      }),
    [browserProviderFlags.geminiEnabled, browserProviderFlags.localEnabled, browserProviderFlags.openRouterEnabled],
  );
  const [mode, setMode] = useState<Mode>(initialMode);
  const [providerId, setProviderId] = useState<AIProviderName>(providers[0]?.id ?? "ollama");
  const selectedProvider = providers.find((provider) => provider.id === providerId) ?? providers[0];
  const [model, setModel] = useState(selectedProvider?.defaultModel ?? "");
  const [baseUrl, setBaseUrl] = useState(selectedProvider?.defaultBaseUrl ?? "");
  const [keyInput, setKeyInput] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [message, setMessage] = useState("Bağlı değil");
  const credentialRef = useRef<BrowserSessionCredential | null>(null);
  const statusLabel = status === "connected" ? "Bağlı" : status === "testing" ? "İşleniyor" : status === "error" ? "Bağlantı hatası" : "Bağlı değil";

  function clearCredential() {
    const credential = credentialRef.current;
    if (credential) {
      clearBrowserCoachCache(credential.sessionId);
      credential.clear();
    }
    credentialRef.current = null;
  }

  useEffect(() => {
    const handlePageHide = () => clearCredential();
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      clearCredential();
    };
  }, []);

  function disconnect() {
    clearCredential();
    setKeyInput("");
    setStatus("idle");
    setMessage("Bağlantı kesildi. Geçici anahtar temizlendi.");
    onInsightChange(initialInsight);
  }

  function selectMode(nextMode: Mode) {
    if (mode === "byok" && nextMode !== "byok") disconnect();
    setMode(nextMode);
    if (nextMode !== "byok") onInsightChange(initialInsight);
  }

  function selectProvider(nextId: AIProviderName) {
    disconnect();
    const next = providers.find((provider) => provider.id === nextId);
    setProviderId(nextId);
    setModel(next?.defaultModel ?? "");
    setBaseUrl(next?.defaultBaseUrl ?? "");
  }

  async function testConnection() {
    if (!selectedProvider) return;
    setStatus("testing");
    setMessage("Bağlantı deneniyor. Bu işlem sağlayıcı kotanızı kullanabilir.");
    const credential = createBrowserSessionCredential(selectedProvider.id, keyInput);
    credentialRef.current?.clear();
    credentialRef.current = credential;
    setKeyInput("");

    try {
      await testBrowserProviderConnection({
        providerId: selectedProvider.id as "gemini" | "openrouter" | "ollama" | "lm-studio",
        model,
        baseUrl,
        credential,
        flags: browserProviderFlags,
      });
      setStatus("connected");
      setMessage("Bağlantı doğrulandı. Henüz finansal özet gönderilmedi.");
    } catch (error) {
      credential.clear();
      credentialRef.current = null;
      setStatus("error");
      setMessage(normalizeProviderError(error).message);
      onInsightChange(initialInsight);
    }
  }

  async function generateInsight() {
    const credential = credentialRef.current;
    if (!selectedProvider || !credential) return;
    setStatus("testing");
    setMessage("Koç yorumu hazırlanıyor.");

    try {
      const insight = await generateBrowserCoachInsight({
        providerId: selectedProvider.id as "gemini" | "openrouter" | "ollama" | "lm-studio",
        model,
        baseUrl,
        credential,
        context,
        flags: browserProviderFlags,
      });
      setStatus("connected");
      setMessage("Bağlı. Koç yorumu seçtiğiniz sağlayıcıdan alındı.");
      onInsightChange(insight);
    } catch (error) {
      setStatus("error");
      setMessage(normalizeProviderError(error).message);
      onInsightChange(initialInsight);
    }
  }

  return (
    <section className="ui-card mb-6" data-testid="coach-provider-settings">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">AI bağlantısı</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">AI Sağlayıcı Ayarları</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">Demo ücretsiz çalışır. Kendi anahtarınız yalnız açık sekmenin geçici belleğinde tutulur.</p>
        </div>
        <StatusPill tone={status === "connected" ? "success" : status === "error" ? "danger" : "neutral"}>{statusLabel}</StatusPill>
      </div>

      <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${status === "error" ? "border-coral/30 bg-coral/10 text-coral" : "border-line bg-surface-muted text-steel"}`}>
        {message}
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3" role="group" aria-label="AI çalışma modu">
        {(["demo", "byok", "self-host"] as const).map((item) => (
          <button
            key={item}
            type="button"
            disabled={item === "byok" && (!browserProviderFlags.masterEnabled || providers.length === 0)}
            onClick={() => selectMode(item)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${mode === item ? "border-mint bg-mint/10 text-mint" : "border-line bg-surface text-steel"} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {item === "demo" ? "Demo" : item === "byok" ? "Kendi anahtarım" : "Self-host"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Sağlayıcı destek durumları">
        {providerRegistry.map((provider) => (
          <span key={provider.id} className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs text-steel">
            {provider.displayName}: {provider.uiLabel}
          </span>
        ))}
      </div>

      {mode === "demo" ? (
        <ModeNote icon={ShieldCheck} title="Maliyetsiz demo modu">API anahtarı gerekmez. Deterministik finans özeti Mock Provider ile açıklanır.</ModeNote>
      ) : null}

      {mode === "self-host" ? (
        <ModeNote icon={Server} title="Sunucuda yapılandırılmış mod">
          Bu sağlayıcı yalnız self-host modunda desteklenir. Sağlayıcı ve anahtar yalnız kendi sunucunuzun environment ayarlarından okunur. Bu ekran anahtarı göstermez veya değiştirmez.
        </ModeNote>
      ) : null}

      {!browserProviderFlags.masterEnabled ? (
        <p className="mt-4 text-xs leading-5 text-steel">Browser BYOK bu ortamda güvenlik kapısı nedeniyle kapalıdır. Demo koç ve self-host modları çalışmaya devam eder.</p>
      ) : null}

      {mode === "byok" && browserProviderFlags.masterEnabled && selectedProvider ? (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-ink">
              Sağlayıcı
              <select value={providerId} onChange={(event) => selectProvider(event.target.value as AIProviderName)} className="ui-input mt-2 w-full">
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.displayName}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              Model
              <input value={model} onChange={(event) => setModel(event.target.value)} className="ui-input mt-2 w-full" autoComplete="off" />
            </label>
          </div>
          <label className="text-sm font-semibold text-ink">
            Base URL
            <input value={baseUrl} readOnly className="ui-input mt-2 w-full bg-surface-muted" inputMode="url" autoComplete="off" />
          </label>
          {selectedProvider.authentication !== "none" ? (
            <label className="text-sm font-semibold text-ink">
              API anahtarı {selectedProvider.authentication === "optional-api-key" ? "(opsiyonel)" : ""}
              <input
                type="password"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                className="ui-input mt-2 w-full"
                autoComplete="new-password"
                spellCheck={false}
              />
            </label>
          ) : null}
          <p className="text-xs leading-5 text-steel">{selectedProvider.browserNote}</p>
          <div className="rounded-lg border border-line bg-surface-muted p-3 text-xs leading-5 text-steel">
            <p>Bu anahtar kalıcı olarak kaydedilmez.</p>
            <p>Sayfa yenilendiğinde veya bağlantıyı kestiğinizde anahtar silinir.</p>
            <p>Bağlantı testi sağlayıcı kotanızı kullanabilir; finansal özet göndermez.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={testConnection} disabled={status === "testing" || !model || !baseUrl} className="ui-primary-button">
              <Link2 size={16} aria-hidden="true" /> {status === "testing" ? "Deneniyor" : "Bağlantıyı test et"}
            </button>
            <button type="button" onClick={generateInsight} disabled={status !== "connected"} className="ui-primary-button">
              Koç yorumunu oluştur
            </button>
            <button type="button" onClick={disconnect} className="ui-secondary-button">
              <Link2Off size={16} aria-hidden="true" /> Bağlantıyı kes
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-amber/25 bg-amber/10 p-3 text-xs leading-5 text-steel">
        <p>Bu demo için gerçek finansal veri girmeyin.</p>
        <p className="mt-1">Tarayıcı eklentileri ve sayfadaki zararlı kod bağlı anahtarı okuyabilir. Yalnız düşük limitli, iptal edilebilir bir test anahtarı kullanın.</p>
        <p className="mt-1">Koç yorumunu oluşturduğunuzda yalnız ekranda açıklanan minimize özet seçtiğiniz sağlayıcıya gönderilir.</p>
      </div>
    </section>
  );
}

function ModeNote({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-surface-muted p-4">
      <Icon size={18} aria-hidden={true} className="mt-0.5 shrink-0 text-mint" />
      <div><h3 className="text-sm font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-steel">{children}</p></div>
    </div>
  );
}
