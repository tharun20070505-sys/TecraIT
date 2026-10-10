"use client";

import { useState, useEffect, useRef, useId, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { siteSettings } from "@/data/site";
import type { BrandReelItem } from "@/types";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false
  );
}

interface WordReelStripProps {
  /** Override items (e.g. fetched from DB). Falls back to siteSettings.brandReel. */
  items?: BrandReelItem[];
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

export function WordReelStrip({ items: propItems, className, style, fullWidth = false }: WordReelStripProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const isReducedMotion = usePrefersReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const stripId = useId();

  // Build active item list
  const rawItems = (propItems ?? siteSettings.brandReel ?? [])
    .filter((i) => i.active)
    .sort((a, b) => a.order - b.order);

  // Compute animation duration: ~50 px/s
  useEffect(() => {
    if (firstGroupRef.current) {
      setTrackWidth(firstGroupRef.current.offsetWidth);
    }
  }, [rawItems.length]);

  const durationSec = trackWidth > 0 ? Math.max(10, trackWidth / 50) : 30;

  // Tab-visibility & in-view detection
  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    let obs: IntersectionObserver | null = null;
    if (containerRef.current && "IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        ([entry]) => setIsInView(entry?.isIntersecting ?? true),
        { threshold: 0.1 }
      );
      obs.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      obs?.disconnect();
    };
  }, []);

  // Don't render the strip if there are no active items
  if (rawItems.length === 0) return null;

  const effectivePaused = isPaused || isTabHidden || !isInView;

  // Screen-reader text: items listed once
  const srText = rawItems.map((i) => i.text).join(", ");

  // Separator: small gold diamond, 24 px margin each side
  const Sep = () => (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "5px",
        height: "5px",
        background: "#D9A441",
        transform: "rotate(45deg)",
        flexShrink: 0,
        margin: "0 24px",
        verticalAlign: "middle",
      }}
    />
  );

  const itemTextCls =
    "font-bold text-white uppercase text-[12.5px] tracking-[1.8px] whitespace-nowrap inline-block";
  const itemTextStyle: React.CSSProperties = {
    fontFamily: "Calibri, sans-serif",
  };

  return (
    <div
      ref={containerRef}
      role="marquee"
      aria-label="Department information reel"
      className={className}
      style={{
        width: "100%",
        height: fullWidth ? "38px" : "40px",
        background: fullWidth ? "#374151" : "rgba(0, 0, 0, 0.90)",
        border: fullWidth ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
        borderBottom: fullWidth ? "1px solid rgba(255, 255, 255, 0.15)" : undefined,
        borderRadius: fullWidth ? "0px" : "6px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
    >
      {/* SR-only canonical text */}
      <span className="sr-only">{srText}</span>

      {/* ── Static (reduced-motion) ───────────────────────────────────────── */}
      {isReducedMotion ? (
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            padding: "0 60px",
            gap: 0,
          }}
        >
          {rawItems.map((item, idx) => (
            <span key={`${stripId}-static-${item.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
              <span className={itemTextCls} style={itemTextStyle}>{item.text}</span>
              {idx < rawItems.length - 1 && <Sep />}
            </span>
          ))}
        </div>
      ) : (
        /* ── Animated continuous track ─────────────────────────────────── */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "max-content",
            animationName: "word-reel-scroll",
            animationDuration: `${durationSec}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: effectivePaused ? "paused" : "running",
            willChange: "transform",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Set A – primary (screen-reader reads this) */}
          <div ref={firstGroupRef} style={{ display: "flex", alignItems: "center", paddingRight: "52px" }}>
            {rawItems.map((item) => (
              <span key={`${stripId}-a-${item.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className={itemTextCls} style={itemTextStyle}>{item.text}</span>
                <Sep />
              </span>
            ))}
          </div>

          {/* Set B – duplicate for seamless loop (aria-hidden) */}
          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", paddingRight: "52px" }}>
            {rawItems.map((item) => (
              <span key={`${stripId}-b-${item.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className={itemTextCls} style={itemTextStyle}>{item.text}</span>
                <Sep />
              </span>
            ))}
          </div>

          {/* Set C — extra copy to guarantee 1920+ never shows a gap */}
          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", paddingRight: "52px" }}>
            {rawItems.map((item) => (
              <span key={`${stripId}-c-${item.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className={itemTextCls} style={itemTextStyle}>{item.text}</span>
                <Sep />
              </span>
            ))}
          </div>

          {/* Set D — extra copy for ultrawide (2560+) */}
          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", paddingRight: "52px" }}>
            {rawItems.map((item) => (
              <span key={`${stripId}-d-${item.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className={itemTextCls} style={itemTextStyle}>{item.text}</span>
                <Sep />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pause / Play button */}
      {!isReducedMotion && (
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Play reel" : "Pause reel"}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
          className="focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
