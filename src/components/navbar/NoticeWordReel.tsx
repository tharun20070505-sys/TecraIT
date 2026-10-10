"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { siteSettings } from "@/data/site";
import type { BrandReelItem, NoticeItem, EventItem } from "@/types";

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

interface ReelItem {
  id: string;
  text: string;
  link?: string;
  isLink?: boolean;
}

interface NoticeWordReelProps {
  notices?: NoticeItem[];
  upcomingEvents?: EventItem[];
  customBrandReel?: BrandReelItem[];
  hidden?: boolean;
}

export function NoticeWordReel({
  notices = [],
  upcomingEvents = [],
  customBrandReel,
  hidden = false,
}: NoticeWordReelProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const isReducedMotion = usePrefersReducedMotion();
  const [animationDuration, setAnimationDuration] = useState<number>(25);

  const containerRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);

  // 1. Build the list of reel items:
  // Core brand words first (ordered & active)
  const brandWords: ReelItem[] = (
    customBrandReel || siteSettings.brandReel || []
  )
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      text: item.text,
      isLink: false,
    }));

  // Optional extra items: active notices as links
  const noticeItems: ReelItem[] = notices
    .filter((n) => n.active)
    .map((n) => ({
      id: `notice-${n.id}`,
      text: n.title,
      link: n.link || "/events",
      isLink: Boolean(n.link),
    }));

  // Optional extra items: upcoming events (title and date)
  const eventItems: ReelItem[] = upcomingEvents
    .filter((e) => e.isUpcoming)
    .slice(0, 3)
    .map((e) => ({
      id: `event-${e.id}`,
      text: `${e.title} (${e.date})`,
      link: `/events/${e.slug}`,
      isLink: true,
    }));

  const allItems: ReelItem[] = [...brandWords, ...noticeItems, ...eventItems];

  // Calculate dynamic speed of ~60px/second
  useEffect(() => {
    if (firstGroupRef.current) {
      const width = firstGroupRef.current.offsetWidth;
      if (width > 0) {
        const calculatedSec = Math.max(10, width / 60);
        setAnimationDuration(calculatedSec);
      }
    }
  }, [allItems.length]);

  // Tab visibility and intersection handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // IntersectionObserver to pause when scrolled out of view
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIsInView(entry?.isIntersecting ?? true);
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  // Return null only if no items exist, strictly after all hooks have executed
  if (allItems.length === 0) {
    return null;
  }

  const effectivePaused = isPaused || isTabHidden || !isInView || hidden;

  // Single string representation for screen readers
  const screenReaderText = allItems.map((item) => item.text).join(", ");

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[38px] lg:h-[42px] bg-[#222733] text-white/95 border-b border-white/10 overflow-hidden select-none z-30 transition-all duration-200 ${
        hidden ? "hidden" : "flex items-center"
      }`}
      aria-label="Brand & Announcement Reel"
    >
      {/* 1. Screen Reader Canonical Announcement (Only read once, not in an infinite loop) */}
      <span className="sr-only">{screenReaderText}</span>

      {/* 2. Visual Content Track */}
      {isReducedMotion ? (
        // Reduced motion: static display without moving
        <div className="w-[min(calc(100%-2*clamp(16px,2.5vw,48px)),1840px)] mx-auto flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-center py-1">
          {allItems.map((item, idx) => (
            <span key={`${item.id}-static`} className="inline-flex items-center gap-3">
              {item.isLink && item.link ? (
                <Link
                  href={item.link}
                  style={{ fontFamily: "Calibri, sans-serif" }}
                  className="font-bold text-[13px] lg:text-[15px] uppercase tracking-[1.5px] text-ivory hover:text-gold transition-colors focus-dark"
                >
                  {item.text}
                </Link>
              ) : (
                <span
                  style={{ fontFamily: "Calibri, sans-serif" }}
                  className="font-bold text-[13px] lg:text-[15px] uppercase tracking-[1.5px] text-ivory"
                >
                  {item.text}
                </span>
              )}
              {idx < allItems.length - 1 && (
                <span
                  className="w-2 h-2 bg-gold rotate-45 shrink-0 inline-block shadow-[0_0_4px_rgba(217,164,65,0.4)]"
                  aria-hidden="true"
                />
              )}
            </span>
          ))}
        </div>
      ) : (
        // Moving track with seamless duplicate and speed-controlled continuous loop
        <div
          className="flex items-center w-max group hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{
            animationName: "word-reel-scroll",
            animationDuration: `${animationDuration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: effectivePaused ? "paused" : "running",
          }}
        >
          {/* First Group */}
          <div ref={firstGroupRef} className="flex items-center shrink-0 pr-8">
            {allItems.map((item) => (
              <span key={`${item.id}-group1`} className="inline-flex items-center">
                {item.isLink && item.link ? (
                  <Link
                    href={item.link}
                    style={{ fontFamily: "Calibri, sans-serif" }}
                    className="font-bold text-[14px] lg:text-[17px] uppercase tracking-[1.5px] text-ivory hover:text-gold transition-colors px-3 py-1 focus-dark"
                  >
                    {item.text}
                  </Link>
                ) : (
                  <span
                    style={{ fontFamily: "Calibri, sans-serif" }}
                    className="font-bold text-[14px] lg:text-[17px] uppercase tracking-[1.5px] text-ivory px-3 py-1"
                  >
                    {item.text}
                  </span>
                )}
                {/* 8px CSS Gold Diamond Separator (Never a text character) */}
                <span
                  className="w-2 h-2 bg-gold rotate-45 shrink-0 inline-block mx-2 shadow-[0_0_4px_rgba(217,164,65,0.5)]"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>

          {/* Second Duplicate Group for Seamless -50% Loop (aria-hidden) */}
          <div aria-hidden="true" className="flex items-center shrink-0 pr-8">
            {allItems.map((item) => (
              <span key={`${item.id}-group2`} className="inline-flex items-center">
                {item.isLink && item.link ? (
                  <Link
                    href={item.link}
                    tabIndex={-1}
                    style={{ fontFamily: "Calibri, sans-serif" }}
                    className="font-bold text-[14px] lg:text-[17px] uppercase tracking-[1.5px] text-ivory hover:text-gold transition-colors px-3 py-1"
                  >
                    {item.text}
                  </Link>
                ) : (
                  <span
                    style={{ fontFamily: "Calibri, sans-serif" }}
                    className="font-bold text-[14px] lg:text-[17px] uppercase tracking-[1.5px] text-ivory px-3 py-1"
                  >
                    {item.text}
                  </span>
                )}
                <span
                  className="w-2 h-2 bg-gold rotate-45 shrink-0 inline-block mx-2 shadow-[0_0_4px_rgba(217,164,65,0.5)]"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Small Pause/Play Button at Far Right (Lucide icon-only, aria-labelled) */}
      {!isReducedMotion && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Play reel" : "Pause reel"}
            className="w-7 h-7 flex items-center justify-center rounded-[2px] bg-[#3E0F25] hover:bg-midnight text-gold border border-gold/40 hover:border-gold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-gold/30" aria-hidden="true" />
            ) : (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
