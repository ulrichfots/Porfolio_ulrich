# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Fonctionnalités dynamiques du portfolio

## Stack et commandes

Le portfolio tourne sous **Next.js 16 (App Router)**, déployé sur Vercel. La page est prérendue au build :
le HTML servi contient tout le contenu, y compris pour les robots qui n'exécutent pas de JavaScript.

```bash
npm run dev        # Next.js en développement
npm run build      # build Next (lance d'abord les instantanés Git)
npm run start      # servir le build Next en local
npm run lint       # ESLint sur tout le projet
```

- `app/page.jsx` est un composant serveur : il récupère l'activité Git et le calendrier (`revalidate = 3600`, donc au plus
  une régénération par heure), puis rend `src/Portfolio.jsx`. Résultat : les données sont déjà dans le HTML, et le
  navigateur ne lance aucun appel tant qu'elles sont fraîches. Si une source échoue, le composant reprend la main côté client.
- Les durées relatives de la bannière sont formatées à la main : `Intl.RelativeTimeFormat` diffère entre Node et Chrome
  (espace insécable), ce qui casserait l'hydratation.
- `app/layout.jsx` porte les métadonnées (titre, Open Graph, données structurées) via l'API Metadata.
- `app/api/*/route.js` : les endpoints du site. Les anciens fichiers `api/*.js` (format Vercel autonome) et la chaîne
  Vite (`index.html`, `src/main.jsx`, `npm run dev:vite`, `npm run build:vite`) sont conservés et restent fonctionnels,
  mais ne sont plus utilisés par le déploiement.
- Dans Vercel, le **Framework Preset doit être « Next.js »** (il était sur Vite). Sans ce réglage, le déploiement
  chercherait un dossier `dist`.

## Variables d'environnement

Copier `.env.example` en `.env` (ignoré par Git) et, sur Vercel, déclarer les mêmes variables dans
**Project Settings → Environment Variables**. Aucune n'est préfixée `VITE_` : elles ne sont jamais envoyées au navigateur.

## Bannière d'activité Git (GitHub + GitLab)

- `app/api/git-activity/route.js` : route Next qui mélange les derniers pushes GitHub/GitLab, avec un cache CDN d'1 h.
- `npm run sync:activity` : génère l'instantané `public/data/git-activity.json`, lancé automatiquement avant chaque build.
  C'est la source de secours du composant si la route est indisponible. En développement, `npm run dev` sert la vraie
  route, Next chargeant `.env` de lui-même.
- Les dépôts privés sont anonymisés côté serveur (`GIT_ACTIVITY_PRIVATE=anonymize`).

## Calendrier de contributions (12 derniers mois)

- `app/api/git-contributions/route.js` : route Next qui cumule les contributions GitHub et GitLab par jour, cache CDN d'1 h.
- `npm run sync:contributions` : génère l'instantané `public/data/git-contributions.json`, lancé avant chaque build.
- GitHub exige `GITHUB_TOKEN` (son API GraphQL n'accepte aucune requête anonyme). Sans token, seul GitLab est affiché.
- Côté GitLab, un token fait remonter aussi les contributions des projets privés ; sans token, seul le calendrier public est lu.
- Seuls des compteurs par jour sont exposés : aucun nom de dépôt ne sort du serveur.

## Synchro IA des projets

```bash
npm run sync:projects -- --dry-run   # aperçu : aucun appel IA, aucune écriture
npm run sync:projects                # génère / met à jour src/data/projects.generated.json
npm run sync:projects -- --force     # régénère toutes les fiches non verrouillées
```

- Seul `src/data/projects.generated.json` est écrit. Les projets manuels (`Portfolio.jsx`, `src/data/recentProjects.js`) ont toujours priorité.
- L'IA n'est rappelée que si le README, la description, les topics ou les langages d'un dépôt ont changé.
- Dans le JSON : `"locked": true` fige une fiche retouchée à la main, `"hidden": true` la masque.
- `scripts/sync.config.json` : exclusions, dépôts privés autorisés (`includePrivate`), rattachement d'un dépôt à un projet manuel (`linkToManual`).
- `.github/workflows/sync-projects.yml` : exécution chaque lundi (ou manuelle) avec ouverture d'une Pull Request à relire.
  Secrets requis : `GH_PAT`, `GITLAB_TOKEN`, `ANTHROPIC_API_KEY`.
- Les fiches sont rédigées par Claude (`claude-opus-5` par défaut, modifiable avec `AI_MODEL`) via le SDK officiel `@anthropic-ai/sdk`.
