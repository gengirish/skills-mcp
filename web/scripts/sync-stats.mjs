#!/usr/bin/env node
/**
 * Pulls everything this site borrows from skills-mcp:
 *
 *   1. lib/catalog-stats.json  — totals, repo list, domain breakdown
 *   2. publishedVersion        — the npm dist-tag, i.e. what `npm i -g`
 *                                actually gives you today
 *   3. public/demo.svg         — the terminal recording
 *
 * None of it is typed by hand. The catalog is refreshed daily by a GitHub
 * Action, so hard-coded totals rot fast (the upstream README shipped
 * "~7,000" for months while the real number passed 9,000). The demo used to
 * be a manual copy and immediately drifted — the site shipped a recording
 * claiming 9,238 after the repo had already re-rendered it. And a hand-set
 * version string advertised 1.0.1 while npm still served 1.0.0.
 *
 *   node scripts/sync-stats.mjs            # enclosing repo, else GitHub
 *   node scripts/sync-stats.mjs --remote   # force GitHub
 *
 * Set SKILLS_MCP_CATALOG to point at a catalog.json anywhere else.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "lib", "catalog-stats.json");

const RAW_BASE = "https://raw.githubusercontent.com/gengirish/skills-mcp/main";
const RAW_URL = `${RAW_BASE}/data/catalog.json`;
const DEMO_RAW_URL = `${RAW_BASE}/assets/demo.svg`;
const REGISTRY_URL = "https://registry.npmjs.org/@gengirish/skills-mcp";

const DEMO_OUT = path.join(ROOT, "public", "demo.svg");

/** Repo roots to try, in order, for both the catalog and the demo asset. */
const REPO_CANDIDATES = [
  // This site now lives at skills-mcp/web, so the catalog is one level up.
  path.resolve(ROOT, ".."),
  // Kept for standalone checkouts sitting next to the server repo.
  path.resolve(ROOT, "../open-source-skills/skills-mcp"),
  path.resolve(ROOT, "../skills-mcp"),
];

const LOCAL_CANDIDATES = [
  process.env.SKILLS_MCP_CATALOG,
  ...REPO_CANDIDATES.map((r) => path.join(r, "data", "catalog.json")),
].filter(Boolean);

async function loadCatalog() {
  if (!process.argv.includes("--remote")) {
    for (const p of LOCAL_CANDIDATES) {
      if (fs.existsSync(p)) {
        console.log(`reading ${p}`);
        return JSON.parse(fs.readFileSync(p, "utf8"));
      }
    }
  }
  console.log(`fetching ${RAW_URL} (~7 MB)`);
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
  return res.json();
}

/**
 * The version a visitor actually gets from `npm i -g`. Reading it from the
 * registry rather than package.json avoids advertising a version that hasn't
 * been published yet.
 */
async function publishedVersion(fallback) {
  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`registry returned ${res.status}`);
    const json = await res.json();
    return json["dist-tags"].latest;
  } catch (e) {
    console.warn(`! npm lookup failed (${e.message}); keeping ${fallback}`);
    return fallback;
  }
}

/** Keep the terminal recording in step with the one the repo renders. */
async function syncDemo() {
  const local = REPO_CANDIDATES.map((r) =>
    path.join(r, "assets", "demo.svg")
  ).find((p) => fs.existsSync(p));

  let svg;
  if (local && !process.argv.includes("--remote")) {
    svg = fs.readFileSync(local, "utf8");
  } else {
    const res = await fetch(DEMO_RAW_URL);
    if (!res.ok) {
      console.warn(`! demo.svg fetch failed (${res.status}); leaving existing`);
      return;
    }
    svg = await res.text();
  }

  const before = fs.existsSync(DEMO_OUT)
    ? fs.readFileSync(DEMO_OUT, "utf8")
    : null;
  if (before === svg) {
    console.log("public/demo.svg already current");
    return;
  }
  fs.mkdirSync(path.dirname(DEMO_OUT), { recursive: true });
  fs.writeFileSync(DEMO_OUT, svg);
  console.log(`updated public/demo.svg (${svg.length} B)`);
}

const catalog = await loadCatalog();
const prevVersion = (() => {
  try {
    return JSON.parse(fs.readFileSync(OUT, "utf8")).publishedVersion;
  } catch {
    return "1.0.0";
  }
})();

// --- repos, busiest first -------------------------------------------------
const repoMap = new Map();
for (const s of catalog.skills) {
  const slug = s.upstream.replace(/^https:\/\/github\.com\//, "");
  const cur = repoMap.get(slug);
  if (cur) cur.count += 1;
  else
    repoMap.set(slug, {
      slug,
      label: s.repoLabel,
      tier: s.tier,
      upstream: s.upstream,
      count: 1,
    });
}
const repos = [...repoMap.values()].sort((a, b) => b.count - a.count);

// --- domains, busiest first ----------------------------------------------
const counts = {};
for (const s of catalog.skills)
  for (const t of s.tags) counts[t] = (counts[t] ?? 0) + 1;

const domains = catalog.domains
  .map((d) => ({ id: d.id, label: d.label, count: counts[d.id] ?? 0 }))
  .sort((a, b) => b.count - a.count);

const stats = {
  // Mirrors the server's own catalog_stats output.
  skills: catalog.totals.skills,
  repos: catalog.totals.repos,
  domains: domains.length,
  generatedAt: catalog.generatedAt,
  syncedAt: new Date().toISOString(),
  publishedVersion: await publishedVersion(prevVersion),
  topRepo: { slug: repos[0].slug, count: repos[0].count },
  topDomain: { label: domains[0].label, count: domains[0].count },
  repoList: repos,
  domainList: domains,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(stats, null, 2) + "\n");

console.log(
  `wrote ${path.relative(ROOT, OUT)} — ${stats.skills.toLocaleString(
    "en-US"
  )} skills, ${stats.repos} repos, ${stats.domains} domains, npm v${
    stats.publishedVersion
  }`
);

await syncDemo();
