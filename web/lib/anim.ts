import type { CSSProperties } from "react";

/**
 * Stagger delay for the `.anim-up` / `.reveal` entrance classes.
 * Custom properties aren't in CSSProperties, hence the cast.
 */
export function delay(seconds: number): CSSProperties {
  return { "--d": `${seconds}s` } as CSSProperties;
}
