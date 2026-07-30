# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-30

First stable release. The tool surface below is now covered by semver: tool names,
their argument shapes, and the `skills://catalog` resource schema won't change
without a major bump.

### Added

- **Seven MCP tools** for working with the skills ecosystem:
  - `search_skills` — free-text + faceted search (domain / repo / tier), served
    in-memory from the bundled catalog, so there is no network round-trip.
  - `get_skill` — fetches full `SKILL.md` content from upstream GitHub.
  - `recommend_skills` — plain-English task description → ranked suggestions.
  - `list_domains` — all 20 logical domains with per-domain counts.
  - `list_repos` — all source repositories with counts and upstream links.
  - `install_skill` — downloads a skill folder into your IDE's skills directory
    (`cursor`, `claude-code`, `claude`, `codex`, `windsurf`, `opencode`, or a
    `custom` target).
  - `catalog_stats` — versions, catalog generation time, totals.
- **`skills://catalog` resource** exposing the full JSON index.
- **9,238 skills indexed across 11 source repositories**, classified into 20
  domains by the shared ruleset in `scripts/classify.mjs`.
- **Daily catalog refresh** via GitHub Actions (`.github/workflows/refresh-catalog.yml`),
  with manual `--force` / `--include-registry` toggles.
- **`GITHUB_TOKEN` support** to lift GitHub's 60 req/hr anonymous limit to 5,000
  for `get_skill` and `install_skill`. A no-scope token is sufficient.
- Demo and social-preview asset generators (`scripts/make-demo.mjs`,
  `scripts/make-social.mjs`) — dependency-free, emit SVG.

### Changed

- The catalog is now built **directly from the GitHub Trees + raw APIs** rather
  than from local clones of each upstream repo, so a full refresh needs no disk
  beyond the output and can run in CI unattended.
- The server version reported by the MCP handshake and by `catalog_stats` is now
  read from `package.json` at runtime. It was previously a hard-coded constant
  that had already drifted — `0.1.0` was reported by a build published as a
  later version.

### Notes

- Indexed skills retain their upstream licenses. Anthropic's document skills
  (`docx`, `pdf`, `pptx`, `xlsx`) are source-available rather than MIT — check
  before redistributing.

## [0.1.0] — 2026-04-19

Initial release.

[1.0.0]: https://github.com/gengirish/skills-mcp/releases/tag/v1.0.0
[0.1.0]: https://github.com/gengirish/skills-mcp/releases/tag/v0.1.0
