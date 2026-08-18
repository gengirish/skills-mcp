import stats from "./catalog-stats.json";

/**
 * Canonical origin. Feeds metadataBase, OpenGraph, Twitter cards and the
 * JSON-LD block in app/layout.tsx — change here only.
 */
export const SITE_URL = "https://skillsmcp.intelliforge.tech";

export const REPO_URL = "https://github.com/gengirish/skills-mcp";
export const NPM_URL = "https://www.npmjs.com/package/@gengirish/skills-mcp";
export const PKG = "@gengirish/skills-mcp";

/**
 * The npm dist-tag, synced by `npm run sync:stats` — not the version in the
 * source repo. The badge should promise what `npm i -g` actually installs,
 * which lags the repo whenever a release is committed but not yet published.
 */
export const VERSION = stats.publishedVersion;

/** Live catalog totals — regenerate with `npm run sync:stats`. */
export const STATS = stats;

/** Rounded down to the nearest thousand for headline use. */
export const SKILLS_ROUNDED = `${Math.floor(
  stats.skills / 1000
).toLocaleString("en-US")},000+`;

export const SKILLS_EXACT = stats.skills.toLocaleString("en-US");

/**
 * Install globally rather than via `npx`. `npx` re-resolves the package on
 * every launch (~13s to ready vs ~0.5s installed), which is longer than
 * several MCP clients allow for the connect handshake.
 */
export const INSTALL_CMD = `npm i -g ${PKG}`;

export const NAV_LINKS = [
  { label: "Why", href: "#why" },
  { label: "Tools", href: "#tools" },
  { label: "Install", href: "#install" },
  { label: "Catalog", href: "#catalog" },
] as const;

export const HERO_STATS = [
  { value: SKILLS_EXACT, label: "skills indexed" },
  { value: String(stats.repos), label: "source repos" },
  { value: String(stats.domains), label: "domains" },
  { value: "daily", label: "catalog refresh" },
] as const;

export const TOOLS = [
  {
    name: "search_skills",
    accent: "green",
    summary: "Free-text and faceted search across the whole catalog.",
    detail:
      "Filter by domain, repo or tier. Served in-memory from the bundled index, so there is no network round-trip.",
  },
  {
    name: "recommend_skills",
    accent: "green",
    summary: "Describe the task in plain English, get ranked skills back.",
    detail:
      '"Add Stripe payments to a Next.js app" resolves to the skills that actually cover it.',
  },
  {
    name: "get_skill",
    accent: "blue",
    summary: "Fetch the full SKILL.md for any result.",
    detail:
      "Pulled live from the upstream repo, frontmatter and instructions intact, so you can read before you install.",
  },
  {
    name: "install_skill",
    accent: "purple",
    summary: "Write a skill folder straight into your IDE.",
    detail:
      "Targets Cursor, Claude Code, Claude Desktop, Codex, Windsurf, OpenCode, or any custom directory. Nested reference files come along.",
  },
  {
    name: "list_domains",
    accent: "blue",
    summary: "All 20 logical domains with live counts.",
    detail:
      "Testing, security, devops, ai-ml, frontend, backend, data, documents and more.",
  },
  {
    name: "list_repos",
    accent: "blue",
    summary: "Every source repository, with counts and upstream links.",
    detail:
      "Useful when you trust one publisher more than another and want to scope a search to it.",
  },
  {
    name: "catalog_stats",
    accent: "amber",
    summary: "Versions, totals and catalog generation time.",
    detail:
      "Always reports the live figure, so an agent never reasons from a stale count.",
  },
] as const;

export type Accent = (typeof TOOLS)[number]["accent"];

export const INSTALL_TARGETS = [
  {
    id: "claude-code",
    label: "Claude Code",
    lang: "bash",
    note: "The -- is required: without it, claude mcp add reads the rest as its own flags. Windows needs the cmd /c wrapper because the global binary is a .cmd shim. Add -s user to register it for every project.",
    code: `npm i -g ${PKG}

claude mcp add skills -- skills-mcp          # macOS / Linux
claude mcp add skills -- cmd /c skills-mcp   # Windows`,
  },
  {
    id: "cursor",
    label: "Cursor",
    lang: "json",
    note: "Run npm i -g @gengirish/skills-mcp first, then add this to ~/.cursor/mcp.json, or .cursor/mcp.json for one project. Restart Cursor afterwards.",
    code: `{
  "mcpServers": {
    "skills": {
      "command": "skills-mcp"
    }
  }
}`,
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    lang: "json",
    note: "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json · Windows: %APPDATA%\\Claude\\claude_desktop_config.json",
    code: `{
  "mcpServers": {
    "skills": {
      "command": "skills-mcp"
    }
  }
}`,
  },
  {
    id: "cline",
    label: "Cline",
    lang: "json",
    note: "Cline settings → MCP Servers.",
    code: `{
  "skills": {
    "command": "skills-mcp"
  }
}`,
  },
  {
    id: "continue",
    label: "Continue",
    lang: "yaml",
    note: "Add to ~/.continue/config.yaml.",
    code: `mcpServers:
  - name: skills
    command: skills-mcp`,
  },
  {
    id: "other",
    label: "Anything else",
    lang: "bash",
    note: "Any MCP-compatible client can spawn the binary over stdio — Windsurf, OpenCode, Zed, your own harness. Prefer the installed binary over npx: npx re-resolves the package on every launch (~13s to ready vs ~0.5s), which several clients treat as a failed connection.",
    code: `npm i -g ${PKG}
skills-mcp`,
  },
] as const;

export type InstallTargetId = (typeof INSTALL_TARGETS)[number]["id"];

export const PROBLEMS = [
  {
    title: "Scattered across a dozen repos",
    body: `Anthropic publishes a handful. Superpowers, wshobson, antigravity, Composio and TerminalSkills publish thousands more. ${stats.repos} repositories, no common home.`,
  },
  {
    title: "No search layer",
    body: "You find a skill by already knowing which repo it lives in. There is no index to query and nothing to rank results against your actual task.",
  },
  {
    title: "No install path",
    body: "Once you've found one, you copy a folder by hand into the right directory for your editor — and repeat it on every machine.",
  },
] as const;

export const FOOTER_LINKS = [
  { label: "GitHub", href: REPO_URL },
  { label: "npm", href: NPM_URL },
  { label: "Releases", href: `${REPO_URL}/releases` },
  { label: "Changelog", href: `${REPO_URL}/blob/main/CHANGELOG.md` },
  { label: "Issues", href: `${REPO_URL}/issues` },
  { label: "MCP spec", href: "https://modelcontextprotocol.io" },
] as const;
