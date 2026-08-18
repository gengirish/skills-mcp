import RevealOnScroll from "@/components/RevealOnScroll";
import { PROBLEMS, SKILLS_EXACT, STATS } from "@/lib/constants";

export default function Why() {
  return (
    <section id="why" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p className="font-mono text-xs tracking-widest text-green uppercase">
            The problem
          </p>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,2.9rem)] leading-tight font-bold tracking-[-0.02em]">
            Skills are everywhere. Finding one is the hard part.
          </h2>
          <p className="mt-5 max-w-2xl text-muted">
            A skill is a <code className="font-mono text-bone">SKILL.md</code>{" "}
            package that teaches an agent to do one specific job well. Thousands
            exist. Almost none of them are discoverable.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <RevealOnScroll key={p.title} delay={i * 0.08}>
              <div className="h-full bg-bg2 p-7">
                <span className="font-mono text-sm text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-bone">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {p.body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.1}>
          <div className="mt-10 rounded-xl border border-green/25 bg-green/[0.05] p-7 sm:p-9">
            <p className="text-lg leading-relaxed text-bone sm:text-xl">
              <span className="font-mono text-green">skills-mcp</span> collapses
              that into one MCP server —{" "}
              <span className="font-semibold">{SKILLS_EXACT} skills</span> from{" "}
              <span className="font-semibold">{STATS.repos} repos</span>,
              searchable from inside your editor and installable in a single
              tool call.
            </p>
            <p className="mt-4 text-sm text-muted">
              The catalog ships inside the npm package, so search is in-memory
              and instant. Only fetching and installing a skill touches the
              network.
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
