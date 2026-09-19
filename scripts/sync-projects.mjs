#!/usr/bin/env node
/**
 * Synchronise les dépôts GitHub / GitLab et génère leurs fiches projets par IA.
 * Écrit UNIQUEMENT src/data/projects.generated.json : les projets saisis à la main ne sont jamais touchés.
 *
 *   npm run sync:projects                nouveaux dépôts + dépôts dont le contenu (README, description…) a changé
 *   npm run sync:projects -- --dry-run   aperçu : aucun appel IA, aucune écriture
 *   npm run sync:projects -- --force     régénère toutes les fiches non verrouillées
 *
 * Dans le JSON généré :  "locked": true  → fiche figée (retouchée à la main)
 *                        "hidden": true  → fiche masquée sur le portfolio
 * Réglages (exclusions, dépôts privés autorisés, rattachements) : scripts/sync.config.json
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PROMPT_VERSION, createAiClient, generateProjectSheet, isFatalAiError } from "../server/ai.js";
import { loadLocalEnv, readAiEnv, readGitEnv } from "../server/env.js";
import { createGitHubClient } from "../server/github.js";
import { createGitLabClient } from "../server/gitlab.js";

const OUTPUT = fileURLToPath(new URL("../src/data/projects.generated.json", import.meta.url));
const CONFIG = fileURLToPath(new URL("./sync.config.json", import.meta.url));
const AI_CONCURRENCY = 3;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const FORCE = args.has("--force");

loadLocalEnv();
const git = readGitEnv();
const ai = readAiEnv();
const config = JSON.parse(await readFile(CONFIG, "utf8"));

const log = (msg) => console.log(`[sync-projects] ${msg}`);
const warn = (msg) => console.warn(`[sync-projects] ⚠ ${msg}`);

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function globToRegExp(pattern) {
  const escaped = pattern.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^${escaped.join(".*")}$`, "i");
}

function matchesAny(patterns = [], repo) {
  return patterns.some((pattern) => {
    const re = globToRegExp(pattern);
    return re.test(repo.key) || re.test(repo.fullName);
  });
}

async function mapPool(items, size, fn) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

/** 404/409 = ressource absente (pas de README, dépôt vide) ; toute autre erreur est remontée. */
async function optional(promise, fallback) {
  try {
    return await promise;
  } catch (err) {
    if (err.status === 404 || err.status === 409) return fallback;
    throw err;
  }
}

const byBytesDesc = (languages) =>
  Object.entries(languages ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

// ─── Normalisation GitHub / GitLab ────────────────────────────────────────────

function normalizeGitHub(r, relation) {
  return {
    key: `github:${r.full_name}`,
    source: "github",
    relation,
    fullName: r.full_name,
    name: r.name,
    url: r.html_url,
    homepage: r.homepage || null,
    description: r.description || "",
    private: Boolean(r.private),
    fork: Boolean(r.fork),
    archived: Boolean(r.archived),
    topics: r.topics ?? [],
    pushedAt: r.pushed_at,
    defaultBranch: r.default_branch,
  };
}

function normalizeGitLab(p, relation) {
  const access = Math.max(
    p.permissions?.project_access?.access_level ?? 0,
    p.permissions?.group_access?.access_level ?? 0
  );
  return {
    key: `gitlab:${p.path_with_namespace}`,
    source: "gitlab",
    // Maintainer (40) ou Owner (50) sur un projet de groupe ⇒ c'est ton projet
    relation: access >= 40 ? "owner" : relation,
    id: p.id,
    fullName: p.path_with_namespace,
    name: p.name,
    url: p.web_url,
    homepage: null,
    description: p.description || "",
    private: Boolean(p.visibility && p.visibility !== "public"),
    fork: Boolean(p.forked_from_project),
    archived: Boolean(p.archived),
    topics: p.topics ?? p.tag_list ?? [],
    pushedAt: p.last_activity_at,
    defaultBranch: p.default_branch,
    readmeUrl: p.readme_url ?? null,
  };
}

// ─── Collecte des dépôts ──────────────────────────────────────────────────────

async function collectGitHub(client) {
  const repos = new Map();
  for (const r of await client.listOwnedRepos()) repos.set(r.full_name, normalizeGitHub(r, "owner"));

  if (config.github?.includeContributions !== false) {
    const found = new Set();
    const [prs, commits] = await Promise.allSettled([client.searchMergedPullRequests(), client.searchCommits()]);
    if (prs.status === "fulfilled") prs.value.items?.forEach((i) => found.add(i.repository_url?.split("/repos/")[1]));
    else warn(`GitHub, recherche des PR : ${prs.reason.message}`);
    if (commits.status === "fulfilled") commits.value.items?.forEach((i) => found.add(i.repository?.full_name));
    else warn(`GitHub, recherche des commits : ${commits.reason.message}`);

    for (const name of found) {
      if (!name || repos.has(name)) continue;
      try {
        repos.set(name, normalizeGitHub(await client.getRepo(name), "contributor"));
      } catch (err) {
        warn(`GitHub ${name} : ${err.message}`);
      }
    }
  }

  // Dépôts privés explicitement autorisés (l'API publique ne les liste pas)
  for (const pattern of config.includePrivate ?? []) {
    if (!pattern.startsWith("github:") || pattern.includes("*")) continue;
    const name = pattern.slice("github:".length);
    if (repos.has(name)) continue;
    try {
      const r = await client.getRepo(name);
      const isOwner = r.owner?.login?.toLowerCase() === client.username.toLowerCase();
      repos.set(name, normalizeGitHub(r, isOwner ? "owner" : "contributor"));
    } catch (err) {
      warn(`GitHub ${name} (includePrivate) : ${err.message}`);
    }
  }

  return [...repos.values()];
}

async function collectGitLab(client) {
  const projects = new Map();
  for (const p of await client.listOwnedProjects()) projects.set(p.id, normalizeGitLab(p, "owner"));

  if (config.gitlab?.includeContributions !== false) {
    for (const p of await client.listContributedProjects()) {
      if (!projects.has(p.id)) projects.set(p.id, normalizeGitLab(p, "contributor"));
    }
  }

  for (const pattern of config.includePrivate ?? []) {
    if (!pattern.startsWith("gitlab:") || pattern.includes("*")) continue;
    const path = pattern.slice("gitlab:".length);
    if ([...projects.values()].some((p) => p.fullName === path)) continue;
    try {
      const p = await client.getProject(path);
      projects.set(p.id, normalizeGitLab(p, "contributor"));
    } catch (err) {
      warn(`GitLab ${path} (includePrivate) : ${err.message}`);
    }
  }

  return [...projects.values()];
}

// ─── Détails (README, langages, commits) ──────────────────────────────────────

function readmePathFromUrl(readmeUrl, ref) {
  if (!readmeUrl || !ref) return null;
  const marker = `/-/blob/${ref}/`;
  const i = readmeUrl.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(readmeUrl.slice(i + marker.length));
}

async function loadDetails(repo, clients) {
  if (repo.source === "github") {
    const gh = clients.github;
    const author = repo.relation === "contributor" ? gh.username : undefined;
    const [readme, languages, commits] = await Promise.all([
      optional(gh.getReadme(repo.fullName), ""),
      optional(gh.getLanguages(repo.fullName), {}),
      optional(gh.listCommits(repo.fullName, { author }), []),
    ]);
    return {
      readme,
      languages: byBytesDesc(languages),
      commits: commits.map((c) => c.commit?.message?.split("\n")[0]).filter(Boolean),
    };
  }

  const gl = clients.gitlab;
  const readmePath = readmePathFromUrl(repo.readmeUrl, repo.defaultBranch);
  const [readme, languages, commits] = await Promise.all([
    readmePath ? optional(gl.getRawFile(repo.id, readmePath, repo.defaultBranch), "") : "",
    optional(gl.getLanguages(repo.id), {}),
    optional(gl.listCommits(repo.id, repo.defaultBranch), []),
  ]);
  return {
    readme,
    languages: byBytesDesc(languages),
    commits: commits.map((c) => c.title).filter(Boolean),
  };
}

/** Empreinte du contenu « descriptif » : l'IA n'est rappelée que si elle change. */
function hashSource(repo, details) {
  const payload = {
    v: PROMPT_VERSION,
    relation: repo.relation,
    description: repo.description,
    homepage: repo.homepage,
    topics: repo.topics,
    languages: details.languages,
    readme: details.readme.slice(0, 6000),
    // Sans README, les commits deviennent la seule matière première
    commits: details.readme ? [] : details.commits.slice(0, 10),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

// ─── Construction des entrées ─────────────────────────────────────────────────

function statusOf(repo) {
  if (repo.homepage) return ["En ligne", "#10B981"];
  if (repo.relation === "contributor") return ["Contribution", "#0EA5E9"];
  if (repo.archived) return ["Archivé", "#64748B"];
  if (repo.private) return ["Privé", "#F59E0B"];
  return ["Open Source", "#8B5CF6"];
}

function buildEntry(repo, sheet, sourceHash, previous) {
  const [status, statusColor] = statusOf(repo);
  const publicUrl = repo.private ? null : repo.url;
  return {
    id: repo.key,
    title: sheet.title,
    category: repo.relation === "contributor" ? "Contributions" : sheet.category,
    status,
    statusColor,
    description: sheet.description,
    longDesc: sheet.longDesc,
    tech: sheet.tech,
    challenges: sheet.challenges,
    solutions: sheet.solutions,
    color: repo.source === "gitlab" ? "#8B5CF6" : "#6366F1",
    link: repo.homepage || publicUrl,
    repo: publicUrl,
    screenshots: previous?.screenshots ?? [],
    source: repo.source,
    relation: repo.relation,
    repoName: repo.name,
    pushedAt: repo.pushedAt,
    generated: true,
    locked: false,
    hidden: previous?.hidden ?? false,
    sourceHash,
    model: ai.model,
    updatedAt: new Date().toISOString(),
  };
}

/** Dépôt d'un projet déjà présent à la main : pas de carte, on complète juste la fiche manuelle. */
function buildManualLink(repo, manualLink) {
  return {
    id: repo.key,
    manualLink,
    repo: repo.private ? null : repo.url,
    source: repo.source,
    pushedAt: repo.pushedAt,
    generated: true,
    locked: false,
  };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { projects: [] };
    // JSON corrompu : on s'arrête plutôt que de risquer d'écraser des fiches existantes
    throw new Error(`Impossible de lire ${OUTPUT} : ${err.message}`);
  }
}

// ─── Programme principal ──────────────────────────────────────────────────────

if (!DRY_RUN) {
  try {
    ai.client = createAiClient();
    // Appel gratuit (Models API) : valide les identifiants et le nom du modèle avant tout travail
    await ai.client.models.retrieve(ai.model);
  } catch (err) {
    console.error(`[sync-projects] Accès à Claude impossible (modèle ${ai.model}) : ${err.message}`);
    console.error("[sync-projects] Renseigne ANTHROPIC_API_KEY (voir .env.example) ou utilise --dry-run pour un aperçu.");
    process.exit(1);
  }
}
// Erreur bloquante (clé invalide, modèle inconnu…) : on arrête les appels IA restants
let fatalAiError = null;

const clients = {};
if (config.github?.enabled !== false && git.github.username) clients.github = createGitHubClient(git.github);
if (config.gitlab?.enabled !== false && (git.gitlab.username || git.gitlab.userId)) {
  clients.gitlab = createGitLabClient(git.gitlab);
}
if (clients.github && !git.github.token) warn("GITHUB_TOKEN absent : quota GitHub limité à 60 requêtes/heure.");

const collected = [];
for (const [name, collect] of [
  ["github", collectGitHub],
  ["gitlab", collectGitLab],
]) {
  if (!clients[name]) continue;
  try {
    const repos = await collect(clients[name]);
    collected.push(...repos);
    log(`${name} : ${repos.length} dépôts trouvés`);
  } catch (err) {
    // Source en panne : ses fiches existantes sont conservées telles quelles
    warn(`${name} indisponible : ${err.message}`);
  }
}

const skipped = [];
const eligible = [];
for (const repo of collected) {
  const reason = matchesAny(config.exclude, repo)
    ? "exclu"
    : repo.private && !matchesAny(config.includePrivate, repo)
      ? "privé"
      : repo.fork && !config.includeForks
        ? "fork"
        : repo.archived && !config.includeArchived
          ? "archivé"
          : null;
  if (reason) skipped.push({ repo, reason });
  else eligible.push(repo);
}
eligible.sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
const maxRepos = config.maxRepos ?? 25;
eligible.slice(maxRepos).forEach((repo) => skipped.push({ repo, reason: "au-delà de maxRepos" }));
const selected = eligible.slice(0, maxRepos);

const existing = await readExisting();
const previousById = new Map((existing.projects ?? []).map((p) => [p.id, p]));
// On part de l'existant : une fiche n'est jamais supprimée implicitement (ex. panne d'API)
const results = new Map(previousById);
const report = [];

// Seuls les dépôts explicitement exclus ou devenus privés sont retirés (sauf fiche verrouillée)
for (const { repo, reason } of skipped) {
  const previous = previousById.get(repo.key);
  if (previous && !previous.locked && (reason === "exclu" || reason === "privé")) {
    results.delete(repo.key);
    report.push([repo.key, `retiré (${reason})`]);
  }
}

await mapPool(selected, AI_CONCURRENCY, async (repo) => {
  const previous = previousById.get(repo.key);
  if (previous?.locked) return report.push([repo.key, "verrouillé"]);

  const manualLink = config.linkToManual?.[repo.key];
  if (manualLink) {
    results.set(repo.key, buildManualLink(repo, manualLink));
    return report.push([repo.key, "rattaché au projet manuel"]);
  }

  if (DRY_RUN) return report.push([repo.key, previous ? "existant (empreinte vérifiée au vrai run)" : "NOUVEAU"]);

  let details;
  try {
    details = await loadDetails(repo, clients);
  } catch (err) {
    warn(`${repo.key} : ${err.message}`);
    return report.push([repo.key, "ignoré (erreur API, fiche existante conservée)"]);
  }

  const sourceHash = hashSource(repo, details);
  if (previous && !FORCE && previous.sourceHash === sourceHash) {
    results.set(repo.key, { ...previous, pushedAt: repo.pushedAt });
    return report.push([repo.key, "inchangé"]);
  }

  if (fatalAiError) return report.push([repo.key, "ignoré (IA indisponible, fiche existante conservée)"]);

  try {
    const sheet = await generateProjectSheet({ ...repo, ...details }, ai);
    results.set(repo.key, buildEntry(repo, sheet, sourceHash, previous));
    report.push([repo.key, previous ? "mis à jour (IA)" : "créé (IA)"]);
  } catch (err) {
    if (isFatalAiError(err)) fatalAiError ??= err;
    warn(`IA ${repo.key} : ${err.message}`);
    report.push([repo.key, "ignoré (erreur IA, fiche existante conservée)"]);
  }
});

report.sort((a, b) => a[0].localeCompare(b[0]));
log(`Sélection (${selected.length}) :`);
report.forEach(([key, action]) => console.log(`   ${action.padEnd(28)} ${key}`));
if (skipped.length) {
  log(`Écartés (${skipped.length}) :`);
  skipped.forEach(({ repo, reason }) => console.log(`   ${reason.padEnd(28)} ${repo.key}`));
}

const projects = [...results.values()].sort((a, b) => (Date.parse(b.pushedAt) || 0) - (Date.parse(a.pushedAt) || 0));

if (DRY_RUN) {
  log("Aperçu terminé (--dry-run) : aucun fichier modifié.");
} else if (JSON.stringify(projects) === JSON.stringify(existing.projects ?? [])) {
  log("Aucun changement : fichier non modifié.");
} else {
  const output = { generatedAt: new Date().toISOString(), model: ai.model, promptVersion: PROMPT_VERSION, projects };
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  log(`${projects.length} entrées écrites dans src/data/projects.generated.json`);
}

if (fatalAiError) {
  console.error(`[sync-projects] Synchro IA interrompue : ${fatalAiError.message}`);
  process.exitCode = 1; // fait échouer la GitHub Action : aucune PR n'est ouverte
}
