import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// This app lives inside the skills-mcp repo, which carries its own lockfile.
// Without an explicit root Next.js infers the workspace root from the nearest
// ancestor lockfile and picks the repo root, which throws off file tracing.
const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: here },
};

export default nextConfig;
