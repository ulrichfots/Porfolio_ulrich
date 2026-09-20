import { memo, useEffect, useMemo, useState } from "react";
import { loadWithFallback } from "./fetchJson.js";
import "./GitActivityBanner.css";

const API_URL = "/api/git-activity"; // Fonction Vercel (cache CDN 1 h)
const SNAPSHOT_URL = "/data/git-activity.json"; // Instantané généré au build (secours)
const REFRESH_MS = 60 * 60 * 1000;
const RECENT_MS = 24 * 60 * 60 * 1000;
const SECONDS_PER_ITEM = 5;
const MIN_LOOP_ITEMS = 8;

/**
 * Formatage maison plutôt qu'Intl.RelativeTimeFormat : Node et les navigateurs n'embarquent pas
 * la même version d'ICU (espace insécable côté Chrome), ce qui casserait l'hydratation.
 */
function timeAgo(iso, now) {
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `il y a ${weeks} sem.`;
  const months = Math.round(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.round(days / 365);
  return years <= 1 ? "il y a 1 an" : `il y a ${years} ans`;
}

const loadActivity = (signal) =>
  loadWithFallback({
    apiUrl: API_URL,
    snapshotUrl: SNAPSHOT_URL,
    signal,
    isValid: (data) => Array.isArray(data?.items),
  });

function SourceIcon({ source }) {
  if (source === "gitlab") {
    return (
      <svg className="ga-icon ga-icon--gitlab" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m23.6 9.593-.034-.086L20.3.98a.851.851 0 0 0-.336-.405.875.875 0 0 0-1 .054.875.875 0 0 0-.29.44l-2.205 6.748H7.538L5.332 1.07a.857.857 0 0 0-.29-.441.875.875 0 0 0-1-.054.859.859 0 0 0-.336.405L.433 9.502l-.032.086a6.066 6.066 0 0 0 2.012 7.01l.011.009.03.021 4.976 3.727 2.462 1.863 1.5 1.132a1.009 1.009 0 0 0 1.22 0l1.499-1.132 2.462-1.863 5.006-3.749.012-.01a6.068 6.068 0 0 0 2.01-7.003z" />
      </svg>
    );
  }
  return (
    <svg className="ga-icon ga-icon--github" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function describe(item) {
  if (item.private) return "Contribution sur un projet client";
  if (item.message) return item.message;
  if (item.commitCount > 1) return `${item.commitCount} commits poussés`;
  return "Nouveau push";
}

const ActivityItem = memo(function ActivityItem({ item, now, index, clone }) {
  const isRecent = now - Date.parse(item.date) < RECENT_MS;
  const repoName = item.private ? "Projet privé" : (item.repo ?? "").split("/").pop();
  const sourceLabel = item.source === "gitlab" ? "GitLab" : "GitHub";
  const Tag = item.url ? "a" : "div";
  const linkProps = item.url
    ? { href: item.url, target: "_blank", rel: "noreferrer", tabIndex: clone ? -1 : undefined }
    : {};

  return (
    <li
      className={`ga-item${isRecent ? " is-recent" : ""}`}
      style={{ "--ga-delay": `${Math.min(index, 8) * 70}ms` }}
      aria-hidden={clone || undefined}
    >
      <Tag className="ga-chip" title={item.repo ?? undefined} {...linkProps}>
        <SourceIcon source={item.source} />
        <span className="ga-sr">{sourceLabel} :</span>
        <span className={`ga-repo${item.private ? " is-private" : ""}`}>{repoName}</span>
        {item.branch && <span className="ga-branch">{item.branch}</span>}
        <span className="ga-message">{describe(item)}</span>
        <time className="ga-time" dateTime={item.date}>
          {timeAgo(item.date, now)}
        </time>
        {isRecent && <span className="ga-pulse" aria-hidden="true" />}
      </Tag>
    </li>
  );
});

/**
 * Premier rendu identique côté serveur et côté navigateur : l'heure de référence est celle
 * de la génération des données, jamais `Date.now()`, qui provoquerait un écart d'hydratation.
 */
function initialState(initialData) {
  if (!Array.isArray(initialData?.items)) return { status: "loading", items: [], now: 0 };
  return { status: "ready", items: initialData.items, now: Date.parse(initialData.generatedAt) || 0 };
}

const isFresh = (data) => Date.now() - (Date.parse(data?.generatedAt) || 0) < REFRESH_MS;

const GitActivityBanner = memo(function GitActivityBanner({ initialData = null }) {
  const [state, setState] = useState(() => initialState(initialData));

  useEffect(() => {
    let controller;
    const load = () => {
      controller?.abort();
      controller = new AbortController();
      loadActivity(controller.signal)
        .then((data) => setState({ status: "ready", items: data.items, now: Date.now() }))
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setState((prev) => (prev.status === "ready" ? prev : { ...prev, status: "error" }));
        });
    };

    // Données déjà rendues par le serveur et encore fraîches : aucun appel réseau,
    // on recale seulement les durées relatives sur l'heure réelle du visiteur.
    const skipFirstLoad = initialData && isFresh(initialData);
    const settle = skipFirstLoad ? setTimeout(() => setState((prev) => ({ ...prev, now: Date.now() })), 0) : null;
    if (!skipFirstLoad) load();

    const refresh = setInterval(load, REFRESH_MS);
    return () => {
      controller?.abort();
      clearTimeout(settle);
      clearInterval(refresh);
    };
  }, [initialData]);

  const { items, now } = state;

  // Répète la liste pour que le ruban soit toujours plus large que l'écran (boucle sans trou)
  const loop = useMemo(() => {
    if (items.length === 0) return [];
    let out = items;
    while (out.length < MIN_LOOP_ITEMS) out = out.concat(items);
    return out;
  }, [items]);

  const hasRecent = useMemo(() => items.some((i) => now - Date.parse(i.date) < RECENT_MS), [items, now]);

  if (state.status === "error" || (state.status === "ready" && items.length === 0)) return null;

  if (state.status === "loading") {
    return (
      <aside className="ga-banner is-loading" aria-hidden="true">
        <div className="ga-label">
          <span className="ga-live" />
          <span className="ga-label-text">Activité Git</span>
        </div>
        <div className="ga-viewport">
          <div className="ga-skeleton">
            {[180, 240, 200, 260].map((w, i) => (
              <span key={i} className="ga-skeleton-pill" style={{ width: w }} />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="ga-banner" aria-label="Activité Git récente (GitHub et GitLab)">
      <div className="ga-label">
        <span className={`ga-live${hasRecent ? " is-active" : ""}`} aria-hidden="true" />
        <span className="ga-label-text">Activité Git</span>
      </div>
      <div className="ga-viewport">
        <ul className="ga-track" style={{ "--ga-duration": `${loop.length * SECONDS_PER_ITEM}s` }}>
          {loop.map((item, i) => (
            <ActivityItem key={`a-${i}-${item.id}`} item={item} now={now} index={i} clone={i >= items.length} />
          ))}
          {loop.map((item, i) => (
            <ActivityItem key={`b-${i}-${item.id}`} item={item} now={now} index={i} clone />
          ))}
        </ul>
      </div>
    </aside>
  );
});

export default GitActivityBanner;
