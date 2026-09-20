import "../src/index.css";

const SITE_URL = "https://porfolio-ulrich.vercel.app";
const TITLE = "Ulrich Fotso — Développeur Full Stack & Mobile";
const DESCRIPTION =
  "Architecture, développement web et mobile, CI/CD et mise en production. Projets, expériences et contact.";

// Métadonnées gérées par Next : équivalent des balises de index.html (conservé pour le build Vite)
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    "Portfolio d'Ignace Ulrich Fotso Tamdem, développeur Full Stack (React/Next.js, Node.js, NestJS) & Mobile (Flutter). Architecture, CI/CD, projets et contact.",
  authors: [{ name: "Ignace Ulrich Fotso Tamdem" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "Ulrich Fotso — Portfolio",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "fr_FR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Ulrich Fotso, développeur Full Stack & Mobile : React/Next.js, TypeScript, NestJS, Node.js, Flutter, Docker, CI/CD.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#080812",
  width: "device-width",
  initialScale: 1,
};

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ignace Ulrich Fotso Tamdem",
  jobTitle: "Développeur Full Stack & Mobile",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  address: { "@type": "PostalAddress", addressLocality: "Torcy", addressCountry: "FR" },
  sameAs: [
    "https://github.com/ulrichfots",
    "https://gitlab.com/ulrichfots",
    "https://www.linkedin.com/in/ulrich-fotso-616829254",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
