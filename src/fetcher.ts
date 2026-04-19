import fs from "node:fs/promises";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { CatalogSkill, folderRawUrl, rawUrl } from "./catalog.js";

const UA = "skills-mcp/0.1 (+https://github.com/gengirish/skills-mcp)";

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function fetchSkillContent(skill: CatalogSkill): Promise<string> {
  // Try the configured branch, then fall back to "master".
  const branches = Array.from(new Set([skill.branch, "master", "main"]));
  let lastErr: unknown = null;
  for (const branch of branches) {
    const url = rawUrl({ ...skill, branch });
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) return await res.text();
      lastErr = new Error(`${res.status} ${res.statusText} for ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Failed to fetch skill content");
}

type GhEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
};

async function listFolder(
  skill: CatalogSkill,
  subPath?: string
): Promise<GhEntry[]> {
  const url = subPath
    ? `https://api.github.com/repos/${skill.owner}/${skill.repoName}/contents/${subPath}?ref=${skill.branch}`
    : folderRawUrl(skill);
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `GitHub API rate-limited (403). Set GITHUB_TOKEN env var to raise the limit.`
      );
    }
    throw new Error(`GitHub API ${res.status}: ${url}`);
  }
  const data = (await res.json()) as GhEntry | GhEntry[];
  return Array.isArray(data) ? data : [data];
}

async function downloadFileTo(url: string, dest: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
}

/**
 * Recursively downloads the skill folder into `targetDir`.
 * Returns the list of written files (relative paths).
 */
export async function downloadSkillFolder(
  skill: CatalogSkill,
  targetDir: string
): Promise<string[]> {
  const written: string[] = [];

  async function walk(remoteSubPath: string, localSubDir: string) {
    const entries = await listFolder(skill, remoteSubPath);
    for (const e of entries) {
      const relName = e.name;
      const localPath = path.join(localSubDir, relName);
      if (e.type === "dir") {
        await walk(e.path, localPath);
      } else if (e.type === "file" && e.download_url) {
        await downloadFileTo(e.download_url, localPath);
        written.push(path.relative(targetDir, localPath));
      }
    }
  }

  const startFolder = skill.repoPath.split("/").slice(0, -1).join("/");
  await walk(startFolder, targetDir);
  return written;
}

export function defaultIdeTarget(ide: string | undefined): string {
  const home = process.env.HOME || process.env.USERPROFILE || ".";
  switch ((ide ?? "cursor").toLowerCase()) {
    case "cursor":
      return path.join(home, ".cursor", "skills");
    case "claude-code":
    case "claude":
      return path.join(home, ".claude", "skills");
    case "codex":
      return path.join(home, ".codex", "skills");
    case "windsurf":
      return path.join(home, ".windsurf", "skills");
    case "opencode":
      return path.join(home, ".opencode", "skills");
    default:
      return path.join(home, ".cursor", "skills");
  }
}

export function ensureSafeTarget(targetDir: string): string {
  if (!path.isAbsolute(targetDir)) {
    throw new Error(`Target directory must be absolute: ${targetDir}`);
  }
  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
  return targetDir;
}
