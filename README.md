# skills-mcp

> An MCP server that lets any AI agent **discover, search, and install 9,000+ agent skills** from across the GitHub ecosystem (Anthropic, Superpowers, wshobson, antigravity, Composio, antfu, TerminalSkills, and more).

[![npm version](https://img.shields.io/npm/v/@gengirish/skills-mcp?color=cb3837&logo=npm)](https://www.npmjs.com/package/@gengirish/skills-mcp)
[![skills indexed](https://img.shields.io/badge/skills%20indexed-9%2C238-7EE787)](#quick-stats)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <img src="https://raw.githubusercontent.com/gengirish/skills-mcp/main/assets/demo.svg"
       alt="Terminal demo: the user asks their agent to find a Stripe skill and install it. The agent calls search_skills, gets 5 matches out of 9,238 indexed skills, fetches the SKILL.md, and installs it into ~/.cursor/skills/adding-stripe/."
       width="820">
</p>

<p align="center">
  <sub>Scripted terminal recreation — every result, count and path in it is real <code>skills-mcp</code> output.<br>
  Also available as <a href="assets/demo.gif">GIF</a> and <a href="assets/demo.mp4">MP4</a>.</sub>
</p>

---

## Why

Agent skills — the `SKILL.md` packages that teach Cursor, Claude Code and friends how to do one
specific job well — are scattered across a dozen unrelated GitHub repos. Anthropic publishes a
handful. Superpowers, wshobson, antigravity, Composio, TerminalSkills and others publish thousands
more. There is no index, no search, and no install path: you find a skill by already knowing which
repo it lives in, then copy a folder by hand. **skills-mcp collapses that into one MCP server —
9,238 skills from 11 repos, searchable from inside your editor and installable in a single tool
call.**

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
| **Skills indexed** | 9,238 |
| **Source repositories** | 11 |
| **Logical domains** | 20 (testing, security, devops, ai-ml, frontend, backend, data, marketing, docs, …) |
| **Top domain** | AI/ML/LLM (6,930 skills) |
| **Top repo** | antigravity-awesome-skills (6,225 skills) |

Counts are from the catalog build on 2026-07-30 and grow with the daily refresh — `catalog_stats`
always reports the live figure.

The catalog is built **directly from upstream GitHub repos** (no local clones needed) by `scripts/build-catalog.mjs` and shipped inside the npm package — so `search_skills` has zero network latency. `get_skill` and `install_skill` fetch live from GitHub on demand.

---

## Installation

Nothing to clone or build — `npx` pulls the package, catalog included, and runs it over stdio.
Sanity-check it in one command before wiring it into an editor:

```bash
npx -y @gengirish/skills-mcp
# [skills-mcp] v1.0.0 ready · 9238 skills · 11 repos
```

It then waits on stdin for JSON-RPC, which is what your client speaks. Ctrl-C to exit.

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
| [zebbern/antigravity-awesome-skills](https://github.com/zebbern/antigravity-awesome-skills) | 6,225 | Mega bundle |
| [TerminalSkills/skills](https://github.com/TerminalSkills/skills) | 1,016 | Cross-tool |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 864 | Curated |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 798 | Production teams |
| [wshobson/agents](https://github.com/wshobson/agents) | 180 | Plugin marketplace |
| [spencerpauly/awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) | 65 | Cursor-native |
| [obra/superpowers-skills](https://github.com/obra/superpowers-skills) | 31 | Framework |
| [antfu/skills](https://github.com/antfu/skills) | 19 | Curated |
| [anthropics/skills](https://github.com/anthropics/skills) | 18 | Official |
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
│   ├── test-install.mjs    # end-to-end install test
│   ├── make-demo.mjs       # README demo (animated SVG + GIF/MP4 frames)
│   └── make-social.mjs     # 1280x640 social preview card
├── sources.json        # declarative list of upstream repos + globs
├── .cache/             # per-repo SHA-keyed cache (gitignored)
├── assets/             # demo.svg / demo.gif / demo.mp4 / social-preview.*
├── data/
│   └── catalog.json    # generated, ~5 MB (committed)
└── dist/               # tsc output (published)
```

### Regenerating the marketing assets

Both generators are dependency-free and emit SVG:

```bash
node scripts/make-demo.mjs        # -> assets/demo.svg (animated, 20s loop)
node scripts/make-social.mjs      # -> assets/social-preview.svg
```

`demo.svg` degrades gracefully: where CSS animation doesn't run, it renders the finished transcript
instead of an empty window. To refresh the raster copies (needs `ffmpeg`):

```bash
node scripts/make-demo.mjs --frames                                  # assets/.frames/*.svg
npx @resvg/resvg-js-cli assets/social-preview.svg assets/social-preview.png
# rasterise .frames to PNG, then:
ffmpeg -framerate 10 -i png/f%04d.png -i palette.png \
  -lavfi "[0:v]mpdecimate=hi=200:lo=100:frac=0.005[d];[d][1:v]paletteuse=dither=none:diff_mode=rectangle" \
  -vsync vfr -loop 0 -final_delay 450 assets/demo.gif
```

The `mpdecimate` + `-vsync vfr` pass collapses the static holds into single long frames — it takes
the GIF from ~4 MB to ~316 KB with no visible change.

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

Published as [`@gengirish/skills-mcp`](https://www.npmjs.com/package/@gengirish/skills-mcp).

```bash
npm version patch                 # or minor / major
npm publish --access public       # runs prepublishOnly = build:catalog + build
```

`--access public` is required: npm defaults scoped packages to restricted.

Two things that are easy to trip over:

**The publish hook rebuilds the catalog.** `prepublishOnly` runs `build:catalog`, which needs
`GITHUB_TOKEN` and takes 5–10 minutes. It also rewrites `data/catalog.json`, so expect a diff
afterwards — usually just `generatedAt`/`elapsedSec` if the upstream repos haven't moved.

To publish without paying for a second rebuild — after a failed publish, say — pack once and push
the tarball. Publishing a tarball skips `prepublishOnly` entirely:

```bash
npm pack                                                    # uses the catalog already on disk
npm publish gengirish-skills-mcp-1.0.0.tgz --access public
```

**npm requires 2FA to publish.** Without it you get a `403` that reads as though you failed a 2FA
challenge, when the real state is that there's no second factor configured to challenge you with —
so passing `--otp` can't help. Check with `npm profile get`; if it says `two-factor auth: disabled`,
enable 2FA on npmjs.com first. With `auth-and-writes` set, every publish needs a fresh `--otp`, and
`npm login` (browser flow) is the most reliable way to get a token that accepts one. The documented
alternative is a granular access token with 2FA bypass, scoped **`@gengirish`** at the scope level —
package-level won't work for a package that doesn't exist yet.

Verify a release actually boots the way a client will spawn it:

```bash
npx -y @gengirish/skills-mcp     # should print: [skills-mcp] vX.Y.Z ready · N skills · M repos
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
