import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/**
 * Charge .env.local puis .env (scripts en local uniquement).
 * Les variables déjà définies (Vercel, GitHub Actions) ne sont jamais écrasées.
 *
 * Ce module est volontairement séparé de `env.js` : il touche au système de fichiers,
 * alors que `env.js` est importé par les routes Next et doit rester bundlable.
 */
export function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = `${ROOT}${file}`;
    if (existsSync(fullPath)) process.loadEnvFile(fullPath);
  }
}
