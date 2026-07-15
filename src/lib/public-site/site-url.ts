const LOCAL_SITE_URL = "http://localhost:3000";

function toHttpUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

export function resolveSiteUrl(env: NodeJS.ProcessEnv = process.env) {
  const configuredUrl = toHttpUrl(env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) return configuredUrl;

  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  return toHttpUrl(vercelHost ? `https://${vercelHost}` : undefined) ?? new URL(LOCAL_SITE_URL);
}
