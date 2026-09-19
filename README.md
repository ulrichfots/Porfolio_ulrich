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

## Variables d'environnement

Copier `.env.example` en `.env` (ignoré par Git) et, sur Vercel, déclarer les mêmes variables dans
**Project Settings → Environment Variables**. Aucune n'est préfixée `VITE_` : elles ne sont jamais envoyées au navigateur.

## Bannière d'activité Git (GitHub + GitLab)

- `api/git-activity.js` : fonction Vercel qui mélange les derniers pushes GitHub/GitLab, avec un cache CDN d'1 h.
- `npm run sync:activity` : génère l'instantané `public/data/git-activity.json`, lancé automatiquement avant chaque build.
  C'est la source de secours du composant, et la seule disponible avec `npm run dev`.
- Les dépôts privés sont anonymisés côté serveur (`GIT_ACTIVITY_PRIVATE=anonymize`).

## Calendrier de contributions (12 derniers mois)

- `api/git-contributions.js` : fonction Vercel qui cumule les contributions GitHub et GitLab par jour, cache CDN d'1 h.
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
