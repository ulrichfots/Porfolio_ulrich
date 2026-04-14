import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

const NAV_LINKS = ["Accueil", "À propos", "Compétences", "Expériences", "Projets", "Contact"];

const SKILLS = {
  Frontend: [
    { name: "React / Next.js", level: 90 },
    { name: "TypeScript / JavaScript", level: 92 },
    { name: "HTML5 / CSS3", level: 88 },
    { name: "Flutter / React Native", level: 80 },
    { name: "Angular / Vue.js", level: 72 },
  ],
  Backend: [
    { name: "Node.js / Express", level: 85 },
    { name: "Django / Flask", level: 70 },
    { name: "Symfony / PHP", level: 65 },
    { name: "REST API", level: 88 },
  ],
  "Cloud & DevOps": [
    { name: "Docker / CI-CD", level: 78 },
    { name: "AWS (EC2, Lambda)", level: 72 },
    { name: "Microsoft Azure", level: 68 },
    { name: "GitLab / Git", level: 90 },
    { name: "Grafana / Prometheus", level: 65 },
    { name: "VPS OVH", level: 75 },
  ],
  "Bases de données": [
    { name: "PostgreSQL / MySQL", level: 82 },
    { name: "MongoDB / Firebase", level: 78 },
    { name: "Dataverse", level: 75 },
  ],
  "Design & Outils": [
    { name: "Figma", level: 80 },
    { name: "Adobe Illustrator", level: 65 },
    { name: "Photoshop", level: 62 },
    { name: "WordPress / Elementor", level: 78 },
  ],
};

const EXPERIENCES = [
  {
    company: "DeBytes Ltd",
    role: "Développeur Full Stack",
    type: "Stage",
    period: "Octobre 2025 — Avril 2026",
    location: "Royaume Uni ( Remote )",
    color: "#0EA5E9",
    logo: "DB",
    highlights: [
      "Conception et développement de fonctionnalités produit full stack (UI + API) pour la plateforme",
      "Conception d'un algorithme de matching CV / offres d'emploi (scoring, pondération, itérations)",
      "Développement d'un pipeline de parsing et d'analyse sémantique de CV (extraction, normalisation)",
      "Intégration d'APIs de jobboards et gestion de la fiabilité (erreurs, retries, limites)",
      "Optimisation des performances et de l'expérience utilisateur (temps de chargement, parcours)",
    ],
    stack: ["React", "Node.js", "NLP / Matching", "API REST", "PostgreSQL"],
  },
  {
    company: "Groupe Y-KL",
    role: "Développeur Applications & Mobile",
    type: "Stage",
    period: "Janvier 2025 — Juillet 2025",
    location: "France",
    color: "#4F46E5",
    logo: "YKL",
    highlights: [
      "Analyse des besoins métiers, cadrage des fonctionnalités et priorisation avec les équipes",
      "Développement de l'application mobile Flutter (écrans, navigation, intégrations, qualité)",
      "Automatisation de processus via Power Automate / Power Platform (gains de temps opérationnels)",
      "Mise en place d'une approche qualité (tests manuels, recettes, corrections, suivi)",
      "Conception UI/UX sur Figma pour cadrer les parcours avant implémentation",
      "Développement du site vitrine en React (mise en production, responsive, maintenance)",
      ],
    stack: ["Flutter", "React", "Figma", "Power Platform", "Microsoft 365"],
    link: "https://y-kl.fr",
  },
  {
    company: "Krossbiz",
    role: "Développeur Full Stack",
    type: "Mission",
    period: "Octobre 2024 — Décembre 2024",
    location: "France",
    color: "#10B981",
    logo: "KB",
    highlights: [
      "Conception et livraison d'une application web full stack (spécifications, dev, mise en ligne)",
      "Développement d'APIs backend Node.js / Express et structuration des endpoints",
      "Intégration de paiements Stripe (sécurisation, webhooks, gestion des statuts)",
      "Modélisation et gestion des données (MongoDB / Firebase) + règles d'accès",
      "Mise en place d'une architecture scalable et maintenable (modules, séparation des responsabilités)",
    ],
    stack: ["React", "Next.js", "Node.js", "MongoDB", "Stripe", "Firebase"],
  },
];

const PROJECTS = [
  {
    id: 1,
    title: "JobGenius",
    category: "Produit",
    status: "En cours",
    statusColor: "#F59E0B",
    description:
      "Plateforme intelligente de matching entre candidats et offres d'emploi. L'algorithme analyse votre CV pour suggérer les meilleures opportunités correspondant à votre profil.",
    longDesc:
      "JobGenius utilise des techniques de traitement du langage naturel (NLP) pour parser et analyser les CV des candidats, les croiser avec les offres d'emploi récupérées via des APIs tierces, et calculer un score de compatibilité. L'interface permet de visualiser son profil enrichi et de suivre ses candidatures.",
    tech: ["React", "Node.js", "NLP", "PostgreSQL", "REST API"],
    challenges:
      "Le principal défi a été de concevoir un algorithme de scoring fiable, capable de détecter les compétences implicites dans un CV et de les mapper aux exigences d'une offre.",
    solutions:
      "Mise en place d'un pipeline NLP avec extraction d'entités nommées, vectorisation des compétences, et calcul de similarité cosinus entre profil candidat et offre.",
    icon: "🧠",
    color: "#4F46E5",
    link: "https://jobgenius-ai.com/",
    screenshots: [],
    featured: true,
  },
  {
    id: 2,
    title: "Site Groupe Y-KL",
    category: "Web",
    status: "Livré",
    statusColor: "#10B981",
    description:
      "Site institutionnel de l'entreprise Groupe Y-KL développé en React. Design moderne, animations fluides et intégration CMS pour les équipes non-techniques.",
    longDesc:
      "Développement complet du site vitrine depuis la maquette Figma jusqu'au déploiement. Le site inclut des animations de scroll, un design responsive et une interface d'administration pour la gestion des contenus.",
    tech: ["React", "CSS3", "Figma", "Animations", "CMS"],
    challenges:
      "Traduire fidèlement les maquettes Figma en code tout en garantissant des performances optimales et un rendu parfait sur tous les appareils.",
    solutions:
      "Utilisation de CSS custom properties pour le design system, lazy loading des images, et componentisation poussée pour la maintenabilité.",
    icon: "🌐",
    color: "#4F46E5",
    link: "https://projet-groupe-y-kl-kjsk.vercel.app/",
    screenshots: [],
    featured: true,
  },
  {
    id: 3,
    title: "Application Mobile Y-KL",
    category: "Mobile",
    status: "Livré",
    statusColor: "#10B981",
    description:
      "Application mobile Flutter développée pour le Groupe Y-KL. Maquettes Figma conçues en amont, développement cross-platform iOS et Android.",
    longDesc:
      "Conception UX/UI complète sur Figma puis implémentation en Flutter. L'application permet aux employés de gérer leurs plannings, accéder aux ressources internes et communiquer avec leurs équipes.",
    tech: ["Flutter", "Figma", "Dart", "REST API", "Firebase"],
    challenges:
      "Assurer une expérience identique sur iOS et Android tout en respectant les guidelines de chaque plateforme.",
    solutions:
      "Architecture BLoC pour la gestion d'état, widgets adaptatifs, et tests sur émulateurs des deux plateformes avant livraison.",
    icon: "📱",
    color: "#0EA5E9",
    screenshots: [],
    featured: true,
  },
  {
    id: 4,
    title: "Site DeBytes Ltd",
    category: "Web",
    status: "Livré",
    statusColor: "#10B981",
    description:
      "Site institutionnel de l'entreprise DeBytes Ltd, startup spécialisée dans les solutions RH digitales. Design moderne axé conversion.",
    longDesc:
      "Développement du site de présentation de la startup, avec animations d'entrée, sections dynamiques et formulaires de contact intégrés.",
    tech: ["React", "Tailwind", "Node.js", "Animations"],
    challenges: "Créer une identité visuelle forte pour une startup dans un secteur compétitif.",
    solutions:
      "Conception d'un système de design custom avec une palette cohérente, typographie distinctive et animations légères.",
    icon: "💼",
    color: "#0EA5E9",
    link: "https://debytes.io/",
    screenshots: [],
  },
  {
    id: 5,
    title: "Tirage au Sort",
    category: "DevOps",
    status: "Livré",
    statusColor: "#10B981",
    description:
      "Application web de tirage au sort déployée sur VPS OVH avec pipeline CI/CD GitLab. Infrastructure cloud configurée de A à Z.",
    longDesc:
      "Projet académique complet : développement de l'application, configuration du pipeline GitLab CI/CD auto-hébergé, déploiement sur VPS OVH, intégration de services AWS Lambda pour les traitements asynchrones.",
    tech: ["React", "Node.js", "GitLab CI/CD", "VPS OVH", "AWS Lambda", "EC2"],
    challenges:
      "Configurer une infrastructure DevOps complète avec un GitLab auto-hébergé et un pipeline de déploiement automatique.",
    solutions:
      "Mise en place d'un Dockerfile multi-stage, configuration des runners GitLab, et automatisation du déploiement via SSH sur le VPS OVH.",
    icon: "🎲",
    color: "#8B5CF6",
    screenshots: [],
  },
  {
    id: 6,
    title: "NEl'Agency — Site & Galerie",
    category: "Dashboard",
    status: "En ligne",
    statusColor: "#10B981",
    description:
      "Site vitrine + galerie d'événements. Pages galerie, ajout d'événements et dashboard d'administration.",
    longDesc:
      "Projet personnel NEl'Agency : site public (vitrine + galerie), pages dédiées à la galerie et à l'ajout d'événements, et un dashboard pour gérer les contenus (sans CMS).",
    tech: ["Web", "Dashboard"],
    challenges: "Structurer une expérience fluide entre site public, galerie et administration.",
    solutions: "Séparation claire des parcours (public vs admin) et pages dédiées.",
    icon: "🗓️",
    color: "#6366F1",
    link: "https://nelagency.com",
    screenshots: ["/maquette-nel%20agency/image.png"],
  },
  {
    id: 7,
    title: "F2I — Projet perso",
    category: "Web",
    status: "En ligne",
    statusColor: "#10B981",
    description: "Application web déployée (projet personnel).",
    longDesc: "Projet personnel déployé sur Vercel.",
    tech: ["Web"],
    challenges: "Déploiement et stabilité en production.",
    solutions: "Déploiement automatisé et itérations rapides.",
    icon: "🚀",
    color: "#0EA5E9",
    link: "https://f2i-dev22-fm-lo-am-it.vercel.app/",
    screenshots: [],
  },
  {
    id: 8,
    title: "Auto-école Amenouvévé — Dashboard",
    category: "Dashboard",
    status: "En ligne",
    statusColor: "#10B981",
    description: "Dashboard de gestion pour une auto-école.",
    longDesc:
      "Interface de gestion (dashboard) pour administrer les données et le fonctionnement de la plateforme de l'auto-école.",
    tech: ["Dashboard", "Web"],
    challenges: "Sécuriser l'accès et offrir une interface simple pour l'administration.",
    solutions: "Page de connexion et espaces dédiés à la gestion.",
    icon: "🧾",
    color: "#8B5CF6",
    link: "https://dashboard-amenouveve.auto-ecole-amenouveve.com",
    screenshots: ["/maquette-auto-%C3%A9cole/image.png", "/maquette-auto-%C3%A9cole/image%20copy.png"],
  },
  {
    id: 9,
    title: "Oskmeat — Maquette",
    category: "Maquette",
    status: "Maquette",
    statusColor: "#F59E0B",
    description: "Aperçu de maquette (UI) pour un projet web.",
    longDesc: "Maquette UI avec capture d'écran pour présenter le design.",
    tech: ["UI/UX", "Maquette"],
    challenges: "Proposer une UI claire et moderne.",
    solutions: "Hiérarchie visuelle, espacement, et cohérence graphique.",
    color: "#F59E0B",
    screenshots: ["/maquette%20oskmeat/image.png"],
  },
];

const EDUCATION = [
  {
    degree: "Master — Expert Digital",
    school: "IEF2I — Vincennes",
    period: "2024 — 2025",
    option: "Architecte Web & Mobile",
    color: "#4F46E5",
  },
  {
    degree: "Bachelor — Consultant en Développement Web & Mobile",
    school: "IEF2I — Vincennes",
    period: "Obtenu Septembre 2024",
    option: "",
    color: "#0EA5E9",
  },
];

const NavBar = memo(function NavBar({ active, onNav }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(8,8,18,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        transition: "all 0.3s ease",
        padding: "0 2rem",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          ULRICH<span style={{ color: "#6366F1" }}>.</span>
        </span>

        <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => onNav(link)}
              style={{
                background: active === link ? "rgba(99,102,241,0.15)" : "none",
                border: "none",
                color: active === link ? "#818CF8" : "rgba(255,255,255,0.6)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {link}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
          }}
          className="hamburger"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: "rgba(8,8,18,0.98)",
            padding: "1rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => {
                onNav(link);
                setMenuOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.8)",
                textAlign: "left",
                padding: "10px 0",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
});

const HeroSection = memo(function HeroSection({ sectionRef }) {
  return (
    <section
      ref={sectionRef}
      className="hero-section"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 40%),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 100% 100%, 60px 60px, 60px 60px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 800 }}>
        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 76px)",
            fontFamily: "'Fraunces', 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 16px",
            letterSpacing: "-2px",
          }}
        >
          Ulrich{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fotso
          </span>
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.62)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.2px",
            }}
          >
            Développeur Full Stack & Mobile
          </span>
        </div>

        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 560,
            margin: "0 auto 40px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Master en Expert Digital — Architecte Web & Mobile. Je conçois des applications complètes, du design Figma
          au déploiement cloud, en passant par le mobile Flutter.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#projets"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "inline-block",
            }}
          >
            Voir mes projets →
          </a>
          <a
            href="mailto:ulrichfotso10@gmail.com"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "12px 28px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Me contacter
          </a>
          <a
            href="/cv_ULRICH_FOTSO.pdf"
            download="cv_ULRICH_FOTSO.pdf"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "12px 28px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger CV
          </a>
        </div>

        <div style={{ marginTop: 34, color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>
          Torcy, France · Disponible pour missions & CDI
        </div>
      </div>
    </section>
  );
});

const AboutSection = memo(function AboutSection({ sectionRef }) {
  return (
    <section ref={sectionRef} className="section-pad" style={{ padding: "100px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <SectionTitle label="01" title="À propos" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginBottom: 20,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Développeur Full Stack, diplômé d'un{" "}
            <strong style={{ color: "#818CF8" }}>Master Expert Digital — Architecte Web & Mobile</strong> à l'IEF2I,
            je conçois et déploie des applications web et mobiles de bout en bout, avec un focus sur la qualité,
            la performance et l'expérience utilisateur.
          </p>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginBottom: 20,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Côté développement, je maîtrise l'implémentation frontend (React / Next.js) et la construction de services
            backend (Node.js / APIs), ainsi que le déploiement (Docker, CI/CD, VPS/Cloud). J'accorde une attention
            particulière à la maintenabilité (design system, composants) et aux performances (chargement, UX).
          </p>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Actuellement en développement de <strong style={{ color: "#818CF8" }}>JobGenius</strong>, une plateforme
            intelligente de matching CV / offres d'emploi utilisant le traitement du langage naturel.
          </p>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginTop: 20,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            En complément, je conçois aussi des interfaces sur <strong style={{ color: "#818CF8" }}>Figma</strong> pour
            cadrer rapidement une direction UI/UX avant l'implémentation.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <a href="https://www.linkedin.com/in/ulrich-fotso-616829254?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BgQUGpmL%2BSgivZvY%2BNDJusw%3D%3D" target="_blank" rel="noreferrer" style={socialBtn}>
              LinkedIn
            </a>
            <a href="https://github.com/ulrichfots" target="_blank" rel="noreferrer" style={socialBtn}>
              GitHub
            </a>
            <a href="https://gitlab.com/ulrichfots" target="_blank" rel="noreferrer" style={socialBtn}>
              GitLab
            </a>
            <a
              href="mailto:ulrichfotso10@gmail.com"
              onPointerUp={(e) => {
                // iOS Safari can keep :focus after tap
                setTimeout(() => e.currentTarget.blur?.(), 0);
              }}
              style={{
                ...socialBtn,
                background: "rgba(99,102,241,0.15)",
                borderColor: "rgba(99,102,241,0.3)",
                color: "#818CF8",
              }}
            >
              Email
            </a>
          </div>
        </div>

        <div>
          {EDUCATION.map((edu, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: `3px solid ${edu.color}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  marginBottom: 6,
                }}
              >
                {edu.period}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {edu.degree}
              </div>
              {edu.option && (
                <div style={{ fontSize: 13, color: "#818CF8", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Option : {edu.option}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  marginTop: 4,
                }}
              >
                {edu.school}
              </div>
            </div>
          ))}

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "3px solid #10B981",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: 6,
              }}
            >
              Formation complémentaire
            </div>
            <div
              style={{
                fontWeight: 600,
                color: "#fff",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Certifications Microsoft
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Microsoft Power Apps: Building Low-Code Business Applications",
                "Introduction to Microsoft Power Platform",
                "App Development with Power Apps: Custom Components",
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#10B981", flexShrink: 0 }}>✓</span> {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const socialBtn = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.7)",
  padding: "8px 18px",
  borderRadius: 8,
  textDecoration: "none",
  fontSize: 13,
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 500,
};

const SkillBar = memo(function SkillBar({ name, level }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setAnimated(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "'Space Grotesk', sans-serif" }}>
          {name}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif" }}>
          {level}%
        </span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: animated ? `${level}%` : "0%",
            background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
            borderRadius: 4,
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
});

const SkillsSection = memo(function SkillsSection({ sectionRef }) {
  const [activeTab, setActiveTab] = useState("Frontend");

  return (
    <section ref={sectionRef} style={{ padding: "100px 2rem", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle label="02" title="Compétences" />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {Object.keys(SKILLS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                background: activeTab === cat ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  activeTab === cat ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"
                }`,
                color: activeTab === cat ? "#818CF8" : "rgba(255,255,255,0.55)",
                padding: "8px 18px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div>
            {SKILLS[activeTab].map((s) => (
              <SkillBar key={s.name} name={s.name} level={s.level} />
            ))}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
              Tech stack principal
            </div>
            {["React", "Next.js", "TypeScript", "Flutter", "Node.js", "Docker", "AWS", "Figma"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1" }} />
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const ExperienceSection = memo(function ExperienceSection({ sectionRef }) {
  const [active, setActive] = useState(0);
  const exp = EXPERIENCES[active];

  return (
    <section ref={sectionRef} style={{ padding: "100px 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <SectionTitle label="03" title="Expériences" />
      <div className="experience-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>
        <div>
          <div
            className="experience-hint"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: 10,
              display: "none",
            }}
          >
            Touchez une expérience pour afficher le détail.
          </div>
          {EXPERIENCES.map((e, i) => (
            <button
              key={e.company}
              onClick={() => setActive(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: active === i ? "rgba(255,255,255,0.04)" : "none",
                border: "none",
                borderLeft: `2px solid ${active === i ? e.color : "rgba(255,255,255,0.08)"}`,
                padding: "16px 20px",
                cursor: "pointer",
                marginBottom: 4,
                borderRadius: "0 8px 8px 0",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 600, color: active === i ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>
                  {e.company}
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    color: active === i ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                    fontSize: 18,
                    lineHeight: 1,
                    transform: active === i ? "translateX(2px)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ›
                </div>
              </div>
              <div style={{ fontSize: 12, color: active === i ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif", marginTop: 2 }}>
                {e.period}
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 36,
            transition: "all 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${exp.color}22`,
                    border: `1px solid ${exp.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: exp.color,
                    fontSize: 13,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {exp.logo}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600 }}>
                    {exp.role}
                  </h3>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {exp.company} · {exp.location}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    background: `${exp.color}22`,
                    color: exp.color,
                    border: `1px solid ${exp.color}44`,
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {exp.type}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {exp.period}
                </span>
              </div>
            </div>
            {exp.link && (
              <a
                href={exp.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  padding: "6px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Voir le site ↗
              </a>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            {exp.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: exp.color, flexShrink: 0, marginTop: 2 }}>▹</span>
                {h}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {exp.stack.map((s) => (
              <span
                key={s}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const ProjectCard = memo(function ProjectCard({ project, onOpen, numberLabel }) {
  return (
    <div
      onClick={() => onOpen(project)}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 28,
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid rgba(99,102,241,0.3)";
        e.currentTarget.style.background = "rgba(99,102,241,0.05)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at center, ${project.color}15, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontSize: 12,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.55)",
          fontFamily: "'Space Grotesk', sans-serif",
          textTransform: "uppercase",
          userSelect: "none",
        }}
      >
        {numberLabel}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.65)",
            padding: "3px 10px",
            borderRadius: 100,
            fontSize: 11,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          {project.category ?? "Autre"}
        </span>
        <span
          style={{
            background: `${project.statusColor}22`,
            color: project.statusColor,
            border: `1px solid ${project.statusColor}44`,
            padding: "3px 10px",
            borderRadius: 100,
            fontSize: 11,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          {project.status}
        </span>
      </div>

      <h3 style={{ margin: "0 0 10px", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600 }}>
        {project.title}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6, marginBottom: 20, margin: "0 0 20px" }}>
        {project.description}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "rgba(99,102,241,0.7)", fontFamily: "'Space Grotesk', sans-serif" }}>Voir les détails →</div>
    </div>
  );
});

const ProjectModal = memo(function ProjectModal({ project, onClose }) {
  if (!project) return null;
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    setLightboxSrc(null);
  }, [project]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxSrc]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0D0D1F",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 40,
          maxWidth: 680,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>
                {project.title}
              </h2>
              <span
                style={{
                  background: `${project.statusColor}22`,
                  color: project.statusColor,
                  border: `1px solid ${project.statusColor}44`,
                  padding: "3px 10px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {project.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Space Grotesk', sans-serif" }}>
          {project.longDesc}
        </p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Technologies utilisées
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.tech.map((t) => (
              <span
                key={t}
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#818CF8",
                  padding: "5px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="project-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(239,68,68,0.7)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              ⚠ Défis rencontrés
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              {project.challenges}
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(16,185,129,0.7)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              ✓ Solutions apportées
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              {project.solutions}
            </p>
          </div>
        </div>

        {Array.isArray(project.screenshots) && project.screenshots.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Captures
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {project.screenshots.map((src, idx) => (
                <button
                  type="button"
                  key={`${src}-${idx}`}
                  onClick={() => setLightboxSrc(src)}
                  style={{
                    display: "block",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={src}
                    alt={`Capture ${idx + 1} — ${project.title}`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {project.link && (
          <div style={{ marginTop: 24 }}>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              Voir le projet ↗
            </a>
          </div>
        )}

        {lightboxSrc && (
          <div
            onClick={() => setLightboxSrc(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "rgba(0,0,0,0.86)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxSrc(null);
              }}
              aria-label="Fermer"
              style={{
                position: "fixed",
                top: 18,
                right: 18,
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                fontSize: 18,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              ✕
            </button>
            <img
              src={lightboxSrc}
              alt={`Capture — ${project.title}`}
              decoding="async"
              style={{
                maxWidth: "min(1100px, 96vw)",
                maxHeight: "92vh",
                width: "auto",
                height: "auto",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
});

const ProjectsSection = memo(function ProjectsSection({ sectionRef }) {
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tous");

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of PROJECTS) set.add(p.category ?? "Autre");
    return ["Tous", ...Array.from(set)];
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Tous") return PROJECTS;
    return PROJECTS.filter((p) => (p.category ?? "Autre") === activeCategory);
  }, [activeCategory]);

  return (
    <section ref={sectionRef} id="projets" style={{ padding: "100px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle label="04" title="Projets" />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeCategory === cat ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
                color: activeCategory === cat ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                padding: "8px 14px",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filteredProjects.map((p, idx) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={setSelected}
              numberLabel={String(idx + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </div>
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
});

const ContactSection = memo(function ContactSection({ sectionRef }) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(t);
  }, [sent]);

  return (
    <section ref={sectionRef} style={{ padding: "100px 2rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <SectionTitle label="05" title="Contact" centered />

        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.7, marginBottom: 40 }}>
          Disponible pour des missions freelance, des alternances ou des postes CDI. N'hésitez pas à me contacter !
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 48 }}>
          {[
            { icon: "📧", label: "Email", value: "ulrichfotso10@gmail.com", href: "mailto:ulrichfotso10@gmail.com" },
            { icon: "📍", label: "Localisation", value: "Torcy, France", href: null },
            { icon: "📱", label: "Téléphone", value: "+33 6 95 51 65 47", href: "tel:+33695516547" },
          ].map(({ icon, label, value, href }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                {label}
              </div>
              {href ? (
                <a href={href} style={{ fontSize: 12, color: "#818CF8", fontFamily: "'Space Grotesk', sans-serif", textDecoration: "none" }}>
                  {value}
                </a>
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="mailto:ulrichfotso10@gmail.com"
            onClick={(e) => {
              setSent(true);
              // Avoid "stuck" focus highlight on mobile after tap
              setTimeout(() => e.currentTarget.blur?.(), 0);
            }}
            onPointerUp={(e) => {
              setTimeout(() => e.currentTarget.blur?.(), 0);
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "14px 32px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Envoyer un email →
          </a>
          <a
            href="https://www.linkedin.com/in/ulrich-fotso-616829254?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BgQUGpmL%2BSgivZvY%2BNDJusw%3D%3D"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "14px 32px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            LinkedIn
          </a>
          <a
            href="https://gitlab.com/ulrichfots"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "14px 32px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            GitLab
          </a>
          <a
            href="/cv_ULRICH_FOTSO.pdf"
            download="cv_ULRICH_FOTSO.pdf"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              padding: "14px 32px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger mon CV
          </a>
        </div>

        {sent && (
          <div style={{ marginTop: 18, fontSize: 12, color: "rgba(16,185,129,0.8)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Ouverture de votre client email…
          </div>
        )}
      </div>
    </section>
  );
});

const SectionTitle = memo(function SectionTitle({ label, title, centered }) {
  return (
    <div style={{ marginBottom: 56, textAlign: centered ? "center" : "left" }}>
      <div style={{ fontSize: 12, color: "#6366F1", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
        {label} /
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 42px)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          letterSpacing: "-1px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: 60,
          height: 3,
          background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
          borderRadius: 2,
          marginTop: 14,
          marginLeft: centered ? "auto" : 0,
          marginRight: centered ? "auto" : 0,
        }}
      />
    </div>
  );
});

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("Accueil");

  const accueilRef = useRef(null);
  const aProposRef = useRef(null);
  const competencesRef = useRef(null);
  const experiencesRef = useRef(null);
  const projetsRef = useRef(null);
  const contactRef = useRef(null);

  const sections = useMemo(
    () => [
      { name: "Accueil", ref: accueilRef },
      { name: "À propos", ref: aProposRef },
      { name: "Compétences", ref: competencesRef },
      { name: "Expériences", ref: experiencesRef },
      { name: "Projets", ref: projetsRef },
      { name: "Contact", ref: contactRef },
    ],
    []
  );

  const sectionNameByElRef = useRef(new Map());

  useEffect(() => {
    const map = new Map();
    for (const s of sections) {
      if (s.ref.current) map.set(s.ref.current, s.name);
    }
    sectionNameByElRef.current = map;
  }, [sections]);

  const scrollTo = useCallback(
    (section) => {
      const match = sections.find((s) => s.name === section);
      match?.ref?.current?.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    },
    [sections]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = sectionNameByElRef.current.get(entry.target);
          if (!name) continue;
          setActiveSection((prev) => (prev === name ? prev : name));
        }
      },
      { threshold: 0.3 }
    );
    for (const s of sections) {
      if (s.ref.current) observer.observe(s.ref.current);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080812; color: #fff; overflow-x: hidden; }
        a, button { -webkit-tap-highlight-color: transparent; }
        a:focus:not(:focus-visible), button:focus:not(:focus-visible) { outline: none; box-shadow: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (max-width: 900px) {
          .skills-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .experience-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .experience-hint { display: block !important; }
        }
        @media (max-width: 640px) {
          section > div { grid-template-columns: 1fr !important; }
          .project-modal-two-col { grid-template-columns: 1fr !important; }
          .hero-section { min-height: auto !important; padding-top: 92px !important; padding-bottom: 40px !important; }
          .section-pad { padding-top: 64px !important; padding-bottom: 64px !important; }
        }
      `}</style>

      <NavBar active={activeSection} onNav={scrollTo} />

      <HeroSection sectionRef={accueilRef} />
      <AboutSection sectionRef={aProposRef} />
      <SkillsSection sectionRef={competencesRef} />
      <ExperienceSection sectionRef={experiencesRef} />
      <ProjectsSection sectionRef={projetsRef} />
      <ContactSection sectionRef={contactRef} />

      <footer
        style={{
          textAlign: "center",
          padding: "40px 2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.25)",
          fontSize: 13,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        © 2026 Ulrich Fotso— Conçu & développé avec React
      </footer>
    </>
  );
}

