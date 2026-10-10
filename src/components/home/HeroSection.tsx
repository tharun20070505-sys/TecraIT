"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { HeroSlide } from "@/types";
import { HeroTitleFade } from "./HeroTitleFade";
import { HeroSlideshow } from "./HeroSlideshow";

interface HeroSectionProps {
  slides: HeroSlide[];
  intervalSeconds: number;
  overlayMinimum: number;
  initialIndex: number;
  lineOne?: string;
  lineTwo?: string;
  secondsPerText?: number;
}

export function HeroSection({
  slides,
  intervalSeconds,
  overlayMinimum,
  initialIndex,
  lineOne = "TECRA",
  lineTwo = "Department of Information Technology",
  secondsPerText = 3,
}: HeroSectionProps) {
  const posterRef = useRef<HTMLElement>(null);
  const [manualPaused, setManualPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [posterVisible, setPosterVisible] = useState(true);
  const paused = manualPaused || tabHidden || !posterVisible;

  useEffect(() => {
    const poster = posterRef.current;
    if (!poster) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPosterVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.01 }
    );
    observer.observe(poster);

    const onVisibilityChange = () => setTabHidden(document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <section
      ref={posterRef}
      className="relative w-full h-[calc(100svh-5rem)] min-h-[560px] flex items-center bg-midnight text-white overflow-hidden border-b border-sand/20"
      aria-label="Department Hero Poster"
    >
      <HeroSlideshow
        slides={slides}
        intervalSeconds={intervalSeconds}
        overlayMinimum={overlayMinimum}
        initialIndex={initialIndex}
        paused={paused}
      />

      {/* 3. Hero Title: Reserved-space drift-corrected title switcher */}
      <div className="relative z-10 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto flex items-center justify-start h-full">
        <HeroTitleFade
          paused={paused}
          manualPaused={manualPaused}
          lineOne={lineOne}
          lineTwo={lineTwo}
          secondsPerText={secondsPerText}
        />
      </div>

      <button
        type="button"
        onClick={() => setManualPaused((current) => !current)}
        aria-label={manualPaused ? "Play hero animation" : "Pause hero animation"}
        aria-pressed={manualPaused}
        className="absolute bottom-6 left-[clamp(20px,3.5vw,64px)] z-20 flex h-11 w-11 items-center justify-center rounded-[3px] border border-sand/40 bg-midnight/85 text-gold backdrop-blur-xs transition-colors hover:bg-deep-navy hover:text-white focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
      >
        {manualPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
      </button>
    </section>
  );
}
