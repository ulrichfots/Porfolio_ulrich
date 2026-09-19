#!/usr/bin/env node
/**
 * Génère l'instantané public/data/git-activity.json (lancé automatiquement avant `npm run build`).
 * Sert de secours à la bannière si /api/git-activity est indisponible (dev local, vite preview, panne API).
 * Ne fait JAMAIS échouer le build : en cas d'erreur, l'instantané précédent est conservé.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "../server/env.js";
import { fetchGitActivity } from "../server/gitActivity.js";

const OUTPUT = fileURLToPath(new URL("../public/data/git-activity.json", import.meta.url));

loadLocalEnv();

try {
  const { data, warnings } = await fetchGitActivity(process.env);
  warnings.forEach((w) => console.warn(`[git-activity] ⚠ ${w}`));
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`[git-activity] ${data.items.length} activités écrites dans public/data/git-activity.json`);
} catch (err) {
  console.warn(`[git-activity] Instantané non mis à jour : ${err.message}`);
}
