import { readGitEnv } from "./env.js";
import { createGitHubClient } from "./github.js";
import { createGitLabClient } from "./gitlab.js";

const MAX_PER_REPO = 3; // évite qu'un seul dépôt monopolise la bannière
const MESSAGE_MAX = 100;

function firstLine(text) {
  const line = (text ?? "").split("\n")[0].trim();
  if (!line) return null;
  return line.length > MESSAGE_MAX ? `${line.slice(0, MESSAGE_MAX - 1)}…` : line;
}

async function fromGitHub(cfg) {
  const client = createGitHubClient(cfg.github);
  const events = await client.listEvents();

  return events
    .filter((e) => e.type === "PushEvent" && e.repo?.name)
    .map((e) => {
      const repo = e.repo.name;
      const sha = e.payload?.head ?? null;
      const commits = e.payload?.commits;
      return {
        id: `gh-${e.id}`,
        source: "github",
        private: e.public === false,
        groupKey: `github:${repo}`,
        repo,
        repoUrl: `https://github.com/${repo}`,
        branch: e.payload?.ref?.replace(/^refs\/heads\//, "") ?? null,
        sha,
        message: firstLine(commits?.at(-1)?.message),
        url: sha ? `https://github.com/${repo}/commit/${sha}` : `https://github.com/${repo}`,
        commitCount: e.payload?.size ?? commits?.length ?? null,
        date: e.created_at,
        // Le payload des PushEvent peut ne plus contenir `commits` : message récupéré à la demande
        resolveMessage: sha ? async () => firstLine((await client.getCommit(repo, sha)).commit?.message) : null,
      };
    });
}

async function fromGitLab(cfg) {
  const client = createGitLabClient(cfg.gitlab);
  const events = (await client.listPushEvents()).filter((e) => e.push_data && e.push_data.action !== "removed");

  const projectIds = [...new Set(events.map((e) => e.project_id))];
  const projects = new Map(
    await Promise.all(projectIds.map(async (id) => [id, await client.getProject(id).catch(() => null)]))
  );

  return events.map((e) => {
    const project = projects.get(e.project_id);
    // Projet illisible (pas de token ou pas d'accès) ⇒ traité comme privé
    const isPrivate = !project || Boolean(project.visibility && project.visibility !== "public");
    const sha = e.push_data.commit_to ?? null;
    const repoUrl = project?.web_url ?? null;
    return {
      id: `gl-${e.id}`,
      source: "gitlab",
      private: isPrivate,
      groupKey: `gitlab:${e.project_id}`,
      repo: project?.path_with_namespace ?? e.target_title ?? null,
      repoUrl,
      branch: e.push_data.ref_type === "branch" ? e.push_data.ref : null,
      sha,
      message: firstLine(e.push_data.commit_title),
      url: repoUrl && sha ? `${repoUrl}/-/commit/${sha}` : repoUrl,
      commitCount: e.push_data.commit_count ?? null,
      date: e.created_at,
      resolveMessage: null,
    };
  });
}

function toPublicItem(item, privacy) {
  const base = { id: item.id, source: item.source, private: item.private, date: item.date, commitCount: item.commitCount };
  if (item.private && privacy === "anonymize") {
    return { ...base, repo: null, repoUrl: null, branch: null, message: null, url: null };
  }
  return { ...base, repo: item.repo, repoUrl: item.repoUrl, branch: item.branch, message: item.message, url: item.url };
}

async function finalize(items, { privacy, limit }) {
  const seenShas = new Set();
  const perRepo = new Map();
  const kept = [];

  const sorted = items
    .filter((i) => i.date && (privacy !== "exclude" || !i.private))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  for (const item of sorted) {
    if (item.sha && seenShas.has(item.sha)) continue; // dépôt miroir GitHub ⇄ GitLab
    if (item.sha) seenShas.add(item.sha);
    const count = perRepo.get(item.groupKey) ?? 0;
    if (count >= MAX_PER_REPO) continue;
    perRepo.set(item.groupKey, count + 1);
    kept.push(item);
    if (kept.length >= limit) break;
  }

  await Promise.all(
    kept.map(async (item) => {
      if (item.message || !item.resolveMessage || (item.private && privacy !== "show")) return;
      item.message = await item.resolveMessage().catch(() => null);
    })
  );

  return kept.map((item) => toPublicItem(item, privacy));
}

/**
 * Récupère et mélange (tri chronologique) les derniers pushes GitHub + GitLab.
 * Les dépôts privés sont anonymisés côté serveur : leur nom ne quitte jamais cette fonction.
 * @returns {Promise<{ data: { generatedAt: string, sources: Record<string, boolean>, items: object[] }, warnings: string[] }>}
 */
export async function fetchGitActivity(env = process.env) {
  const cfg = readGitEnv(env);

  const sources = [];
  if (cfg.github.username) sources.push(["github", fromGitHub(cfg)]);
  if (cfg.gitlab.username || cfg.gitlab.userId) sources.push(["gitlab", fromGitLab(cfg)]);

  const settled = await Promise.allSettled(sources.map(([, promise]) => promise));
  const status = {};
  const warnings = [];
  const all = [];

  settled.forEach((result, i) => {
    const name = sources[i][0];
    status[name] = result.status === "fulfilled";
    if (result.status === "fulfilled") all.push(...result.value);
    else warnings.push(`${name} : ${result.reason?.message ?? result.reason}`);
  });

  if (sources.length > 0 && warnings.length === sources.length) {
    throw new Error(`Aucune source Git disponible (${warnings.join(" | ")})`);
  }

  const items = await finalize(all, cfg.activity);
  return { data: { generatedAt: new Date().toISOString(), sources: status, items }, warnings };
}
