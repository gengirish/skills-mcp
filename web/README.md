# skillsmcp-web

Landing page for [**skills-mcp**](https://github.com/gengirish/skills-mcp) — one MCP server for
9,000+ agent skills.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript. No client-side data fetching, no
database, no runtime dependencies beyond React — the whole site prerenders to static HTML.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static prerender
```

## Everything borrowed from skills-mcp is synced, not copied

One command pulls all three things this site takes from the upstream repo:

```bash
npm run sync:stats                     # sibling checkout, else GitHub
node scripts/sync-stats.mjs --remote   # force fetch from GitHub
```

| What | Where it lands | Why it can't be hand-written |
|---|---|---|
| Totals, repo list, domains | `lib/catalog-stats.json` | A GitHub Action rebuilds the catalog **daily** |
| npm dist-tag | `publishedVersion` in the same file | The repo's version runs ahead of npm between release and publish |
| Terminal recording | `public/demo.svg` | Re-rendered upstream whenever the count crosses a thousand |

Each of these has already drifted at least once. The upstream README shipped "~7,000 skills" for
months while the real figure passed 9,000. The demo was a manual copy and this site served a
recording claiming 9,238 after the repo had re-rendered it. And the version was hand-set to 1.0.1
while npm still served 1.0.0 — a badge promising something `npm i -g` wouldn't give you.

`VERSION` deliberately tracks the **published** dist-tag, not the repo's `package.json`. If the
registry is unreachable the script keeps the previous value rather than guessing.

The catalog is read from `../open-source-skills/skills-mcp/data/catalog.json`, then
`../skills-mcp/data/catalog.json`, then GitHub. Override with
`SKILLS_MCP_CATALOG=/path/to/catalog.json`.

**Re-run `sync:stats` before every deploy.**

## Structure

```
app/
  layout.tsx            metadata, JSON-LD (SoftwareApplication), fonts
  page.tsx              section composition
  globals.css           Tailwind v4 @theme tokens + entrance animations
  opengraph-image.tsx   1200x630 card, generated at build time
components/
  Navbar.tsx  Footer.tsx  CopyBlock.tsx  RevealOnScroll.tsx
  sections/   Hero · RepoTicker · Why · Tools · Install · Catalog · CTABand
lib/
  constants.ts          copy, install snippets, links
  catalog-stats.json    generated — do not edit
  accents.ts anim.ts
scripts/
  sync-stats.mjs
```

## Animation conventions

Entrance animations are CSS, gated behind a `.js` class set synchronously in `<head>`:

- **Base state is the final state.** With JS off — or before hydration — content is simply
  visible. Starting from `opacity: 0` in markup (the usual framer-motion `initial` pattern) leaves
  the hero blank until the client bundle loads, which hurts LCP and breaks entirely if the JS never
  arrives.
- Because `.js` lands before first paint, there is no flash of content collapsing into its hidden
  start state.
- `.anim-up` fires on load (above the fold). `.reveal` fires on scroll via `IntersectionObserver`
  in `RevealOnScroll`. Both respect `prefers-reduced-motion`.

The same reasoning applies to `public/demo.svg`, which renders its finished transcript in any
renderer that ignores CSS animation instead of showing an empty terminal.

## Deploying

Vercel picks this up with zero config. The canonical origin lives in one place — `SITE_URL` in
`lib/constants.ts` — feeding `metadataBase`, OpenGraph, Twitter cards and the JSON-LD block. It is
currently `https://skillsmcp.intelliforge.tech`.

`metadataBase` is what turns `/opengraph-image` into an absolute URL. Link unfurls on X, LinkedIn
and Slack break silently if the origin here doesn't match where the site is actually served, so
change it in the same commit as any domain move.

To attach the subdomain:

```bash
vercel link          # team: girish-hiremaths-projects
vercel --prod
vercel domains add skillsmcp.intelliforge.tech
```

DNS, depending on where the apex lives:

- **Apex already on this Vercel team** — add the subdomain in project settings and Vercel writes
  the record itself.
- **Apex managed elsewhere** — add `skillsmcp` as a `CNAME` to `cname.vercel-dns.com`, then
  complete the `_vercel` TXT verification Vercel prompts for.

At time of writing `intelliforge.tech` resolves to Vercel (`216.198.79.1`) but is *not* listed
under the `girish-hiremaths-projects` team, so the second path is the likely one.

## Notes

- `npm audit` reports advisories in `postcss` and `sharp`. Both are transitive dependencies inside
  Next.js itself; `npm audit fix --force` "resolves" them by downgrading Next to 9.3.3. Leave them.
