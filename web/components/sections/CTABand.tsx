import CopyBlock from "@/components/CopyBlock";
import RevealOnScroll from "@/components/RevealOnScroll";
import { INSTALL_CMD, REPO_URL } from "@/lib/constants";

export default function CTABand() {
  return (
    <section className="border-t border-line py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <RevealOnScroll>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] leading-tight font-bold tracking-[-0.02em]">
            Give your agent the whole catalog.
          </h2>
          <p className="mt-5 text-muted">
            One command. Runs locally, costs nothing, and works with any MCP
            client.
          </p>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <CopyBlock code={INSTALL_CMD} inline />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-green/85"
            >
              Star on GitHub
            </a>
            <a
              href="#install"
              className="rounded-lg border border-line2 px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-green/50 hover:text-green"
            >
              Setup for my editor
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
