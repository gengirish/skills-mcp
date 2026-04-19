#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "node:path";
import { loadCatalog, findById, rawUrl } from "./catalog.js";
import { searchSkills, summarize } from "./search.js";
import {
  fetchSkillContent,
  downloadSkillFolder,
  defaultIdeTarget,
  ensureSafeTarget,
} from "./fetcher.js";

const VERSION = "0.1.0";

const server = new McpServer(
  { name: "skills-mcp", version: VERSION },
  {
    instructions:
      "Discover, search, and install agent skills (SKILL.md packages) from across the GitHub ecosystem. " +
      "Index covers ~7,000 skills from Anthropic, Superpowers, wshobson, antigravity-awesome-skills, " +
      "Composio, antfu, TerminalSkills, and more. " +
      "Workflow: search_skills -> get_skill -> install_skill.",
  }
);

// ---------------------------------------------------------------------------
// Tool: search_skills
// ---------------------------------------------------------------------------
server.tool(
  "search_skills",
  "Search the skills catalog by free-text query and/or filters. Returns matching skills with their IDs, descriptions, tags and source repos. Use this first to find candidates, then call get_skill to fetch full SKILL.md content.",
  {
    query: z
      .string()
      .optional()
      .describe(
        "Free-text query matched against name, description, tags, repo, slug. Optional if domain/repo/tier is provided."
      ),
    domain: z
      .string()
      .optional()
      .describe(
        "Domain id filter, e.g. 'testing', 'security', 'devops', 'ai-ml', 'frontend', 'backend', 'data', 'documents', 'marketing-content'. Use list_domains to see all."
      ),
    repo: z
      .string()
      .optional()
      .describe(
        "Repository key (e.g. 'anthropic-skills', 'superpowers') or partial label match."
      ),
    tier: z
      .string()
      .optional()
      .describe(
        "Tier filter, e.g. 'Official', 'Cursor-native', 'Framework', 'Curated', 'Mega bundle'."
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Max results to return (default 25)."),
  },
  async ({ query, domain, repo, tier, limit }) => {
    const results = searchSkills({ query, domain, repo, tier, limit });
    if (!results.length) {
      return {
        content: [
          {
            type: "text",
            text: "No skills matched. Try a broader query or call list_domains/list_repos.",
          },
        ],
      };
    }
    const lines = [
      `Found ${results.length} skill(s):`,
      "",
      ...results.map(summarize),
    ];
    return { content: [{ type: "text", text: lines.join("\n\n") }] };
  }
);

// ---------------------------------------------------------------------------
// Tool: get_skill
// ---------------------------------------------------------------------------
server.tool(
  "get_skill",
  "Fetch the full SKILL.md content for a skill by its id. Returns the raw markdown including YAML frontmatter and instructions.",
  {
    id: z
      .string()
      .describe("Skill id (the path returned by search_skills, e.g. 'anthropic-skills/skills/pdf/SKILL.md')."),
  },
  async ({ id }) => {
    const skill = findById(id);
    if (!skill) {
      return {
        content: [
          {
            type: "text",
            text: `Skill not found: ${id}. Use search_skills first.`,
          },
        ],
        isError: true,
      };
    }
    try {
      const md = await fetchSkillContent(skill);
      return {
        content: [
          {
            type: "text",
            text: [
              `# ${skill.name}`,
              `Source: ${skill.repoLabel} (${skill.upstream})`,
              `Path: ${skill.repoPath}`,
              `Raw URL: ${rawUrl(skill)}`,
              "",
              "---",
              "",
              md,
            ].join("\n"),
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch ${id}: ${(e as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: list_domains
// ---------------------------------------------------------------------------
server.tool(
  "list_domains",
  "List all logical domains in the catalog (testing, security, devops, ai-ml, frontend, etc.) with the number of skills tagged in each.",
  {},
  async () => {
    const cat = loadCatalog();
    const counts: Record<string, number> = {};
    for (const s of cat.skills) {
      for (const t of s.tags) counts[t] = (counts[t] ?? 0) + 1;
    }
    const rows = cat.domains
      .map((d) => ({ ...d, count: counts[d.id] ?? 0 }))
      .sort((a, b) => b.count - a.count);
    return {
      content: [
        {
          type: "text",
          text: rows
            .map(
              (d) => `${d.id.padEnd(22)} ${d.label.padEnd(28)} ${d.count}`
            )
            .join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool: list_repos
// ---------------------------------------------------------------------------
server.tool(
  "list_repos",
  "List all source repositories in the catalog with skill counts and upstream URLs.",
  {},
  async () => {
    const cat = loadCatalog();
    const map = new Map<
      string,
      { repo: string; label: string; upstream: string; tier: string; n: number }
    >();
    for (const s of cat.skills) {
      const k = s.repo;
      const cur = map.get(k);
      if (cur) cur.n += 1;
      else
        map.set(k, {
          repo: s.repo,
          label: s.repoLabel,
          upstream: s.upstream,
          tier: s.tier,
          n: 1,
        });
    }
    const rows = [...map.values()].sort((a, b) => b.n - a.n);
    return {
      content: [
        {
          type: "text",
          text: rows
            .map(
              (r) =>
                `${String(r.n).padStart(5)}  ${r.tier.padEnd(20)}  ${r.label}  (${r.upstream})`
            )
            .join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool: recommend_skills
// ---------------------------------------------------------------------------
server.tool(
  "recommend_skills",
  "Given a free-text task description (e.g. 'I need to add Stripe payments to a Next.js app'), suggest the most relevant skills, ranked by relevance.",
  {
    task: z.string().describe("Plain-English description of what you want to do."),
    limit: z.number().int().min(1).max(20).optional().describe("Max recommendations (default 8)."),
  },
  async ({ task, limit }) => {
    const results = searchSkills({ query: task, limit: limit ?? 8 });
    if (!results.length) {
      return {
        content: [
          { type: "text", text: "No relevant skills found for this task." },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: [
            `Recommended skills for: "${task}"`,
            "",
            ...results.map(
              (s, i) =>
                `${i + 1}. ${s.name}  [${s.primaryTag}]\n   ${s.description}\n   id: ${s.id}\n   source: ${s.repoLabel}`
            ),
            "",
            "Call get_skill with one of these ids to read the full instructions, or install_skill to copy it into your IDE.",
          ].join("\n"),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool: install_skill
// ---------------------------------------------------------------------------
server.tool(
  "install_skill",
  "Download a skill folder from its upstream GitHub repo and write it to a target directory (default: your IDE's skills folder, e.g. ~/.cursor/skills/<slug>/). Set GITHUB_TOKEN env var to avoid rate limits.",
  {
    id: z.string().describe("Skill id from search_skills."),
    ide: z
      .enum(["cursor", "claude-code", "claude", "codex", "windsurf", "opencode", "custom"])
      .optional()
      .describe("Target IDE (default: cursor). Use 'custom' with target_dir for arbitrary paths."),
    target_dir: z
      .string()
      .optional()
      .describe(
        "Absolute path to install into. If omitted, uses the IDE-default skills directory. The skill is placed in <target_dir>/<slug>/."
      ),
  },
  async ({ id, ide, target_dir }) => {
    const skill = findById(id);
    if (!skill) {
      return {
        content: [{ type: "text", text: `Skill not found: ${id}` }],
        isError: true,
      };
    }

    const baseDir = target_dir
      ? target_dir
      : defaultIdeTarget(ide ?? "cursor");
    const finalDir = path.join(baseDir, skill.slug);

    try {
      ensureSafeTarget(baseDir);
      const files = await downloadSkillFolder(skill, finalDir);
      return {
        content: [
          {
            type: "text",
            text: [
              `Installed "${skill.name}" -> ${finalDir}`,
              `Files written (${files.length}):`,
              ...files.map((f) => `  ${f}`),
              "",
              "Restart your IDE/agent to pick up the new skill.",
            ].join("\n"),
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Install failed for ${id}: ${(e as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: catalog_stats
// ---------------------------------------------------------------------------
server.tool(
  "catalog_stats",
  "Get top-level statistics about the skills catalog: total skills, repos, generation time.",
  {},
  async () => {
    const cat = loadCatalog();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              version: VERSION,
              generatedAt: cat.generatedAt,
              totals: cat.totals,
              domains: cat.domains.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Resource: skills://catalog
// ---------------------------------------------------------------------------
server.resource(
  "catalog",
  "skills://catalog",
  {
    description: "Compact JSON catalog of all skills (id, name, description, tags, repo, upstream).",
    mimeType: "application/json",
  },
  async (uri) => {
    const cat = loadCatalog();
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              generatedAt: cat.generatedAt,
              totals: cat.totals,
              domains: cat.domains,
              skills: cat.skills.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                tags: s.tags,
                repo: s.repo,
                repoLabel: s.repoLabel,
                tier: s.tier,
                upstream: s.upstream,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function main() {
  // Pre-load catalog so failures surface at startup.
  const cat = loadCatalog();
  process.stderr.write(
    `[skills-mcp] v${VERSION} ready · ${cat.totals.skills} skills · ${cat.totals.repos} repos\n`
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`[skills-mcp] fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
