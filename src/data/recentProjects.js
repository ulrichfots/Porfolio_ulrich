// Projets et expérience ajoutés manuellement (même format que PROJECTS / EXPERIENCES dans Portfolio.jsx).

export const RECENT_PROJECTS = [
  {
    id: 10,
    title: "tnvj.fr",
    category: "DevOps",
    status: "En ligne",
    statusColor: "#10B981",
    description:
      "Mise en place de l'architecture complète, pipeline CI/CD robuste et gestion d'un environnement de préproduction.",
    longDesc:
      "Conception de l'architecture de bout en bout et industrialisation des livraisons : pipeline CI/CD automatisé du commit jusqu'à la mise en production, avec un environnement de préproduction dédié pour valider chaque évolution avant sa mise en ligne.",
    tech: ["Architecture", "CI/CD", "Préproduction", "Déploiement continu"],
    challenges:
      "Livrer régulièrement de nouvelles fonctionnalités sans jamais mettre en risque le site en production.",
    solutions:
      "Pipeline CI/CD robuste enchaînant build, vérifications et déploiement, et préproduction isolée servant de recette avant chaque mise en production.",
    icon: "🏗️",
    color: "#8B5CF6",
    link: "https://tnvj.fr",
    screenshots: [],
  },
  {
    id: 11,
    title: "chantierpro-ultra.com",
    category: "DevOps",
    status: "En ligne",
    statusColor: "#10B981",
    description:
      "Architecture complète, déploiement continu (CI/CD) et environnement de préproduction configuré.",
    longDesc:
      "Mise en place de l'architecture complète de la plateforme et d'une chaîne de déploiement continu : chaque modification validée est testée en préproduction puis déployée automatiquement, pour des mises en ligne fréquentes et maîtrisées.",
    tech: ["Architecture", "CI/CD", "Déploiement continu", "Préproduction"],
    challenges:
      "Garantir des déploiements fréquents et reproductibles tout en gardant la production stable.",
    solutions:
      "Déploiement continu automatisé et environnement de préproduction configuré à l'identique de la production pour fiabiliser chaque mise en ligne.",
    icon: "🚧",
    color: "#0EA5E9",
    link: "https://chantierpro-ultra.com",
    screenshots: [],
  },
  {
    id: 12,
    title: "lijob.fr",
    category: "Produit",
    status: "En ligne",
    statusColor: "#10B981",
    description:
      "CEO / CTO de lijob.fr : direction du produit et de la technique, architecture complète, pipeline CI/CD et environnement de préproduction.",
    longDesc:
      "En tant que CEO / CTO, je pilote lijob.fr sur le plan stratégique comme technique : définition de l'architecture complète de la plateforme, mise en place d'un pipeline CI/CD et gestion d'un environnement de préproduction permettant de tester chaque version dans des conditions proches du réel avant sa publication.",
    tech: ["Architecture", "CI/CD", "Préproduction", "Déploiement"],
    challenges:
      "Mener de front la direction de l'entreprise et la direction technique, tout en itérant vite sans régression en production.",
    solutions:
      "Pipeline CI/CD automatisé et séparation claire des environnements (préproduction / production) avec validation avant chaque release.",
    icon: "💼",
    color: "#4F46E5",
    link: "https://lijob.fr",
    screenshots: [],
  },
  {
    id: 13,
    title: "David Massage Reset",
    category: "Web",
    status: "En ligne",
    statusColor: "#10B981",
    description: "Développement du site vitrine et de son interface d'administration dédiée.",
    longDesc:
      "Réalisation du site vitrine public ainsi que d'une interface d'administration dédiée, permettant au client de gérer lui-même les contenus de son site.",
    tech: ["Site vitrine", "Interface d'administration", "Responsive"],
    challenges:
      "Offrir au client une interface d'administration simple, adaptée à un usage non technique, en parallèle du site public.",
    solutions:
      "Séparation claire entre le site vitrine public et un espace d'administration dédié, accessible via /admin.",
    icon: "💆",
    color: "#10B981",
    link: "https://www.davidmassagereset.fr",
    links: [{ label: "Interface d'administration", url: "https://www.davidmassagereset.fr/admin" }],
    screenshots: [],
  },
  {
    id: 14,
    title: "Portfolio personnel",
    category: "Web",
    status: "En ligne",
    statusColor: "#10B981",
    description:
      "Portfolio React déployé sur Vercel, avec une bannière d'activité Git alimentée en direct par GitHub et GitLab.",
    longDesc:
      "Portfolio développé en React 19 et Vite, déployé sur Vercel. Une fonction serverless agrège mes derniers pushes GitHub et GitLab et met la réponse en cache une heure sur le CDN. Un script de synchronisation génère en plus les fiches de mes dépôts à partir de leurs README via l'API Claude, relues en Pull Request avant publication.",
    tech: ["React 19", "Vite", "Vercel", "API GitHub / GitLab", "Claude API", "CI/CD"],
    challenges:
      "Afficher une activité Git à jour sans exposer de token côté navigateur ni saturer les quotas des API GitHub et GitLab.",
    solutions:
      "Fonction serverless avec cache CDN d'une heure, instantané JSON généré au build en secours, et anonymisation des dépôts privés côté serveur.",
    icon: "🧑‍💻",
    color: "#6366F1",
    link: "https://porfolio-ulrich.vercel.app",
    repo: "https://github.com/ulrichfots/Porfolio_ulrich",
    screenshots: [],
  },
];

export const RECENT_EXPERIENCES = [
  {
    company: "lijob.fr",
    role: "CEO / CTO",
    type: "Dirigeant",
    period: "En cours",
    location: "France",
    color: "#4F46E5",
    logo: "LJ",
    highlights: [
      "Direction générale et technique de lijob.fr (CEO / CTO)",
      "Définition de l'architecture complète de la plateforme",
      "Mise en place du pipeline CI/CD et automatisation des déploiements",
      "Gestion de l'environnement de préproduction et du cycle de mise en production",
    ],
    stack: ["Architecture", "CI/CD", "Préproduction", "Déploiement"],
    link: "https://lijob.fr",
  },
  {
    company: "Freelance",
    role: "Architecte Web & DevOps",
    type: "Freelance",
    period: "Missions en cours",
    location: "France",
    color: "#8B5CF6",
    logo: "FL",
    highlights: [
      "tnvj.fr — Architecture complète, pipeline CI/CD robuste et gestion d'un environnement de préproduction",
      "chantierpro-ultra.com — Architecture complète, déploiement continu (CI/CD) et préproduction configurée",
      "David Massage Reset — Développement du site vitrine et de son interface d'administration dédiée",
    ],
    stack: ["Architecture", "CI/CD", "Préproduction", "Déploiement continu", "Administration"],
  },
];
