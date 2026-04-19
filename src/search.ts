import Fuse from "fuse.js";
import { Catalog, CatalogSkill, loadCatalog } from "./catalog.js";

let fuseCache: Fuse<CatalogSkill> | null = null;

function getFuse(): Fuse<CatalogSkill> {
  if (fuseCache) return fuseCache;
  const cat = loadCatalog();
  fuseCache = new Fuse(cat.skills, {
    keys: [
      { name: "name", weight: 2 },
      { name: "description", weight: 1.5 },
      { name: "tags", weight: 1 },
      { name: "repoLabel", weight: 0.5 },
      { name: "slug", weight: 1 },
    ],
    threshold: 0.32,
    ignoreLocation: true,
    includeScore: true,
  });
  return fuseCache;
}

export type SearchOpts = {
  query?: string;
  domain?: string;
  repo?: string;
  tier?: string;
  limit?: number;
};

export function searchSkills(opts: SearchOpts): CatalogSkill[] {
  const cat: Catalog = loadCatalog();
  let pool: CatalogSkill[];

  if (opts.query && opts.query.trim()) {
    pool = getFuse().search(opts.query.trim()).map((r) => r.item);
  } else {
    pool = cat.skills;
  }

  if (opts.domain) {
    pool = pool.filter((s) => s.tags.includes(opts.domain!));
  }
  if (opts.repo) {
    pool = pool.filter(
      (s) =>
        s.repo === opts.repo ||
        s.repoLabel.toLowerCase().includes(opts.repo!.toLowerCase())
    );
  }
  if (opts.tier) {
    pool = pool.filter(
      (s) => s.tier.toLowerCase() === opts.tier!.toLowerCase()
    );
  }

  return pool.slice(0, Math.max(1, opts.limit ?? 25));
}

export function summarize(s: CatalogSkill): string {
  const tags = s.tags.join(", ");
  return [
    `• ${s.name}`,
    `  id: ${s.id}`,
    `  repo: ${s.repoLabel} (${s.tier})`,
    `  tags: ${tags}`,
    `  description: ${s.description || "—"}`,
  ].join("\n");
}
