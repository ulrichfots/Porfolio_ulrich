import { fetchGitActivity } from "../../../server/gitActivity.js";

// Réponse mise en cache 1 h sur le CDN : ~1 appel/heure aux API GitHub et GitLab, quel que soit le trafic
export async function GET() {
  try {
    const { data, warnings } = await fetchGitActivity(process.env);
    warnings.forEach((w) => console.warn(`[git-activity] ${w}`));
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error(`[git-activity] ${err.message}`);
    // Cache court en cas de panne ; le front bascule sur l'instantané du build
    return Response.json(
      { error: "Activité Git momentanément indisponible" },
      { status: 502, headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }
}
