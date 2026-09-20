import { fetchGitContributions } from "../../../server/gitContributions.js";

// Calendrier des 12 derniers mois, mis en cache 1 h sur le CDN
export async function GET() {
  try {
    const { data, warnings } = await fetchGitContributions(process.env);
    warnings.forEach((w) => console.warn(`[git-contributions] ${w}`));
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error(`[git-contributions] ${err.message}`);
    return Response.json(
      { error: "Calendrier momentanément indisponible" },
      { status: 502, headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }
}
