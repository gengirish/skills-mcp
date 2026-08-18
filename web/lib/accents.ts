import type { Accent } from "./constants";

/**
 * Tailwind scans source files for literal class strings, so accent classes
 * have to be written out rather than built with template interpolation.
 */
export const ACCENT_TEXT: Record<Accent, string> = {
  green: "text-green",
  blue: "text-blue",
  purple: "text-purple",
  amber: "text-amber",
};

export const ACCENT_DOT: Record<Accent, string> = {
  green: "bg-green",
  blue: "bg-blue",
  purple: "bg-purple",
  amber: "bg-amber",
};

export const ACCENT_GLOW: Record<Accent, string> = {
  green: "group-hover:border-green/40",
  blue: "group-hover:border-blue/40",
  purple: "group-hover:border-purple/40",
  amber: "group-hover:border-amber/40",
};
