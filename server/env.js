import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/**
 * Charge .env.local puis .env (usage local / scripts).
 * Les variables déjà définies (Vercel, GitHub Actions) ne sont jamais écrasées.
 */
export function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const fullPath = `${ROOT}${file}`;
    if (existsSync(fullPath)) process.loadEnvFile(fullPath);
  }
}

const PRIVACY_MODES = ["anonymize", "exclude", "show"];

function toInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function readGitEnv(env = process.env) {
  return {
    github: {
      token: env.GITHUB_TOKEN || null,
      // `??` : une valeur vide désactive volontairement la source
      username: env.GITHUB_USERNAME ?? "ulrichfots",
    },
    gitlab: {
      token: env.GITLAB_TOKEN || null,
      baseUrl: env.GITLAB_URL || "https://gitlab.com",
      username: env.GITLAB_USERNAME ?? "ulrichfots",
      userId: env.GITLAB_USER_ID || null,
    },
    activity: {
      privacy: PRIVACY_MODES.includes(env.GIT_ACTIVITY_PRIVATE) ? env.GIT_ACTIVITY_PRIVATE : "anonymize",
      limit: toInt(env.GIT_ACTIVITY_LIMIT, 20, 5, 50),
    },
  };
}

export function readAiEnv(env = process.env) {
  // La clé (ANTHROPIC_API_KEY) est lue directement par le SDK Anthropic
  return { model: env.AI_MODEL || "claude-opus-5" };
}
