#!/usr/bin/env node
/**
 * Builds skills-mcp/data/catalog.json by querying GitHub directly. No local
 * clones required.
 *
 * For each repo declared in sources.json:
 *   1. Resolve default branch + HEAD commit SHA via /repos/{owner}/{repo}.
 *   2. Read .cache/{key}.json — if SHA matches, reuse cached entries.
 *   3. Otherwise GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1.
 *   4. Filter blobs by `include`/`exclude` globs.
 *   5. Concurrency-limited fetch of raw SKILL.md content.
 *   6. Parse YAML frontmatter, classify into domain tags.
 *   7. Write per-repo cache; concat all into data/catalog.json.
 *
 * CLI flags:
 *   --force                   Ignore SHA cache; refetch every repo.
 *   --include-registry        Include claude-skill-registry (227k files).
 *   --only=key1,key2          Limit to specific source keys.
 *   --concurrency=N           Parallel raw fetches per repo (default 8).
 *   --report                  Print per-repo failure breakdown at the end.
 *   --no-write                Skip writing catalog.json (useful for diffs).
 *
 * Env:
 *   GITHUB_TOKEN              Strongly recommended. 60 req/hr unauthenticated.
 *                             A fine-grained PAT with public-repo read access
 *                             gives 5,000 req/hr.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import pLimit from "p-limit";
import picomatch from "picomatch";

import { classify, publicDomains } from "./classify.mjs";

// ---------------------------------------------------------------------------
// Paths & CLI
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.resolve(ROOT, "sources.json");
const CACHE_DIR = path.resolve(ROOT, ".cache");
const OUT_FILE = path.resolve(ROOT, "data", "catalog.json");

const ARGS = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {
    force: false,
    includeRegistry: false,
    only: null,
    concurrency: 8,
    report: false,
    write: true,
  };
  for (const a of argv) {
    if (a === "--force") out.force = true;
    else if (a === "--include-registry") out.includeRegistry = true;
    else if (a === "--report") out.report = true;
    else if (a === "--no-write") out.write = false;
    else if (a.startsWith("--only=")) out.only = a.slice(7).split(",").map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith("--concurrency=")) out.concurrency = Math.max(1, parseInt(a.slice(14), 10) || 8);
    else if (a === "--help" || a === "-h") {
      process.stdout.write(USAGE);
      process.exit(0);
    }
  }
  return out;
}

const USAGE = `Usage: build-catalog-gh.mjs [flags]
  --force               Refetch all repos (ignore .cache/*.json)
  --include-registry    Include claude-skill-registry (~227k files; slow)
  --only=k1,k2          Limit to source keys
  --concurrency=N       Parallel raw fetches per repo (default 8)
  --report              Print per-repo failure breakdown
  --no-write            Don't write data/catalog.json
`;

// ---------------------------------------------------------------------------
// GitHub HTTP helpers
// ---------------------------------------------------------------------------
const TOKEN = process.env.GITHUB_TOKEN || "";
const UA = "skills-mcp-builder/0.1 (+https://github.com/gengirish/skills-mcp)";

if (!TOKEN) {
  console.error(
    "WARNING: GITHUB_TOKEN not set. Unauthenticated GitHub allows only 60 req/hr."
  );
  console.error(
    "         Create a fine-grained PAT with public read access and export it as GITHUB_TOKEN."
  );
}

function ghHeaders() {
  const h = { "User-Agent": UA, Accept: "application/vnd.github+json" };
  if (TOKEN) h["Authorization"] = `Bearer ${TOKEN}`;
  return h;
}

function rawHeaders() {
  return { "User-Agent": UA };
}

/**
 * Fetch wrapper that retries once on transient failures and respects the
 * x-ratelimit-reset header on 403 by sleeping until reset.
 */
async function gh(url, { headers = ghHeaders(), method = "GET" } = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch(url, { method, headers });
    } catch (e) {
      if (attempt === 2) throw e;
      await sleep(500 * (attempt + 1));
      continue;
    }
    if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
      const reset = parseInt(res.headers.get("x-ratelimit-reset") || "0", 10);
      const waitMs = Math.max(1000, reset * 1000 - Date.now() + 1000);
      console.error(
        `[rate-limit] hit; sleeping ${Math.round(waitMs / 1000)}s until reset...`
      );
      await sleep(waitMs);
      continue;
    }
    if (res.status >= 500 && attempt < 2) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    return res;
  }
  throw new Error(`gh fetch exhausted retries: ${url}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Source resolution
// ---------------------------------------------------------------------------
async function resolveBranchAndSha(src) {
  const url = `https://api.github.com/repos/${src.owner}/${src.repo}`;
  const res = await gh(url);
  if (!res.ok) {
    throw new Error(`repo lookup failed (${res.status}): ${url}`);
  }
  const meta = await res.json();
  const branch = src.branch || meta.default_branch || "main";

  const refUrl = `https://api.github.com/repos/${src.owner}/${src.repo}/commits/${branch}`;
  const refRes = await gh(refUrl);
  if (!refRes.ok) {
    throw new Error(`branch lookup failed (${refRes.status}): ${refUrl}`);
  }
  const refMeta = await refRes.json();
  return { branch, sha: refMeta.sha };
}

async function listSkillPaths(src, sha) {
  const url = `https://api.github.com/repos/${src.owner}/${src.repo}/git/trees/${sha}?recursive=1`;
  const res = await gh(url);
  if (!res.ok) {
    throw new Error(`tree lookup failed (${res.status}): ${url}`);
  }
  const data = await res.json();
  if (data.truncated) {
    console.warn(
      `  [warn] tree response truncated for ${src.key}; consider scoping include[] more tightly`
    );
  }

  const includers = (src.include || ["**/SKILL.md"]).map((p) =>
    picomatch(p, { dot: true })
  );
  const excluders = (src.exclude || []).map((p) =>
    picomatch(p, { dot: true })
  );
  const matches = [];
  for (const node of data.tree) {
    if (node.type !== "blob") continue;
    if (!node.path.endsWith("SKILL.md")) continue;
    if (excluders.some((m) => m(node.path))) continue;
    if (!includers.some((m) => m(node.path))) continue;
    matches.push(node.path);
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Per-skill fetch + parse
// ---------------------------------------------------------------------------
function deriveName(data, dirName) {
  const n = data?.name;
  if (typeof n === "string" && n.trim()) return n.trim();
  return dirName;
}

function deriveDescription(data, body) {
  const d = data?.description;
  if (typeof d === "string" && d.trim()) {
    return d.replace(/\s+/g, " ").trim();
  }
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return (lines[0] ?? "").slice(0, 280);
}

function safeParse(content) {
  try {
    return matter(content);
  } catch {
    return { data: {}, content };
  }
}

async function fetchSkill(src, sha, repoPath) {
  const url = `https://raw.githubusercontent.com/${src.owner}/${src.repo}/${sha}/${repoPath}`;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: rawHeaders() });
      if (res.ok) return res.text();
      if (res.status >= 500 || res.status === 429) {
        lastErr = new Error(`raw ${res.status}: ${url}`);
        await sleep(500 * 2 ** attempt);
        continue;
      }
      throw new Error(`raw ${res.status}: ${url}`);
    } catch (e) {
      lastErr = e;
      await sleep(500 * 2 ** attempt);
    }
  }
  throw lastErr ?? new Error(`raw fetch failed: ${url}`);
}

function buildSkillRow(src, branch, repoPath, body) {
  const { data, content } = safeParse(body);
  const segments = repoPath.split("/");
  const dirName = segments[segments.length - 2] || src.key;
  const name = deriveName(data, dirName);
  const description = deriveDescription(data, content);
  const id = `${src.key}/${repoPath}`;
  const haystack = `${name} ${description} ${id}`;
  const tags = classify(haystack);

  return {
    id,
    slug: dirName,
    name,
    description,
    tags,
    primaryTag: tags[0],
    repo: src.key,
    repoLabel: src.label,
    tier: src.tier,
    upstream: src.upstream,
    owner: src.owner,
    repoName: src.repo,
    branch,
    repoPath,
    pathSegments: segments.slice(0, -1),
  };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------
function cachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

function readCache(key) {
  const p = cachePath(key);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

async function writeCache(key, payload) {
  await fsp.mkdir(CACHE_DIR, { recursive: true });
  await fsp.writeFile(cachePath(key), JSON.stringify(payload));
}

// ---------------------------------------------------------------------------
// Per-source pipeline
// ---------------------------------------------------------------------------
async function processSource(src, limit) {
  const stats = {
    key: src.key,
    cached: false,
    skills: 0,
    failed: [],
    branch: null,
    sha: null,
  };

  process.stdout.write(`  ${src.key}: resolving... `);
  const { branch, sha } = await resolveBranchAndSha(src);
  stats.branch = branch;
  stats.sha = sha;

  const cached = !ARGS.force ? readCache(src.key) : null;
  if (cached && cached.sha === sha && Array.isArray(cached.skills)) {
    stats.cached = true;
    stats.skills = cached.skills.length;
    process.stdout.write(`cached (${stats.skills} skills @ ${sha.slice(0, 7)})\n`);
    return { stats, skills: cached.skills };
  }

  const paths = await listSkillPaths(src, sha);
  process.stdout.write(`${paths.length} candidate path(s) @ ${sha.slice(0, 7)}\n`);
  if (paths.length === 0) {
    await writeCache(src.key, { sha, branch, skills: [] });
    return { stats, skills: [] };
  }

  const skills = [];
  let done = 0;
  const total = paths.length;
  await Promise.all(
    paths.map((p) =>
      limit(async () => {
        try {
          const body = await fetchSkill(src, sha, p);
          skills.push(buildSkillRow(src, branch, p, body));
        } catch (e) {
          stats.failed.push({ path: p, error: e.message });
        } finally {
          done++;
          if (done % 100 === 0 || done === total) {
            process.stdout.write(`    ${src.key}: ${done}/${total}\r`);
          }
        }
      })
    )
  );
  process.stdout.write("\n");

  skills.sort((a, b) => a.id.localeCompare(b.id));
  stats.skills = skills.length;

  await writeCache(src.key, { sha, branch, skills });
  return { stats, skills };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const sourcesRaw = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf8"));
  let sources = sourcesRaw.sources;

  if (!ARGS.includeRegistry) {
    sources = sources.filter((s) => !s.skipByDefault);
  }

  // With --only, we still want a complete catalog: refresh the named sources
  // and merge with cached entries from the rest. Sources without a cache are
  // simply skipped (with a warning) instead of failing.
  let toFetch = sources;
  let toReuseFromCache = [];
  if (ARGS.only) {
    const keep = new Set(ARGS.only);
    toFetch = sources.filter((s) => keep.has(s.key));
    toReuseFromCache = sources.filter((s) => !keep.has(s.key));
    if (!toFetch.length) {
      console.error(`No sources matched --only=${ARGS.only.join(",")}`);
      process.exit(1);
    }
    console.log(
      `--only mode: refreshing ${toFetch.length} source(s); reusing cache for ${toReuseFromCache.length} other(s).`
    );
  }

  console.log(
    `Building catalog from ${sources.length} source(s) ` +
      `(concurrency=${ARGS.concurrency}, force=${ARGS.force})`
  );

  const limit = pLimit(ARGS.concurrency);
  const allSkills = [];
  const sourceSummaries = [];
  const t0 = Date.now();

  for (const src of toFetch) {
    try {
      const { stats, skills } = await processSource(src, limit);
      allSkills.push(...skills);
      sourceSummaries.push(stats);
    } catch (e) {
      console.error(`  ${src.key}: FAILED - ${e.message}`);
      sourceSummaries.push({
        key: src.key,
        cached: false,
        skills: 0,
        failed: [{ path: "<source>", error: e.message }],
      });
    }
  }

  for (const src of toReuseFromCache) {
    const cached = readCache(src.key);
    if (!cached || !Array.isArray(cached.skills)) {
      console.warn(`  ${src.key}: no cache available; skipping (run without --only first)`);
      continue;
    }
    allSkills.push(...cached.skills);
    sourceSummaries.push({
      key: src.key,
      cached: true,
      skills: cached.skills.length,
      failed: [],
      branch: cached.branch,
      sha: cached.sha,
    });
  }

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);

  const catalog = {
    generatedAt: new Date().toISOString(),
    builder: "build-catalog.mjs (github-native)",
    elapsedSec: Number(elapsedSec),
    totals: {
      skills: allSkills.length,
      repos: new Set(allSkills.map((s) => s.repo)).size,
    },
    sources: sourceSummaries.map((s) => ({
      key: s.key,
      branch: s.branch,
      sha: s.sha,
      skills: s.skills,
      cached: s.cached,
      failedCount: s.failed?.length || 0,
    })),
    domains: publicDomains(),
    skills: allSkills,
  };

  console.log(
    `\nDone in ${elapsedSec}s. Total: ${allSkills.length} skills across ${catalog.totals.repos} repo(s).`
  );

  if (ARGS.report) {
    console.log("\nPer-source breakdown:");
    for (const s of sourceSummaries) {
      const tag = s.cached ? " (cached)" : "";
      console.log(
        `  ${String(s.skills).padStart(5)}  ${s.key.padEnd(36)} ${s.failed?.length ? `(${s.failed.length} failed)` : ""}${tag}`
      );
      if (ARGS.report && s.failed?.length) {
        for (const f of s.failed.slice(0, 5)) {
          console.log(`        ! ${f.path} :: ${f.error}`);
        }
        if (s.failed.length > 5) {
          console.log(`        ! ...and ${s.failed.length - 5} more`);
        }
      }
    }
  }

  if (ARGS.write) {
    await fsp.mkdir(path.dirname(OUT_FILE), { recursive: true });
    await fsp.writeFile(OUT_FILE, JSON.stringify(catalog));
    const sizeMb = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2);
    console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)} (${sizeMb} MB)`);
  } else {
    console.log("(--no-write set; catalog not persisted)");
  }
}

main().catch((e) => {
  console.error(`\nFATAL: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
