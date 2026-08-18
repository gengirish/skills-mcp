"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { delay as delayStyle } from "@/lib/anim";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Adds `data-visible` once the element scrolls into view; the transition
 * itself lives in globals.css and only applies under `.js`, so content is
 * visible when JS is unavailable rather than stuck at opacity 0.
 */
export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-visible={visible ? "true" : undefined}
      style={delay ? delayStyle(delay) : undefined}
    >
      {children}
    </div>
  );
}
