import { fetchGitActivity } from "../server/gitActivity.js";

/**
 * Vercel Serverless Function — GET /api/git-activity
 * Réponse mise en cache 1 h sur le CDN Vercel (puis servie « stale » pendant la revalidation),
 * ce qui limite les appels GitHub/GitLab à ~1 par heure, quel que soit le trafic.
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { data, warnings } = await fetchGitActivity(process.env);
    warnings.forEach((w) => console.warn(`[git-activity] ${w}`));
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch (err) {
    console.error(`[git-activity] ${err.message}`);
    // Cache court pour ne pas marteler les API en cas de panne ; le front bascule sur l'instantané du build
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(502).json({ error: "Activité Git momentanément indisponible" });
  }
}
