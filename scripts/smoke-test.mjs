#!/usr/bin/env node
/**
 * Quick stdio smoke test: spawn the server, send initialize + tools/list +
 * a search_skills call, print the responses.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(__dirname, "../dist/index.js");

const child = spawn(process.execPath, [ENTRY], {
  stdio: ["pipe", "pipe", "inherit"],
});

let buf = "";
const pending = new Map();
let nextId = 1;

function send(method, params) {
  const id = nextId++;
  const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  child.stdin.write(msg + "\n");
  return new Promise((resolve) => pending.set(id, resolve));
}

function notify(method, params) {
  const msg = JSON.stringify({ jsonrpc: "2.0", method, params });
  child.stdin.write(msg + "\n");
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
    } catch {
      // Ignore non-JSON lines
    }
  }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const init = await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke-test", version: "0.1.0" },
  });
  console.log("=== initialize ===");
  console.log(JSON.stringify(init.result, null, 2).slice(0, 600));

  notify("notifications/initialized", {});
  await sleep(50);

  const tools = await send("tools/list", {});
  console.log("\n=== tools/list ===");
  console.log(
    tools.result.tools.map((t) => `  - ${t.name}: ${t.description.slice(0, 80)}`).join("\n")
  );

  const search = await send("tools/call", {
    name: "search_skills",
    arguments: { query: "kubernetes deploy", limit: 3 },
  });
  console.log("\n=== search_skills('kubernetes deploy') ===");
  console.log(search.result.content[0].text);

  const stats = await send("tools/call", {
    name: "catalog_stats",
    arguments: {},
  });
  console.log("\n=== catalog_stats ===");
  console.log(stats.result.content[0].text);

  const domains = await send("tools/call", {
    name: "list_domains",
    arguments: {},
  });
  console.log("\n=== list_domains ===");
  console.log(domains.result.content[0].text);

  child.kill();
  process.exit(0);
})().catch((e) => {
  console.error("SMOKE TEST FAILED:", e);
  child.kill();
  process.exit(1);
});
