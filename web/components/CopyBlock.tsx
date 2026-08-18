"use client";

import { useEffect, useRef, useState } from "react";

interface CopyBlockProps {
  code: string;
  /** Renders as a single terminal line with a `$` prompt. */
  inline?: boolean;
  className?: string;
  label?: string;
}

export default function CopyBlock({
  code,
  inline = false,
  className = "",
  label,
}: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear on unmount so a pending reset can't fire against a gone component.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard is unavailable over plain http and in some embedded
      // browsers. The command stays selectable, so fail quietly.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-line2 bg-bg2 ${className}`}
    >
      {label ? (
        <div className="border-b border-line px-4 py-2 font-mono text-[11px] tracking-widest text-faint uppercase">
          {label}
        </div>
      ) : null}

      <div className="flex items-start gap-3 px-4 py-3.5">
        {inline ? (
          <span aria-hidden="true" className="font-mono text-sm text-green">
            $
          </span>
        ) : null}

        <pre
          className={`min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-bone ${
            inline ? "whitespace-pre" : "whitespace-pre"
          }`}
        >
          <code>{code}</code>
        </pre>

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
          className="shrink-0 rounded-md border border-line2 bg-bg3 px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-green/50 hover:text-green"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </div>
  );
}
