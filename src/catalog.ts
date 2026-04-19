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

let cache: Catalog | null = null;

export function loadCatalog(): Catalog {
  if (cache) return cache;
  const here = path.dirname(fileURLToPath(import.meta.url));
  // dist/catalog.ts compiles to dist/catalog.js -> data is one level up
  const candidates = [
    path.resolve(here, "../data/catalog.json"),
    path.resolve(here, "../../data/catalog.json"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `catalog.json not found. Looked in:\n${candidates.join("\n")}`
    );
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
