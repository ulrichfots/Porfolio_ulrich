#!/usr/bin/env node
/**
 * Génère l'instantané public/data/git-contributions.json (lancé avant `npm run build`).
 * Sert de secours au calendrier si /api/git-contributions est indisponible.
 * Ne fait jamais échouer le build : en cas d'erreur, l'instantané précédent est conservé.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "../server/loadLocalEnv.js";
import { fetchGitContributions } from "../server/gitContributions.js";

const OUTPUT = fileURLToPath(new URL("../public/data/git-contributions.json", import.meta.url));

loadLocalEnv();

try {
  const { data, warnings } = await fetchGitContributions(process.env);
  warnings.forEach((w) => console.warn(`[git-contributions] ⚠ ${w}`));
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(data)}\n`);
  console.log(
    `[git-contributions] ${data.total} contributions (GitHub ${data.totals.github}, GitLab ${data.totals.gitlab}) → public/data/git-contributions.json`
  );
} catch (err) {
  console.warn(`[git-contributions] Instantané non mis à jour : ${err.message}`);
}
