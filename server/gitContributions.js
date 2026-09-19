import { readGitEnv } from "./env.js";
import { createGitLabClient } from "./gitlab.js";
import { request } from "./http.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS = 364; // 52 semaines pleines + aujourd'hui
const MAX_EVENT_PAGES = 10;

const isoDay = (date) => date.toISOString().slice(0, 10);

const GITHUB_QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function fromGitHub(cfg, from, to) {
  if (!cfg.github.token) throw new Error("GITHUB_TOKEN requis (l'API GraphQL de GitHub exige une authentification)");

  const res = await request("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "portfolio-git-sync",
      Authorization: `Bearer ${cfg.github.token}`,
    },
    body: JSON.stringify({
      query: GITHUB_QUERY,
      variables: { login: cfg.github.username, from: from.toISOString(), to: to.toISOString() },
    }),
  });

  if (res.errors?.length) throw new Error(res.errors[0].message);
  const weeks = res.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) throw new Error(`Utilisateur GitHub introuvable : ${cfg.github.username}`);

  const days = new Map();
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) days.set(day.date, day.contributionCount);
    }
  }
  return days;
}

/** Calendrier public du profil GitLab : une seule requête, mais sans les contributions privées. */
async function fromGitLabCalendar(cfg) {
  const url = `${cfg.gitlab.baseUrl.replace(/\/$/, "")}/users/${encodeURIComponent(cfg.gitlab.username)}/calendar.json`;
  const calendar = await request(url, { headers: { Accept: "application/json" } });
  return new Map(Object.entries(calendar).filter(([, count]) => count > 0));
}

/** Avec un token : on agrège le flux d'évènements, qui inclut les projets privés. */
async function fromGitLabEvents(client, from) {
  const days = new Map();
  const after = isoDay(new Date(from.getTime() - DAY_MS)); // `after` est exclusif

  for (let page = 1; page <= MAX_EVENT_PAGES; page += 1) {
    const events = await client.listEventsPage({ after, page });
    for (const event of events) {
      const day = event.created_at?.slice(0, 10);
      if (day) days.set(day, (days.get(day) ?? 0) + 1);
    }
    if (events.length < 100) break;
  }
  return days;
}

async function fromGitLab(cfg, from) {
  if (!cfg.gitlab.token) return fromGitLabCalendar(cfg);
  try {
    return await fromGitLabEvents(createGitLabClient(cfg.gitlab), from);
  } catch {
    return fromGitLabCalendar(cfg); // repli sur le calendrier public
  }
}

/**
 * Calendrier de contributions des 12 derniers mois, GitHub + GitLab cumulés.
 * Ne renvoie que des compteurs par jour : aucun nom de dépôt, donc rien à anonymiser.
 */
export async function fetchGitContributions(env = process.env) {
  const cfg = readGitEnv(env);
  const to = new Date(`${isoDay(new Date())}T23:59:59.000Z`);
  const from = new Date(to.getTime() - RANGE_DAYS * DAY_MS);

  const sources = [];
  if (cfg.github.username) sources.push(["github", fromGitHub(cfg, from, to)]);
  if (cfg.gitlab.username || cfg.gitlab.userId) sources.push(["gitlab", fromGitLab(cfg, from)]);

  const settled = await Promise.allSettled(sources.map(([, promise]) => promise));
  const status = {};
  const warnings = [];
  const perSource = {};

  settled.forEach((result, i) => {
    const name = sources[i][0];
    status[name] = result.status === "fulfilled";
    if (result.status === "fulfilled") perSource[name] = result.value;
    else warnings.push(`${name} : ${result.reason?.message ?? result.reason}`);
  });

  if (sources.length > 0 && warnings.length === sources.length) {
    throw new Error(`Aucun calendrier disponible (${warnings.join(" | ")})`);
  }

  const days = [];
  const totals = { github: 0, gitlab: 0 };
  for (let t = from.getTime(); t <= to.getTime(); t += DAY_MS) {
    const date = isoDay(new Date(t));
    const github = perSource.github?.get(date) ?? 0;
    const gitlab = perSource.gitlab?.get(date) ?? 0;
    totals.github += github;
    totals.gitlab += gitlab;
    days.push({ date, count: github + gitlab, github, gitlab });
  }

  return {
    data: {
      generatedAt: new Date().toISOString(),
      from: isoDay(from),
      to: isoDay(to),
      total: totals.github + totals.gitlab,
      totals,
      sources: status,
      days,
    },
    warnings,
  };
}
