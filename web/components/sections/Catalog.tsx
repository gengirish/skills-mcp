import RevealOnScroll from "@/components/RevealOnScroll";
import { REPO_URL, SKILLS_EXACT, STATS } from "@/lib/constants";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function Catalog() {
  const max = STATS.domainList[0]?.count ?? 1;

  return (
    <section id="catalog" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p className="font-mono text-xs tracking-widest text-green uppercase">
            The catalog
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,2.9rem)] leading-tight font-bold tracking-[-0.02em]">
            {SKILLS_EXACT} skills, rebuilt every day.
          </h2>
          <p className="mt-5 max-w-2xl text-muted">
            A GitHub Action reads the Trees API for every source repo, parses
            each <code className="font-mono text-bone">SKILL.md</code>{" "}
            frontmatter, classifies it into domains and commits the diff. Last
            built {dateFmt.format(new Date(STATS.generatedAt))}.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Repos */}
          <RevealOnScroll>
            <h3 className="font-mono text-sm text-muted">Source repositories</h3>
            <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {STATS.repoList.map((r) => (
                <li key={r.slug} className="bg-bg2">
                  <a
                    href={r.upstream}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-bg3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[13px] text-bone">
                        {r.slug}
                      </span>
                      <span className="mt-0.5 block text-xs text-faint">
                        {r.tier}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-sm text-muted">
                      {r.count.toLocaleString("en-US")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          {/* Domains */}
          <RevealOnScroll delay={0.08}>
            <h3 className="font-mono text-sm text-muted">
              Domains ({STATS.domains})
            </h3>
            <ul className="mt-5 space-y-2.5">
              {STATS.domainList.map((d) => (
                <li key={d.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-bone">{d.label}</span>
                    <span className="font-mono text-xs text-faint">
                      {d.count.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-1 overflow-hidden rounded-full bg-line"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-green/50"
                      style={{
                        width: `${Math.max(2, (d.count / max) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-faint">
              Skills carry more than one domain tag, so these add up to more
              than {SKILLS_EXACT}. Classification rules live in{" "}
              <a
                href={`${REPO_URL}/blob/main/scripts/classify.mjs`}
                target="_blank"
                rel="noreferrer"
                className="text-muted underline underline-offset-2 hover:text-bone"
              >
                classify.mjs
              </a>
              .
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
