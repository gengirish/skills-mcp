import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  NPM_URL,
  PKG,
  REPO_URL,
  SITE_URL,
  SKILLS_EXACT,
  SKILLS_ROUNDED,
  STATS,
  VERSION,
} from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const title = `skills-mcp — ${SKILLS_ROUNDED} agent skills. One MCP server.`;
const description = `Search, preview and install agent skills from ${STATS.repos} source repos — in Cursor, Claude Code, Cline, Windsurf, or any MCP client. ${SKILLS_EXACT} skills indexed and refreshed daily.`;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(SITE_URL),
  applicationName: "skills-mcp",
  keywords: [
    "MCP server",
    "Model Context Protocol",
    "agent skills",
    "SKILL.md",
    "Claude Code",
    "Cursor",
    "Cline",
    "Windsurf",
    "AI agents",
    "skills registry",
    "skills-mcp",
  ],
  authors: [{ name: "gengirish", url: REPO_URL }],
  creator: "gengirish",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "skills-mcp",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#0D1117" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "skills-mcp",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  softwareVersion: VERSION,
  description,
  url: SITE_URL,
  codeRepository: REPO_URL,
  downloadUrl: NPM_URL,
  installUrl: NPM_URL,
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Person", name: "gengirish", url: REPO_URL },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  keywords: `MCP, Model Context Protocol, agent skills, ${PKG}`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/*
          Runs before first paint so the entrance animations can start from
          their hidden state without a flash. Everything stays visible if this
          never executes — see the `.js` gating in globals.css.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
