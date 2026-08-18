import CopyBlock from "@/components/CopyBlock";
import { delay } from "@/lib/anim";
import {
  HERO_STATS,
  INSTALL_CMD,
  REPO_URL,
  SKILLS_ROUNDED,
  STATS,
  VERSION,
} from "@/lib/constants";

/*
 * Deliberately a server component with CSS-only entrance animation: the hero
 * is the LCP element, so it should render in the first HTML payload rather
 * than wait for a client bundle to hydrate it into visibility.
 */
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="grid-bg absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          className="anim-up flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs"
          style={delay(0.05)}
        >
          <span className="rounded-full border border-line2 bg-bg2 px-3 py-1 text-green">
            v{VERSION}
          </span>
          <span className="text-faint">MIT licensed</span>
          <span className="text-line2" aria-hidden="true">
            ·
          </span>
          <span className="text-faint">Model Context Protocol</span>
        </div>

        <h1
          className="anim-up mt-7 max-w-4xl text-[clamp(2.6rem,7vw,4.75rem)] leading-[1.03] font-bold tracking-[-0.03em]"
          style={delay(0.12)}
        >
          {SKILLS_ROUNDED} agent skills.
          <br />
          <span className="text-green">One MCP server.</span>
        </h1>

        <p
          className="anim-up mt-7 max-w-2xl text-lg leading-relaxed text-muted"
          style={delay(0.2)}
        >
          Agent skills are scattered across {STATS.repos} unrelated GitHub repos
          with no index, no search and no install path.{" "}
          <span className="text-bone">skills-mcp</span> gives your agent one
          searchable catalog — and a single tool call to install from it.
        </p>

        <div className="anim-up mt-9 max-w-xl" style={delay(0.28)}>
          <CopyBlock code={INSTALL_CMD} inline />
        </div>

        <div className="anim-up mt-6 flex flex-wrap gap-3" style={delay(0.36)}>
          <a
            href="#install"
            className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-green/85"
          >
            Get started
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line2 px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-green/50 hover:text-green"
          >
            View source
          </a>
        </div>

        {/* The recording from the repo — real tool output, not a mockup. */}
        <figure className="anim-up mt-16" style={delay(0.44)}>
          <div className="overflow-hidden rounded-xl border border-line2 bg-bg2/60 p-2 shadow-2xl shadow-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/demo.svg"
              alt="Terminal recording: the user asks their agent to find a Stripe skill and install it. The agent calls search_skills and gets 5 matches out of the full catalog, fetches the SKILL.md, then installs it into ~/.cursor/skills/adding-stripe/."
              width={820}
              height={540}
              className="w-full rounded-lg"
            />
          </div>
          <figcaption className="mt-3 text-center text-xs text-faint">
            Scripted recreation — every result, count and path in it is real
            output.
          </figcaption>
        </figure>

        <dl
          className="anim-up mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
          style={delay(0.52)}
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} className="bg-bg2 px-5 py-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-mono text-2xl font-bold text-bone">
                  {s.value}
                </span>
                <span className="mt-1 block text-xs text-faint">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
