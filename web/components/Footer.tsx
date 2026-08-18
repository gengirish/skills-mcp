import { FOOTER_LINKS, REPO_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full bg-green"
              aria-hidden="true"
            />
            <span className="font-mono text-sm text-bone">skills-mcp</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-faint">
            MIT licensed. Indexed skills keep their upstream licenses — check
            the source repo before redistributing.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-5 sm:px-8">
        <p className="border-t border-line pt-6 font-mono text-xs text-faint">
          Built by{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-bone"
          >
            gengirish
          </a>
        </p>
      </div>
    </footer>
  );
}
