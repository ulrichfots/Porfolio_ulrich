import { memo } from "react";

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "10px 22px",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 14,
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
};

// Liens secondaires d'un projet (ex. interface d'administration, code source), affichés sous « Voir le projet ».
const ProjectExtraLinks = memo(function ProjectExtraLinks({ project }) {
  const links = [
    ...(Array.isArray(project?.links) ? project.links : []),
    ...(project?.repo && project.repo !== project.link ? [{ label: "Code source", url: project.repo }] : []),
  ].filter((l) => l?.url);

  if (links.length === 0) return null;

  return (
    <div style={{ marginTop: project.link ? 12 : 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={linkStyle}>
          {l.label} ↗
        </a>
      ))}
    </div>
  );
});

export default ProjectExtraLinks;
