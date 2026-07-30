#!/usr/bin/env node
/**
 * Generates assets/social-preview.svg -- the 1280x640 card GitHub renders for
 * every link to the repo (Settings -> Social preview), and that X / LinkedIn /
 * Reddit / Slack unfurl.
 *
 * Rasterise to the PNG GitHub actually wants:
 *   npx @resvg/resvg-js-cli assets/social-preview.svg assets/social-preview.png
 *
 * Keep the important content inside the middle ~1.91:1 band: several platforms
 * crop the top and bottom off a 2:1 card.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, "../assets");

const W = 1280;
const H = 640;
const PAD = 84;

const C = {
  bg: "#0D1117",
  bg2: "#11161F",
  text: "#E6EDF3",
  dim: "#8B949E",
  faint: "#6E7681",
  green: "#7EE787",
  blue: "#79C0FF",
  purple: "#D2A8FF",
  edge: "#21262D",
};

const SANS =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, Inter, Helvetica, Arial, sans-serif";
const MONO =
  "Consolas, ui-monospace, SFMono-Regular, Menlo, 'Liberation Mono', monospace";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A rounded "chip" with monospace label; returns svg + measured width. */
function chip(x, y, label, color, opts = {}) {
  const fs_ = opts.size ?? 21;
  const cw = fs_ * 0.55; // Consolas advance
  const w = label.length * cw + 34;
  const h = 44;
  return {
    w,
    svg: `<g><rect x="${x}" y="${y}" width="${w.toFixed(
      1
    )}" height="${h}" rx="10" fill="${
      opts.fill ?? "#161B22"
    }" stroke="${C.edge}"/><text x="${(x + 17).toFixed(1)}" y="${
      y + h / 2 + fs_ * 0.36
    }" font-family="${MONO}" font-size="${fs_}" fill="${color}">${esc(
      label
    )}</text></g>`,
  };
}

const parts = [];

// --- background -----------------------------------------------------------
parts.push(
  `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg2}"/>
      <stop offset="0.55" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="${C.bg}"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.green}"/>
      <stop offset="0.5" stop-color="${C.blue}"/>
      <stop offset="1" stop-color="${C.purple}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.12" cy="0.06" r="0.75">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.13"/>
      <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
  </defs>`,
  `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
  `<rect width="${W}" height="${H}" fill="url(#glow)"/>`,
  `<rect width="${W}" height="5" fill="url(#rule)"/>`
);

// --- brand row ------------------------------------------------------------
parts.push(
  `<circle cx="${PAD + 7}" cy="${PAD + 30}" r="7" fill="${C.green}"/>`,
  `<text x="${PAD + 26}" y="${PAD + 38}" font-family="${MONO}" font-size="25" fill="${
    C.dim
  }" letter-spacing="0.5">skills-mcp</text>`
);

// --- headline -------------------------------------------------------------
parts.push(
  `<text x="${PAD}" y="${
    PAD + 168
  }" font-family="${SANS}" font-size="86" font-weight="700" fill="${
    C.text
  }" letter-spacing="-2">7,000 agent skills.</text>`,
  `<text x="${PAD}" y="${
    PAD + 272
  }" font-family="${SANS}" font-size="86" font-weight="700" fill="${
    C.green
  }" letter-spacing="-2">One MCP server.</text>`
);

// --- subhead --------------------------------------------------------------
parts.push(
  `<text x="${PAD}" y="${
    PAD + 340
  }" font-family="${SANS}" font-size="27" fill="${C.dim}">Search, preview and install skills from 11 source repos —</text>`,
  `<text x="${PAD}" y="${
    PAD + 380
  }" font-family="${SANS}" font-size="27" fill="${C.dim}">in Cursor, Claude Code, Cline, Windsurf, or any MCP client.</text>`
);

// --- indexed repos, low-contrast texture down the right edge --------------
const REPOS = [
  "zebbern/antigravity-awesome-skills",
  "TerminalSkills/skills",
  "ComposioHQ/awesome-claude-skills",
  "alirezarezvani/claude-skills",
  "wshobson/agents",
  "spencerpauly/awesome-cursor-skills",
  "obra/superpowers-skills",
  "anthropics/skills",
  "antfu/skills",
  "+ 2 more",
];
REPOS.forEach((r, i) => {
  parts.push(
    `<text x="${W - PAD}" y="${
      PAD + 62 + i * 34
    }" text-anchor="end" font-family="${MONO}" font-size="19" fill="#39424E">${esc(
      r
    )}</text>`
  );
});

// --- bottom chips ---------------------------------------------------------
const yChips = H - PAD - 44;
let x = PAD;
for (const [label, color] of [
  ["npx @gengirish/skills-mcp", C.blue],
  ["search_skills", C.purple],
  ["install_skill", C.purple],
]) {
  const c = chip(x, yChips, label, color);
  parts.push(c.svg);
  x += c.w + 14;
}

parts.push(
  `<text x="${W - PAD}" y="${
    yChips + 30
  }" text-anchor="end" font-family="${MONO}" font-size="21" fill="${
    C.faint
  }">github.com/gengirish/skills-mcp</text>`
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>skills-mcp — 7,000 agent skills. One MCP server.</title>
${parts.join("\n")}
</svg>
`;

fs.mkdirSync(ASSETS, { recursive: true });
const out = path.join(ASSETS, "social-preview.svg");
fs.writeFileSync(out, svg);
console.log(`wrote ${out} (${W}x${H})`);
