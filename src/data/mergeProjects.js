// Fusionne les projets saisis à la main avec ceux générés par scripts/sync-projects.mjs.
// Règle : un projet manuel n'est jamais remplacé, il peut seulement être complété (lien vers le code source).

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function slugOf(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

// Hébergeurs partagés : leur nom de domaine seul n'identifie pas un projet
const SHARED_HOSTS = new Set(["github.com", "gitlab.com"]);

function findManualMatch(entry, manual) {
  const host = hostOf(entry.manualLink ?? entry.link);
  if (host && !SHARED_HOSTS.has(host)) {
    const byHost = manual.find((p) => hostOf(p.link) === host);
    if (byHost) return byHost;
  }
  const slugs = [slugOf(entry.repoName), slugOf(entry.title)].filter((s) => s.length >= 4);
  return manual.find((p) => slugs.includes(slugOf(p.title))) ?? null;
}

export function mergeProjects(manualProjects, generatedProjects = []) {
  const manual = manualProjects.map((p) => ({ ...p }));
  const additions = [];

  for (const entry of generatedProjects) {
    if (!entry || entry.hidden) continue;

    const match = findManualMatch(entry, manual);
    if (match) {
      if (!match.repo && entry.repo) match.repo = entry.repo;
      if ((!match.tech || match.tech.length === 0) && entry.tech?.length) match.tech = entry.tech;
      continue;
    }

    // Simple rattachement (pas de fiche IA) sans projet manuel correspondant : rien à afficher
    if (entry.manualLink || !entry.title) continue;

    additions.push({ tech: [], screenshots: [], ...entry });
  }

  return [...manual, ...additions];
}
