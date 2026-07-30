#!/usr/bin/env node
/**
 * Generates the README demo asset: a self-contained animated SVG "terminal
 * recording" of an agent session that searches for a Stripe skill and installs
 * it.
 *
 * The transcript below is a scripted recreation, but every figure in it comes
 * from a real run against the shipped catalog (see scripts/smoke-test.mjs):
 *   - 6,998 indexed skills          -> data/catalog.json totals
 *   - the two Stripe hits + blurbs  -> search_skills({query:"stripe payments"})
 *   - 2,264 B SKILL.md, 1 file      -> the real upstream folder listing
 *
 * Usage:
 *   node scripts/make-demo.mjs                 # -> assets/demo.svg (animated)
 *   node scripts/make-demo.mjs --frames        # -> assets/.frames/*.svg (for GIF)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, "../assets");

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const W = 820;
const PAD_X = 26;
const TITLEBAR = 40;
const PAD_TOP = 22;
const LINE_H = 24;
const FONT_SIZE = 14.5;
const CHAR_W = 8.71; // measured advance for 14.5px monospace
const TOTAL = 20; // seconds per loop
const FPS = 10; // for --frames / GIF

// GitHub-dark-ish palette
const C = {
  bg: "#0D1117",
  bar: "#161B22",
  edge: "#30363D",
  text: "#C9D1D9",
  bright: "#E6EDF3",
  dim: "#8B949E",
  green: "#7EE787",
  blue: "#79C0FF",
  purple: "#D2A8FF",
  amber: "#E3B341",
  red: "#FF7B72",
};

// ---------------------------------------------------------------------------
// Transcript. Each line: { at, spans:[[text, cls]], right?:[text, cls], type? }
// `cls` maps to a fill colour; `b` suffix means bold.
// ---------------------------------------------------------------------------
const PROMPT = "find me a Stripe skill and install it";

const LINES = [
  {
    at: 0.6,
    type: "typing",
    lead: ["❯", "green-b"],
    spans: [["  ", "dim"]],
    typed: [PROMPT, "bright-b"],
    typeFor: 2.8,
  },
  { at: 0, spans: [] },
  {
    at: 4.3,
    spans: [
      ["● ", "blue"],
      ["search_skills", "blue-b"],
      ["(", "dim"],
      ["query", "text"],
      [": ", "dim"],
      ['"stripe payments"', "amber"],
      [")", "dim"],
    ],
  },
  {
    at: 5.2,
    spans: [
      ["  └─ ", "dim"],
      ["Found ", "dim"],
      ["5", "bright"],
      [" matches across ", "dim"],
      ["6,998", "bright"],
      [" indexed skills", "dim"],
    ],
  },
  { at: 0, spans: [] },
  {
    at: 6.3,
    spans: [
      ["   • ", "green"],
      ["adding-stripe", "bright-b"],
    ],
    right: ["Cursor-native", "purple"],
  },
  {
    at: 6.7,
    spans: [["     Integrate Stripe payments into a web app — checkout", "dim"]],
  },
  {
    at: 7.0,
    spans: [["     sessions, webhooks, and customer portal.", "dim"]],
  },
  {
    at: 7.8,
    spans: [
      ["   • ", "green"],
      ["stripe-integration", "bright-b"],
    ],
    right: ["wshobson · agents", "purple"],
  },
  {
    at: 8.2,
    spans: [["     PCI-compliant checkout, subscriptions, and webhooks.", "dim"]],
  },
  { at: 0, spans: [] },
  {
    at: 9.4,
    spans: [
      ["● ", "blue"],
      ["get_skill", "blue-b"],
      ["(", "dim"],
      ['"…/adding-stripe/SKILL.md"', "amber"],
      [")", "dim"],
    ],
  },
  {
    at: 10.3,
    spans: [
      ["  └─ ", "dim"],
      ["2.2 KB", "bright"],
      [" from raw.githubusercontent.com", "dim"],
    ],
  },
  { at: 0, spans: [] },
  {
    at: 11.5,
    spans: [
      ["● ", "blue"],
      ["install_skill", "blue-b"],
      ["(", "dim"],
      ["id", "text"],
      [": ", "dim"],
      ['"…/adding-stripe/SKILL.md"', "amber"],
      [", ", "dim"],
      ["ide", "text"],
      [": ", "dim"],
      ['"cursor"', "amber"],
      [")", "dim"],
    ],
  },
  {
    at: 12.5,
    spans: [
      ["  └─ ", "dim"],
      ["Installed → ", "text"],
      ["~/.cursor/skills/adding-stripe/", "green"],
    ],
  },
  { at: 13.0, spans: [["       SKILL.md", "dim"]] },
  { at: 0, spans: [] },
  {
    at: 14.3,
    lead: ["✔", "green-b"],
    spans: [
      ["  ", "dim"],
      ["adding-stripe is ready — restart Cursor to load it.", "bright"],
    ],
  },
];

const H = TITLEBAR + PAD_TOP * 2 + LINES.length * LINE_H;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fill = (cls) => C[cls.replace(/-b$/, "")] ?? C.text;
const weight = (cls) => (cls.endsWith("-b") ? "600" : "400");

const pct = (t) => ((t / TOTAL) * 100).toFixed(3);

function lineY(i) {
  return TITLEBAR + PAD_TOP + i * LINE_H + FONT_SIZE;
}

const tspan = ([text, cls]) =>
  `<tspan fill="${fill(cls)}" font-weight="${weight(cls)}">${esc(text)}</tspan>`;

/**
 * Render one transcript line as a single <text> of <tspan> runs, so the
 * renderer -- not a hard-coded advance width -- lays out the glyphs. `extra`
 * is spliced into the opening <text> tag (used to pin the command line's
 * width so the typing clip stays in sync across renderers).
 */
function renderSpans(line, y, typedChars, extra = "") {
  const out = [];
  const runs = line.spans.map(tspan);

  // Glyphs outside the monospace face (❯, ✔) go in their own <text>: some
  // renderers fall back for the entire element, which would knock the whole
  // line out of the monospace grid. The line's spans reserve the space.
  if (line.lead) {
    const [text, cls] = line.lead;
    out.push(
      `<text x="${PAD_X}" y="${y}" fill="${fill(cls)}" font-weight="${weight(
        cls
      )}">${esc(text)}</text>`
    );
  }

  if (line.typed) {
    const [full, cls] = line.typed;
    const text = typedChars == null ? full : full.slice(0, typedChars);
    if (text) runs.push(tspan([text, cls]));
  }

  if (runs.length) {
    out.push(
      `<text x="${PAD_X}" y="${y}"${extra} xml:space="preserve">${runs.join(
        ""
      )}</text>`
    );
  }

  if (line.right) {
    const [text, cls] = line.right;
    out.push(
      `<text x="${W - PAD_X}" y="${y}" fill="${fill(
        cls
      )}" text-anchor="end" font-weight="${weight(cls)}">${esc(text)}</text>`
    );
  }

  return out.join("");
}

function chrome() {
  return [
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.edge}"/>`,
    `<path d="M0.5 10.5a10 10 0 0 1 10-10h${W - 21}a10 10 0 0 1 10 10V${TITLEBAR}H0.5Z" fill="${C.bar}"/>`,
    `<line x1="0.5" y1="${TITLEBAR}" x2="${W - 0.5}" y2="${TITLEBAR}" stroke="${C.edge}"/>`,
    `<circle cx="22" cy="20" r="5.5" fill="#FF5F57"/>`,
    `<circle cx="41" cy="20" r="5.5" fill="#FEBC2E"/>`,
    `<circle cx="60" cy="20" r="5.5" fill="#28C840"/>`,
    `<text x="${W / 2}" y="25" fill="${C.dim}" text-anchor="middle" font-size="12.5">agent · skills-mcp</text>`,
  ].join("");
}

const FONT_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function wrap(body, style) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT_STACK}" font-size="${FONT_SIZE}" role="img" aria-label="Terminal demo: an agent searches the skills catalog for a Stripe skill and installs it into ~/.cursor/skills/">
<title>skills-mcp — find a Stripe skill and install it</title>
${style}${body}</svg>
`;
}

// ---------------------------------------------------------------------------
// Animated SVG
// ---------------------------------------------------------------------------
function buildAnimated() {
  const keyframes = [];
  const rules = [];
  const body = [chrome()];

  LINES.forEach((line, i) => {
    if (!line.spans.length && !line.typed) return;
    const y = lineY(i);
    const cls = `r${i}`;
    const p = pct(line.at);
    const p2 = pct(Math.min(line.at + 0.12, TOTAL));

    keyframes.push(
      `@keyframes ${cls}{0%,${p}%{opacity:0}${p2}%,100%{opacity:1}}`
    );
    // Base state is *visible*: a renderer that ignores CSS animation shows the
    // finished transcript rather than an empty window. When animation does run,
    // the keyframes take over and start it at 0.
    rules.push(`.${cls}{opacity:1;animation:${cls} ${TOTAL}s linear infinite}`);

    if (line.type === "typing") {
      // The whole command line is one <text> pinned to an exact width with
      // textLength, so the clip wipe below lands on real character boundaries
      // no matter which monospace face the renderer resolves.
      const prefixChars = line.spans.reduce((n, [t]) => n + t.length, 0);
      const typedChars = line.typed[0].length;
      const lineW = (prefixChars + typedChars) * CHAR_W;
      const prefixW = prefixChars * CHAR_W;
      const typedW = typedChars * CHAR_W;

      const tEnd = line.at + line.typeFor;
      const a = pct(line.at);
      const b = pct(tEnd);
      const steps = Math.round(typedChars / ((tEnd - line.at) / TOTAL));
      // Start the wipe past the prompt so "> " is visible before typing begins.
      const from = (prefixW / lineW).toFixed(4);

      keyframes.push(
        `@keyframes type{0%,${a}%{transform:scaleX(${from})}${b}%,100%{transform:scaleX(1)}}`,
        `@keyframes caret{0%,${a}%{transform:translateX(0)}${b}%,100%{transform:translateX(${typedW.toFixed(
          2
        )}px)}}`,
        `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}`,
        // Caret only exists while the prompt is being typed.
        `@keyframes gate{0%,${a}%{opacity:0}${a}%,${pct(
          tEnd + 0.4
        )}%{opacity:1}${pct(tEnd + 0.5)}%,100%{opacity:0}}`
      );
      rules.push(
        `#typeclip rect{transform-origin:${PAD_X}px 0;animation:type ${TOTAL}s steps(${steps}) infinite}`,
        `#caret{animation:caret ${TOTAL}s steps(${steps}) infinite}`,
        `#caretwrap{animation:blink 1s steps(1) infinite}`,
        // Hidden unless animation is actually running (see note above).
        `#caretgate{opacity:0;animation:gate ${TOTAL}s linear infinite}`
      );

      body.push(
        `<defs><clipPath id="typeclip"><rect x="${PAD_X}" y="${
          y - FONT_SIZE - 4
        }" width="${lineW.toFixed(2)}" height="${LINE_H}"/></clipPath></defs>`,
        `<g class="${cls}">`,
        `<g clip-path="url(#typeclip)">${renderSpans(
          line,
          y,
          null,
          ` textLength="${lineW.toFixed(2)}" lengthAdjust="spacing"`
        )}</g>`,
        `<g id="caretgate"><g id="caretwrap"><g id="caret"><rect x="${(
          PAD_X + prefixW
        ).toFixed(2)}" y="${(y - FONT_SIZE + 1).toFixed(2)}" width="${(
          CHAR_W - 0.6
        ).toFixed(2)}" height="${(FONT_SIZE + 3).toFixed(2)}" fill="${
          C.green
        }" opacity="0.85"/></g></g></g>`,
        `</g>`
      );
    } else {
      body.push(`<g class="${cls}">${renderSpans(line, y, null)}</g>`);
    }
  });

  const style = `<style>${keyframes.join("")}${rules.join(
    ""
  )}@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}#caretgate{opacity:0!important}}</style>\n`;

  return wrap(body.join("\n"), style);
}

// ---------------------------------------------------------------------------
// Static frames (for the GIF)
// ---------------------------------------------------------------------------
function buildFrame(t) {
  const body = [chrome()];

  LINES.forEach((line, i) => {
    if (!line.spans.length && !line.typed) return;
    if (t < line.at) return;
    const y = lineY(i);

    if (line.type === "typing") {
      const full = line.typed[0];
      const prefixChars = line.spans.reduce((n, [s]) => n + s.length, 0);
      const prog = Math.min(1, (t - line.at) / line.typeFor);
      const n = Math.round(prog * full.length);
      // Pin width the same way the animated build does, so the caret sits on a
      // real character boundary under any monospace face.
      const w = (prefixChars + n) * CHAR_W;
      body.push(
        renderSpans(
          line,
          y,
          n,
          n ? ` textLength="${w.toFixed(2)}" lengthAdjust="spacing"` : ""
        )
      );
      if (prog < 1 && Math.floor(t * 2) % 2 === 0) {
        body.push(
          `<rect x="${(PAD_X + w).toFixed(2)}" y="${(y - FONT_SIZE + 1).toFixed(
            2
          )}" width="${(CHAR_W - 0.6).toFixed(2)}" height="${(
            FONT_SIZE + 3
          ).toFixed(2)}" fill="${C.green}" opacity="0.85"/>`
        );
      }
    } else {
      body.push(renderSpans(line, y, null));
    }
  });

  return wrap(body.join("\n"), "");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
fs.mkdirSync(ASSETS, { recursive: true });

if (process.argv.includes("--frames")) {
  const dir = path.join(ASSETS, ".frames");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(TOTAL * FPS);
  for (let f = 0; f < n; f++) {
    const t = f / FPS;
    fs.writeFileSync(
      path.join(dir, `f${String(f).padStart(4, "0")}.svg`),
      buildFrame(t)
    );
  }
  console.log(`wrote ${n} frames -> ${dir}`);
} else {
  const out = path.join(ASSETS, "demo.svg");
  fs.writeFileSync(out, buildAnimated());
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`wrote ${out} (${kb} KB, ${W}x${H}, ${TOTAL}s loop)`);
}
