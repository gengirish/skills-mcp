import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// This app lives at skills-mcp/web and reads ../data/catalog.json at build
// time, so the workspace root is the repo, not this directory. State it
// explicitly: Vercel injects outputFileTracingRoot pointing at the repo root
// and Next.js warns when the two disagree.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
};

export default nextConfig;
