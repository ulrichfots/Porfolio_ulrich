import { memo, useEffect, useMemo, useRef, useState } from "react";
import { loadWithFallback } from "./fetchJson.js";
import "./GitContributionGraph.css";

const API_URL = "/api/git-contributions"; // Fonction Vercel (cache CDN 1 h)
const SNAPSHOT_URL = "/data/git-contributions.json"; // Instantané généré au build (secours)
const REFRESH_MS = 60 * 60 * 1000;
const WEEKS = 53;

const WEEKDAYS = ["Lun", "", "Mer", "", "Ven", "", ""];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const loadContributions = (signal) =>
  loadWithFallback({
    apiUrl: API_URL,
    snapshotUrl: SNAPSHOT_URL,
    signal,
    isValid: (data) => Array.isArray(data?.days),
  });

/** Découpe les jours en colonnes de 7 (semaines commençant le lundi). */
function buildWeeks(days) {
  if (days.length === 0) return [];
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7; // 0 = lundi
  const cells = [...Array(offset).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 5 niveaux d'intensité, calés sur le jour le plus actif de la période. */
function makeLevelScale(days) {
  const max = days.reduce((m, d) => Math.max(m, d.count), 0);
  if (max <= 0) return () => 0;
  const steps = [
    1,
    Math.max(2, Math.ceil(max * 0.25)),
    Math.max(3, Math.ceil(max * 0.5)),
    Math.max(4, Math.ceil(max * 0.75)),
  ];
  return (count) => {
    if (count <= 0) return 0;
    if (count >= steps[3]) return 4;
    if (count >= steps[2]) return 3;
    if (count >= steps[1]) return 2;
    return 1;
  };
}

function describeDay(day) {
  const date = dateFormat.format(new Date(`${day.date}T00:00:00Z`));
  if (day.count === 0) return `Aucune contribution le ${date}`;
  const parts = [];
  if (day.github > 0) parts.push(`${day.github} GitHub`);
  if (day.gitlab > 0) parts.push(`${day.gitlab} GitLab`);
  const plural = day.count > 1 ? "s" : "";
  return `${day.count} contribution${plural} le ${date}${parts.length ? ` · ${parts.join(", ")}` : ""}`;
}

/** Libellés de mois : posés sur la première colonne qui entame un nouveau mois. */
function monthLabels(weeks) {
  const labels = [];
  let previous = null;
  weeks.forEach((week, index) => {
    const day = week.find(Boolean);
    if (!day) return;
    const month = Number(day.date.slice(5, 7)) - 1;
    if (month !== previous && index < weeks.length - 1) {
      labels.push({ index, label: MONTHS[month] });
      previous = month;
    }
  });
  return labels;
}

const GitContributionGraph = memo(function GitContributionGraph() {
  const [state, setState] = useState({ status: "loading", data: null });
  const [tip, setTip] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let controller;
    const load = () => {
      controller?.abort();
      controller = new AbortController();
      loadContributions(controller.signal)
        .then((data) => setState({ status: "ready", data }))
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setState((prev) => (prev.status === "ready" ? prev : { ...prev, status: "error" }));
        });
    };
    load();
    const refresh = setInterval(load, REFRESH_MS);
    return () => {
      controller?.abort();
      clearInterval(refresh);
    };
  }, []);

  const data = state.data;
  const weeks = useMemo(() => buildWeeks(data?.days ?? []), [data]);
  const levelOf = useMemo(() => makeLevelScale(data?.days ?? []), [data]);
  const months = useMemo(() => monthLabels(weeks), [weeks]);

  // Sur petit écran le calendrier défile : on affiche d'emblée les semaines les plus récentes
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller && state.status === "ready") scroller.scrollLeft = scroller.scrollWidth;
  }, [state.status]);

  if (state.status === "error") return null;

  const onPointerOver = (event) => {
    const cell = event.target.closest?.("[data-label]");
    if (!cell) return;
    // Mesure par rectangles : l'animation des colonnes laisse un transform qui fausserait offsetLeft
    const wrap = event.currentTarget.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    const top = rect.top - wrap.top;
    // Près du haut, l'infobulle passe sous la case : le conteneur défilant rogne ce qui dépasse
    const below = top < 36;
    setTip({
      text: cell.dataset.label,
      x: Math.min(Math.max(rect.left - wrap.left + rect.width / 2, 110), Math.max(wrap.width - 110, 110)),
      y: below ? top + rect.height : top,
      below,
    });
  };

  const loading = state.status === "loading";
  const placeholder = Array.from({ length: WEEKS }, () => Array.from({ length: 7 }, () => null));

  return (
    <section className={`gc-section${loading ? " is-loading" : ""}`} aria-label="Calendrier de contributions Git">
      <div className="gc-inner">
        <header className="gc-header">
          <div>
            <h2 className="gc-title">Activité de développement</h2>
            <p className="gc-subtitle">
              {loading
                ? "Chargement du calendrier…"
                : `${data.total} contribution${data.total > 1 ? "s" : ""} sur les 12 derniers mois`}
            </p>
          </div>
          {!loading && (
            <div className="gc-sources">
              <span className="gc-source">
                <span className="gc-dot gc-dot--github" aria-hidden="true" />
                GitHub <strong>{data.totals.github}</strong>
              </span>
              <span className="gc-source">
                <span className="gc-dot gc-dot--gitlab" aria-hidden="true" />
                GitLab <strong>{data.totals.gitlab}</strong>
              </span>
            </div>
          )}
        </header>

        <div className="gc-board">
          <ul className="gc-weekdays" aria-hidden="true">
            {WEEKDAYS.map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ul>

          <div className="gc-scroller" ref={scrollerRef}>
            <div className="gc-grid-wrap" onMouseOver={onPointerOver} onMouseLeave={() => setTip(null)}>
              {!loading && (
                <div className="gc-months" aria-hidden="true">
                  {months.map(({ index, label }) => (
                    <span key={label + index} className="gc-month" style={{ "--gc-col": index }}>
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <div className="gc-grid" role="img" aria-label={loading ? "Calendrier en cours de chargement" : `${data.total} contributions sur les 12 derniers mois`}>
                {(loading ? placeholder : weeks).map((week, w) => (
                  <div className="gc-week" key={w} style={{ "--gc-col": w }}>
                    {week.map((day, d) =>
                      day ? (
                        <span
                          key={day.date}
                          className="gc-day"
                          data-level={levelOf(day.count)}
                          data-label={describeDay(day)}
                          title={describeDay(day)}
                        />
                      ) : (
                        <span key={`empty-${w}-${d}`} className="gc-day gc-day--empty" />
                      )
                    )}
                  </div>
                ))}
              </div>

              {tip && (
                <span
                  className={`gc-tooltip${tip.below ? " is-below" : ""}`}
                  style={{ left: tip.x, top: tip.y }}
                  role="status"
                >
                  {tip.text}
                </span>
              )}
            </div>
          </div>
        </div>

        <footer className="gc-footer">
          <span className="gc-hint">GitHub et GitLab cumulés · mis à jour chaque heure</span>
          <span className="gc-legend" aria-hidden="true">
            Moins
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className="gc-day" data-level={level} />
            ))}
            Plus
          </span>
        </footer>
      </div>
    </section>
  );
});

export default GitContributionGraph;
