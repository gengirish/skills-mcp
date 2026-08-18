"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS, REPO_URL } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
          <span className="font-mono text-[15px] font-medium tracking-tight text-bone">
            skills-mcp
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line2 px-3.5 py-1.5 font-mono text-[13px] text-bone transition-colors hover:border-green/50 hover:text-green"
          >
            GitHub
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
          className="rounded-md border border-line2 p-2 md:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-bg/95 px-5 py-4 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-muted transition-colors hover:bg-bg3 hover:text-bone"
              >
                {l.label}
              </a>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-2 py-2.5 text-sm text-green"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
