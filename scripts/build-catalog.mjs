#!/usr/bin/env node
/**
 * Generates skills-mcp/data/catalog.json from skills-explorer/public/skills.json.
 * The catalog is a compact array of:
 *   { id, name, description, tags, repo, repoLabel, tier, upstream, owner, repoName, branch, repoPath }
 *
 * `repoPath` is the in-repo path so we can fetch raw SKILL.md from
 * https://raw.githubusercontent.com/{owner}/{repoName}/{branch}/{repoPath}
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(
  __dirname,
  "../../skills-explorer/public/skills.json"
);
const OUT = path.resolve(__dirname, "../data/catalog.json");

// Map local repo dir -> { owner, repoName, branch }
// Branch is "main" unless explicitly set otherwise.
const REPO_COORDS = {
  "anthropic-skills": { owner: "anthropics", repo: "skills" },
  "awesome-cursor-skills": {
    owner: "spencerpauly",
    repo: "awesome-cursor-skills",
  },
  superpowers: { owner: "obra", repo: "superpowers" },
  "superpowers-skills": { owner: "obra", repo: "superpowers-skills" },
  "superpowers-marketplace": { owner: "obra", repo: "superpowers-marketplace" },
  "antfu-skills": { owner: "antfu", repo: "skills" },
  terminalskills: { owner: "TerminalSkills", repo: "skills" },
  "awesome-claude-skills": { owner: "ComposioHQ", repo: "awesome-claude-skills" },
  "alirezarezvani-claude-skills": {
    owner: "alirezarezvani",
    repo: "claude-skills",
  },
  "wshobson-agents": { owner: "wshobson", repo: "agents" },
  "wshobson-commands": { owner: "wshobson", repo: "commands" },
  "heilcheng-awesome-agent-skills": {
    owner: "heilcheng",
    repo: "awesome-agent-skills",
  },
  "antigravity-awesome-skills": {
    owner: "zebbern",
    repo: "antigravity-awesome-skills",
  },
  "awesome-agent-skills": { owner: "VoltAgent", repo: "awesome-agent-skills" },
  "awesome-claude-agents": {
    owner: "vijaythecoder",
    repo: "awesome-claude-agents",
  },
  "gmh5225-awesome-skills": { owner: "gmh5225", repo: "awesome-skills" },
};

if (!fs.existsSync(SOURCE)) {
  console.error(
    `ERROR: ${SOURCE} not found.\n` +
      `Run \`cd ../skills-explorer && npm run scan\` first.`
  );
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const out = [];

for (const s of raw.skills) {
  const coords = REPO_COORDS[s.repo];
  if (!coords) continue; // Skip repos we don't know how to fetch from

  // Strip the local repo dir prefix from the path
  const repoPath = s.path.split("/").slice(1).join("/");

  out.push({
    id: s.id,
    name: s.name,
    description: s.description,
    tags: s.tags,
    primaryTag: s.primaryTag,
    repo: s.repo,
    repoLabel: s.repoLabel,
    tier: s.tier,
    upstream: s.upstream,
    owner: coords.owner,
    repoName: coords.repo,
    branch: coords.branch ?? "main",
    repoPath,
    slug: s.slug,
  });
}

const catalog = {
  generatedAt: new Date().toISOString(),
  totals: {
    skills: out.length,
    repos: new Set(out.map((s) => s.repo)).size,
  },
  domains: raw.domains,
  skills: out,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog));

const sizeMb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(
  `Wrote ${out.length} skills (${sizeMb} MB) -> ${path.relative(
    process.cwd(),
    OUT
  )}`
);
