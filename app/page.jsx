import Portfolio from "../src/Portfolio.jsx";
import { fetchGitActivity } from "../server/gitActivity.js";
import { fetchGitContributions } from "../server/gitContributions.js";

// Page régénérée au plus une fois par heure : les données Git sont déjà dans le HTML servi
export const revalidate = 3600;

/** Une source indisponible ne doit pas casser la page : le composant reprendra la main côté navigateur. */
async function safeFetch(name, loader) {
  try {
    const { data, warnings } = await loader();
    warnings.forEach((w) => console.warn(`[${name}] ${w}`));
    return data;
  } catch (err) {
    console.warn(`[${name}] rendu serveur ignoré : ${err.message}`);
    return null;
  }
}

export default async function Page() {
  const [activity, contributions] = await Promise.all([
    safeFetch("git-activity", () => fetchGitActivity(process.env)),
    safeFetch("git-contributions", () => fetchGitContributions(process.env)),
  ]);

  return <Portfolio initialActivity={activity} initialContributions={contributions} />;
}
