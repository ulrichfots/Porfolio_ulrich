export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * fetch + timeout + erreurs explicites.
 * Les tokens passent uniquement par les headers : jamais dans l'URL, donc jamais dans les logs.
 */
export async function request(url, { method = "GET", headers = {}, body, timeout = 8000, as = "json" } = {}) {
  const res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(timeout) });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const { pathname } = new URL(url);
    throw new HttpError(`${res.status} ${res.statusText} sur ${pathname}${detail ? ` — ${detail.slice(0, 200)}` : ""}`, res.status);
  }

  return as === "text" ? res.text() : res.json();
}
