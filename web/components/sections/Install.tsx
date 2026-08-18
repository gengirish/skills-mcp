"use client";

import { useState } from "react";
import CopyBlock from "@/components/CopyBlock";
import RevealOnScroll from "@/components/RevealOnScroll";
import { INSTALL_TARGETS, type InstallTargetId } from "@/lib/constants";

export default function Install() {
  // Annotated: `as const` on INSTALL_TARGETS would otherwise narrow the state
  // to the first tab's literal id and reject every other tab.
  const [active, setActive] = useState<InstallTargetId>(INSTALL_TARGETS[0].id);
  const target =
    INSTALL_TARGETS.find((t) => t.id === active) ?? INSTALL_TARGETS[0];

  return (
    <section id="install" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p className="font-mono text-xs tracking-widest text-green uppercase">
            Install
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,2.9rem)] leading-tight font-bold tracking-[-0.02em]">
            Running in about thirty seconds.
          </h2>
          <p className="mt-5 max-w-2xl text-muted">
            No account, no API key, no hosted service. The server runs locally
            over stdio and the catalog ships with it.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <div className="mt-12">
            <div
              role="tablist"
              aria-label="Editor"
              className="flex flex-wrap gap-2"
            >
              {INSTALL_TARGETS.map((t) => {
                const selected = t.id === active;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    id={`tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setActive(t.id)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                      selected
                        ? "border-green/50 bg-green/10 text-green"
                        : "border-line2 text-muted hover:border-line2 hover:text-bone"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`panel-${target.id}`}
              aria-labelledby={`tab-${target.id}`}
              className="mt-6"
            >
              <CopyBlock
                code={target.code}
                inline={target.lang === "bash"}
                label={target.lang}
              />
              <p className="mt-3 text-sm text-muted">{target.note}</p>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.12}>
          <div className="mt-10 rounded-xl border border-line bg-bg2 p-6">
            <h3 className="font-mono text-sm text-amber">
              Optional: a GitHub token
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Search is local, but{" "}
              <code className="font-mono text-bone">get_skill</code> and{" "}
              <code className="font-mono text-bone">install_skill</code> read
              from GitHub. Anonymous requests are capped at 60/hour; a token
              with no scopes at all raises that to 5,000.
            </p>
            <div className="mt-4">
              <CopyBlock
                code={`{
  "mcpServers": {
    "skills": {
      "command": "skills-mcp",
      "env": { "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx" }
    }
  }
}`}
                label="json"
              />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
