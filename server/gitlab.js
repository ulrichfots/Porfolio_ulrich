import { request } from "./http.js";

export function createGitLabClient({ token, baseUrl = "https://gitlab.com", username, userId }) {
  const api = `${baseUrl.replace(/\/$/, "")}/api/v4`;

  const get = (path, { as = "json" } = {}) =>
    request(`${api}${path}`, {
      as,
      headers: { Accept: "application/json", ...(token ? { "PRIVATE-TOKEN": token } : {}) },
    });

  let resolvedId = userId || null;
  async function getUserId() {
    if (resolvedId) return resolvedId;
    const users = await get(`/users?username=${encodeURIComponent(username)}`);
    if (!users?.[0]?.id) throw new Error(`Utilisateur GitLab introuvable : ${username}`);
    resolvedId = users[0].id;
    return resolvedId;
  }

  return {
    hasToken: Boolean(token),
    getUserId,

    // Activité (événements privés visibles uniquement avec un token ayant accès au projet)
    listPushEvents: async () => get(`/users/${await getUserId()}/events?action=pushed&per_page=100`),
    // Tous types d'évènements (pushes, issues, MR, commentaires) : sert au calendrier de contributions
    listEventsPage: async ({ after, page = 1 }) =>
      get(`/users/${await getUserId()}/events?per_page=100&page=${page}${after ? `&after=${after}` : ""}`),
    getProject: (idOrPath) => get(`/projects/${encodeURIComponent(idOrPath)}`),

    // Projets
    listOwnedProjects: async () =>
      get(`/users/${await getUserId()}/projects?per_page=100&order_by=last_activity_at`),
    listContributedProjects: async () => get(`/users/${await getUserId()}/contributed_projects?per_page=100`),
    getRawFile: (projectId, filePath, ref) =>
      get(`/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${encodeURIComponent(ref)}`, {
        as: "text",
      }),
    getLanguages: (projectId) => get(`/projects/${projectId}/languages`),
    listCommits: (projectId, ref) =>
      get(`/projects/${projectId}/repository/commits?per_page=20${ref ? `&ref_name=${encodeURIComponent(ref)}` : ""}`),
  };
}
