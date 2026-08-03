import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type CatalogSkill = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  primaryTag: string;
  repo: string;
  repoLabel: string;
  tier: string;
  upstream: string;
  owner: string;
  repoName: string;
  branch: string;
  repoPath: string;
  slug: string;
};

export type Domain = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export type Catalog = {
  generatedAt: string;
  totals: { skills: number; repos: number };
  domains: Domain[];
  skills: CatalogSkill[];
};

export type CatalogMeta = {
  generatedAt: string;
  totals: { skills: number; repos: number };
  domains: number;
};

let cache: Catalog | null = null;
let metaCache: CatalogMeta | null = null;

/** dist/catalog.js -> data/ is one level up; src/catalog.ts -> two. */
function dataFile(name: string): string | undefined {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.resolve(here, `../data/${name}`),
    path.resolve(here, `../../data/${name}`),
  ].find((p) => fs.existsSync(p));
}

/** Throws if the catalog is missing, without paying to parse it. */
export function assertCatalogPresent(): void {
  if (!dataFile("catalog.json")) {
    throw new Error("catalog.json not found next to the installed package.");
  }
}

/**
 * Headline numbers only, read from a small sidecar so the MCP handshake
 * doesn't have to parse the full 6.7 MB catalog. Falls back to the catalog
 * itself for installs predating the sidecar.
 */
export function loadMeta(): CatalogMeta {
  if (metaCache) return metaCache;
  const found = dataFile("catalog-meta.json");
  if (found) {
    metaCache = JSON.parse(fs.readFileSync(found, "utf8")) as CatalogMeta;
  } else {
    const cat = loadCatalog();
    metaCache = {
      generatedAt: cat.generatedAt,
      totals: cat.totals,
      domains: cat.domains.length,
    };
  }
  return metaCache;
}

export function loadCatalog(): Catalog {
  if (cache) return cache;
  const found = dataFile("catalog.json");
  if (!found) {
    throw new Error("catalog.json not found next to the installed package.");
  }
  cache = JSON.parse(fs.readFileSync(found, "utf8")) as Catalog;
  return cache;
}

export function findById(id: string): CatalogSkill | undefined {
  return loadCatalog().skills.find((s) => s.id === id);
}

export function rawUrl(skill: CatalogSkill): string {
  return `https://raw.githubusercontent.com/${skill.owner}/${skill.repoName}/${skill.branch}/${skill.repoPath}`;
}

export function folderRawUrl(skill: CatalogSkill): string {
  // GitHub API URL for the SKILL folder contents
  const folder = skill.repoPath.split("/").slice(0, -1).join("/");
  return `https://api.github.com/repos/${skill.owner}/${skill.repoName}/contents/${folder}?ref=${skill.branch}`;
}
