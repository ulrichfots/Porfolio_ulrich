const REQUEST_TIMEOUT_MS = 6000;

/** fetch JSON avec timeout, en vérifiant que la réponse est bien du JSON (et pas le index.html du SPA). */
export async function fetchJson(url, signal, timeout = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort);
  const timer = setTimeout(abort, timeout);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    if (!res.ok || !res.headers.get("content-type")?.includes("json")) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

/**
 * Essaie la fonction serverless, puis l'instantané généré au build.
 * `isValid` écarte une réponse au format inattendu et déclenche le repli.
 */
export async function loadWithFallback({ apiUrl, snapshotUrl, signal, isValid }) {
  const attempt = async (url) => {
    const data = await fetchJson(url, signal);
    if (!isValid(data)) throw new Error("Format inattendu");
    return data;
  };
  try {
    return await attempt(apiUrl);
  } catch (err) {
    if (signal.aborted) throw err;
    return attempt(snapshotUrl);
  }
}
