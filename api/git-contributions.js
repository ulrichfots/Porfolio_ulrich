import { fetchGitContributions } from "../server/gitContributions.js";

/**
 * Vercel Serverless Function — GET /api/git-contributions
 * Calendrier de contributions GitHub + GitLab des 12 derniers mois, mis en cache 1 h sur le CDN.
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { data, warnings } = await fetchGitContributions(process.env);
    warnings.forEach((w) => console.warn(`[git-contributions] ${w}`));
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch (err) {
    console.error(`[git-contributions] ${err.message}`);
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(502).json({ error: "Calendrier momentanément indisponible" });
  }
}
