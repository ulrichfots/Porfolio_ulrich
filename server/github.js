import { request } from "./http.js";

const API = "https://api.github.com";

export function createGitHubClient({ token, username }) {
  const get = (path, { accept = "application/vnd.github+json", as = "json" } = {}) =>
    request(`${API}${path}`, {
      as,
      headers: {
        Accept: accept,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-git-sync",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const search = (kind, query, extra = "") =>
    get(`/search/${kind}?q=${encodeURIComponent(query)}&per_page=100${extra}`);

  return {
    username,
    hasToken: Boolean(token),

    // Activité (inclut les événements privés si le token appartient à `username`)
    listEvents: () => get(`/users/${username}/events?per_page=100`),
    getCommit: (fullName, sha) => get(`/repos/${fullName}/commits/${sha}`),

    // Dépôts
    listOwnedRepos: () => get(`/users/${username}/repos?type=owner&sort=pushed&per_page=100`),
    searchMergedPullRequests: () => search("issues", `type:pr author:${username} is:merged -user:${username}`),
    searchCommits: () => search("commits", `author:${username} -user:${username}`, "&sort=author-date&order=desc"),
    getRepo: (fullName) => get(`/repos/${fullName}`),
    getReadme: (fullName) => get(`/repos/${fullName}/readme`, { accept: "application/vnd.github.raw+json", as: "text" }),
    getLanguages: (fullName) => get(`/repos/${fullName}/languages`),
    listCommits: (fullName, { author } = {}) =>
      get(`/repos/${fullName}/commits?per_page=20${author ? `&author=${encodeURIComponent(author)}` : ""}`),
  };
}
