import { STATS } from "@/lib/constants";

/**
 * The track holds the repo list twice; the marquee keyframe translates by
 * exactly -50%, so the second copy lands where the first started and the loop
 * is seamless.
 */
export default function RepoTicker() {
  const items = STATS.repoList;

  return (
    <section
      aria-label="Indexed source repositories"
      className="border-y border-line bg-bg2/40 py-5"
    >
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-10">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-10"
              aria-hidden={copy === 1}
            >
              {items.map((r) => (
                <span
                  key={r.slug}
                  className="flex items-center gap-2.5 font-mono text-sm whitespace-nowrap text-faint"
                >
                  <span className="text-line2">/</span>
                  {r.slug}
                  <span className="text-muted/60">
                    {r.count.toLocaleString("en-US")}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
