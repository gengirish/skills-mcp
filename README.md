# skills-mcp

> An MCP server that lets any AI agent **discover, search, and install ~7,000 agent skills** from across the GitHub ecosystem (Anthropic, Superpowers, wshobson, antigravity, Composio, antfu, TerminalSkills, and more).

[![npm version](https://img.shields.io/badge/npm-%40gengirish%2Fskills--mcp-cb3837)](https://www.npmjs.com/package/@gengirish/skills-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What it does

The Model Context Protocol (MCP) lets editors like **Cursor**, **Claude Desktop**, **Claude Code**, **Cline**, **Continue**, **Windsurf**, and **OpenCode** plug in external tool providers. This server provides:

| Tool | Purpose |
|---|---|
| `search_skills` | Free-text + faceted search (domain / repo / tier) |
| `get_skill` | Fetch the full `SKILL.md` content from upstream GitHub |
| `recommend_skills` | "I want to add Stripe to Next.js" → ranked skill suggestions |
| `list_domains` | All 20 logical domains with skill counts |
| `list_repos` | All source repositories with counts and links |
| `install_skill` | **Download a skill folder into your IDE's skills directory** |
| `catalog_stats` | Versions, generation time, totals |

Plus a resource (`skills://catalog`) exposing the full JSON index.

---

## Quick stats

| | |
|---|---|
| **Skills indexed** | 6,998 |
| **Source repositories** | 11 |
| **Logical domains** | 20 (testing, security, devops, ai-ml, frontend, backend, data, marketing, docs, …) |
| **Top domain** | AI/ML/LLM (3,923 skills) |
| **Top repo** | antigravity-awesome-skills (4,293 skills) |

The catalog is built **directly from upstream GitHub repos** (no local clones needed) by `scripts/build-catalog.mjs` and shipped inside the npm package — so `search_skills` has zero network latency. `get_skill` and `install_skill` fetch live from GitHub on demand.

---

## Installation

### Cursor

Edit `~/.cursor/mcp.json` (or per-project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "skills": {
      "command": "npx",
      "args": ["-y", "@gengirish/skills-mcp"]
    }
  }
}
```

Restart Cursor. The agent will auto-discover the tools.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "skills": {
      "command": "npx",
      "args": ["-y", "@gengirish/skills-mcp"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add skills npx -y @gengirish/skills-mcp
```

### Cline (VS Code extension)

In Cline's settings → MCP Servers, add:

```json
{
  "skills": {
    "command": "npx",
    "args": ["-y", "@gengirish/skills-mcp"]
  }
}
```

### Continue

In `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: skills
    command: npx
    args: ["-y", "@gengirish/skills-mcp"]
```

### Windsurf / OpenCode / others

Any MCP-compatible client: spawn the binary `npx -y @gengirish/skills-mcp` over stdio.

### Optional: avoid GitHub rate limits

`get_skill` and `install_skill` hit GitHub. Anonymous = 60 req/hr, authenticated = 5,000 req/hr. Set:

```json
{
  "mcpServers": {
    "skills": {
      "command": "npx",
      "args": ["-y", "@gengirish/skills-mcp"],
      "env": { "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx" }
    }
  }
}
```

A token with no scopes (read-only public access) is sufficient.

---

## Usage examples

Once installed, talk to your agent naturally:

> _"Use the skills tool to find me skills related to Stripe payments."_

> _"Recommend skills for building a Next.js app with auth and a Postgres database."_

> _"Install the systematic-debugging skill into my Cursor."_

> _"Show me everything tagged 'security' from the wshobson repo."_

The agent will call the appropriate tool and act on the results.

### Direct tool calls (for power users / scripts)

```json
{
  "tool": "search_skills",
  "arguments": { "query": "kubernetes deploy", "domain": "devops", "limit": 5 }
}
```

```json
{
  "tool": "install_skill",
  "arguments": {
    "id": "anthropic-skills/skills/skill-creator/SKILL.md",
    "ide": "cursor"
  }
}
```

`ide` accepts: `cursor` (default), `claude-code`, `claude`, `codex`, `windsurf`, `opencode`, or `custom` (with explicit `target_dir`).

---

## Source repositories indexed

| Repo | Skills | Tier |
|---|---:|---|
| [zebbern/antigravity-awesome-skills](https://github.com/zebbern/antigravity-awesome-skills) | 4,293 | Mega bundle |
| [TerminalSkills/skills](https://github.com/TerminalSkills/skills) | 998 | Cross-tool |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 864 | Curated |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 540 | Production teams |
| [wshobson/agents](https://github.com/wshobson/agents) | 151 | Plugin marketplace |
| [spencerpauly/awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) | 64 | Cursor-native |
| [obra/superpowers-skills](https://github.com/obra/superpowers-skills) | 31 | Framework |
| [anthropics/skills](https://github.com/anthropics/skills) | 18 | Official |
| [antfu/skills](https://github.com/antfu/skills) | 17 | Curated |
| [obra/superpowers](https://github.com/obra/superpowers) | 14 | Framework |
| [gmh5225/awesome-skills](https://github.com/gmh5225/awesome-skills) | 8 | Curated |

---

## Domains

Each skill is automatically tagged into one or more of:

`testing` · `debugging` · `security` · `devops` · `data` · `ai-ml` · `frontend` · `mobile` · `backend` · `documents` · `git-collab` · `performance` · `design` · `marketing-content` · `business-pm` · `automation` · `meta-skills` · `documentation` · `blockchain` · `other`

Tagging rules live in [`scripts/classify.mjs`](scripts/classify.mjs) (shared by the catalog builder and the Explorer UI's adapter).

---

## Local development

```bash
git clone https://github.com/gengirish/skills-mcp
cd skills-mcp
npm install
GITHUB_TOKEN=ghp_xxx npm run build:catalog   # ~5–10 min first time
npm run build                                 # compile TS
npm run inspect                               # MCP Inspector
node scripts/smoke-test.mjs                   # JSON-RPC smoke test
```

A fine-grained PAT with public-repo read access is enough. Without it, GitHub limits unauthenticated requests to 60 req/hr — the build will still work for tiny subsets via `--only=…` but won't complete a full refresh.

Project layout:

```
skills-mcp/
├── src/
│   ├── index.ts        # MCP server (tools + resources)
│   ├── catalog.ts      # JSON catalog loader
│   ├── search.ts       # Fuse.js fuzzy search + filters
│   └── fetcher.ts      # GitHub raw + API download logic
├── scripts/
│   ├── build-catalog.mjs   # GitHub-native catalog builder
│   ├── classify.mjs        # shared domain classification rules
│   ├── smoke-test.mjs      # JSON-RPC stdio smoke test
│   └── test-install.mjs    # end-to-end install test
├── sources.json        # declarative list of upstream repos + globs
├── .cache/             # per-repo SHA-keyed cache (gitignored)
├── data/
│   └── catalog.json    # generated, ~5 MB (committed)
└── dist/               # tsc output (published)
```

### Refreshing the catalog

```bash
# Incremental: only fetches repos whose HEAD SHA changed.
GITHUB_TOKEN=ghp_xxx npm run build:catalog

# Full refetch (ignore .cache/):
GITHUB_TOKEN=ghp_xxx npm run build:catalog -- --force --report

# A single repo:
npm run build:catalog -- --only=anthropic-skills

# Include the giant aggregator (~227k entries; very slow):
npm run build:catalog -- --include-registry
```

Adding a new source: append an entry to [`sources.json`](sources.json) with `{key, owner, repo, branch, label, tier, upstream, include}`. Re-run `npm run build:catalog` and the new repo's skills appear automatically.

### Automated daily refresh

The included GitHub Actions workflow (`.github/workflows/refresh-catalog.yml`) runs daily at 06:00 UTC, refreshes the catalog, commits any diff back to `main`. Manual trigger with `--force` / `--include-registry` toggles is available via "Run workflow".

---

## Publishing

The package is set up for public npm publish.

```bash
# bump version
npm version patch     # or minor / major

# publish (this runs prepublishOnly = build:catalog + build)
npm publish --access public
```

To submit to MCP discovery registries:

- **mcp.so** — open a PR adding an entry
- **Smithery** — `npx -y @smithery/cli install @gengirish/skills-mcp`
- **claude-plugins.dev** — opens an issue/PR to add the server
- **Glama AI MCP directory** — auto-indexed from npm

---

## How it works under the hood

1. **`scripts/build-catalog.mjs`** reads `sources.json`, hits the GitHub Trees API once per source, fetches each `SKILL.md` over `raw.githubusercontent.com` (with concurrency + per-repo SHA cache), parses YAML frontmatter, applies the shared regex-based domain classifier, and writes `data/catalog.json` (~5 MB).
2. **MCP server** loads the catalog at startup, runs Fuse.js fuzzy search in-memory, and uses the upstream coordinates (owner/repo/branch/path) to fetch raw `SKILL.md` content or recursively download skill folders via the GitHub Contents API on demand.

The catalog is small enough to ship in the npm tarball so `search_skills` has zero network latency. No local clones of any upstream repo are required at any stage.

---

## License

MIT (this server). Indexed skills retain their upstream licenses — see each source repo. Anthropic's document skills (`docx`, `pdf`, `pptx`, `xlsx`) are source-available; check before redistribution.
