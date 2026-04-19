#!/usr/bin/env node
// Smoke test: actually call install_skill end-to-end against a tiny skill.
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(__dirname, "../dist/index.js");
const TARGET = path.join(os.tmpdir(), "skills-mcp-install-test");
fs.rmSync(TARGET, { recursive: true, force: true });

const child = spawn(process.execPath, [ENTRY], {
  stdio: ["pipe", "pipe", "inherit"],
});

let buf = "";
const pending = new Map();
let nextId = 1;

function send(method, params) {
  const id = nextId++;
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  return new Promise((resolve) => pending.set(id, resolve));
}
function notify(method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
}

child.stdout.on("data", (chunk) => {
  buf += chunk.toString("utf8");
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    } catch {}
  }
});

(async () => {
  await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "install-test", version: "0.1.0" },
  });
  notify("notifications/initialized", {});

  const target = TARGET.replace(/\\/g, "/");
  const r = await send("tools/call", {
    name: "install_skill",
    arguments: {
      id: "antfu-skills/skills/pnpm/SKILL.md",
      ide: "custom",
      target_dir: TARGET,
    },
  });
  console.log(r.result?.content?.[0]?.text ?? JSON.stringify(r));

  console.log("\nFiles on disk:");
  const list = (dir, prefix = "") => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) list(full, prefix + e.name + "/");
      else
        console.log(
          `  ${prefix}${e.name}  (${fs.statSync(full).size} bytes)`
        );
    }
  };
  if (fs.existsSync(TARGET)) list(TARGET);

  child.kill();
  process.exit(0);
})().catch((e) => {
  console.error("FAILED:", e);
  child.kill();
  process.exit(1);
});
