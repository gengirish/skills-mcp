import RevealOnScroll from "@/components/RevealOnScroll";
import { ACCENT_DOT, ACCENT_TEXT } from "@/lib/accents";
import { TOOLS } from "@/lib/constants";

export default function Tools() {
  return (
    <section id="tools" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p className="font-mono text-xs tracking-widest text-green uppercase">
            The surface
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,2.9rem)] leading-tight font-bold tracking-[-0.02em]">
            Seven tools your agent already knows how to use.
          </h2>
          <p className="mt-5 max-w-2xl text-muted">
            Exposed over the Model Context Protocol, so any compatible client
            discovers them automatically. Names and argument shapes are covered
            by semver from v1.0.0 on.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => (
            <RevealOnScroll key={t.name} delay={(i % 3) * 0.06}>
              <div className="group h-full bg-bg2 p-6 transition-colors hover:bg-bg3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[t.accent]}`}
                    aria-hidden="true"
                  />
                  <h3
                    className={`font-mono text-sm font-medium ${ACCENT_TEXT[t.accent]}`}
                  >
                    {t.name}
                  </h3>
                </div>
                <p className="mt-4 text-[15px] leading-snug font-medium text-bone">
                  {t.summary}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {t.detail}
                </p>
              </div>
            </RevealOnScroll>
          ))}

          {/* Balances the 3-column grid at 7 items and documents the resource. */}
          <RevealOnScroll delay={0.12}>
            <div className="h-full bg-bg2/50 p-6">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-faint"
                  aria-hidden="true"
                />
                <h3 className="font-mono text-sm font-medium text-faint">
                  skills://catalog
                </h3>
              </div>
              <p className="mt-4 text-[15px] leading-snug font-medium text-bone">
                Plus one resource: the whole index as JSON.
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                For agents that would rather load the catalog once and reason
                over it directly.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
