"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

export interface LogoItem {
  id: string;
  name: string;
  logoUrl: string;
  logoDarkUrl?: string;
  href?: string;
  badge?: string;
}

export interface LogoReelSettingsProps {
  speed?: "slow" | "medium" | "fast";
  height?: number;
  greyscale?: boolean;
  linkEnabled?: boolean;
}

interface LogoReelProps {
  logos?: LogoItem[];
  settings?: LogoReelSettingsProps;
  theme?: "light" | "dark";
}

export function LogoReel({
  logos = [],
  settings = {},
  theme = "light",
}: LogoReelProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speed = settings.speed || "slow";
  const height = settings.height || 64;
  const greyscale = settings.greyscale ?? true;
  const linkEnabled = settings.linkEnabled ?? true;

  // Filter out logos without a valid image URL
  const validLogos = logos.filter(
    (l) => l.logoUrl && !l.logoUrl.includes("placeholder") && l.logoUrl.trim() !== ""
  );

  // If it has none, hide the reel completely
  if (validLogos.length === 0) {
    return null;
  }

  // If it has only 1 or 2 items, show them as a still row with no movement
  if (validLogos.length <= 2) {
    return (
      <div
        className="w-full py-8 flex flex-wrap items-center justify-center gap-10"
        aria-label="Department and Society Logos"
      >
        {validLogos.map((item) => {
          const emblemSrc =
            theme === "dark" && item.logoDarkUrl ? item.logoDarkUrl : item.logoUrl;

          const CardContent = (
            <div
              className={`flex items-center gap-3.5 px-5 py-3 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-[#0B132B]/70 border-white/10"
                  : "bg-white border-sand shadow-xs"
              } ${greyscale ? "grayscale hover:grayscale-0 focus-within:grayscale-0" : ""}`}
            >
              <div
                className="relative shrink-0 flex items-center justify-center"
                style={{ height: `${height}px`, width: `${height * 1.3}px` }}
              >
                <Image
                  src={emblemSrc}
                  alt={`${item.name} emblem`}
                  fill
                  sizes="120px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold leading-tight ${
                    theme === "dark" ? "text-sand" : "text-text"
                  }`}
                >
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );

          if (linkEnabled && item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="focus-visible:outline-2 focus-visible:outline-royal-blue rounded-xl"
              >
                {CardContent}
              </Link>
            );
          }

          return <div key={item.id}>{CardContent}</div>;
        })}
      </div>
    );
  }

  // If reel has fewer than 6 items, repeat the set so seamless loop still fills the screen
  let displayList = [...validLogos];
  if (displayList.length < 6) {
    const repeatsNeeded = Math.ceil(6 / displayList.length);
    const repeated: LogoItem[] = [];
    for (let i = 0; i < repeatsNeeded; i++) {
      repeated.push(...validLogos);
    }
    displayList = repeated;
  }

  // Double for seamless marquee loop
  const loopList = [...displayList, ...displayList];

  // Speed calculation (~40px/s default for slow)
  const duration = {
    slow: `${Math.max(displayList.length * 6, 36)}s`,
    medium: `${Math.max(displayList.length * 4, 24)}s`,
    fast: `${Math.max(displayList.length * 2.5, 16)}s`,
  }[speed];

  const handleManualScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div
      className="relative w-full py-4 group"
      aria-label="Partner and Society Logos Strip"
    >
      {/* Edge gradient masks for seamless visual fade */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none ${
          theme === "dark"
            ? "bg-gradient-to-r from-[#070B18] to-transparent"
            : "bg-gradient-to-r from-mist to-transparent"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none ${
          theme === "dark"
            ? "bg-gradient-to-l from-[#070B18] to-transparent"
            : "bg-gradient-to-l from-mist to-transparent"
        }`}
      />

      {/* Manual Scroll Buttons (Accessible and active under reduced motion or user scroll) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => handleManualScroll("left")}
          className="p-1.5 rounded-full bg-midnight/80 text-sand hover:text-gold border border-sand/30 backdrop-blur shadow-sm cursor-pointer"
          aria-label="Scroll logos left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => handleManualScroll("right")}
          className="p-1.5 rounded-full bg-midnight/80 text-sand hover:text-gold border border-sand/30 backdrop-blur shadow-sm cursor-pointer"
          aria-label="Scroll logos right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pause / Play Toggle Control */}
      <div className="absolute top-0 right-3 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-2 py-1 rounded-md bg-midnight/80 text-sand hover:text-gold border border-sand/20 text-[10px] font-mono flex items-center gap-1 shadow-xs cursor-pointer backdrop-blur"
          aria-label={isPlaying ? "Pause logos scroll" : "Play logos scroll"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 text-gold" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-gold text-gold" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Scrolling Strip Container */}
      <div
        ref={scrollRef}
        className="w-full overflow-hidden motion-reduce:overflow-x-auto motion-reduce:scroll-smooth no-scrollbar"
      >
        <div
          className="reel-marquee-track flex w-max items-center gap-8 sm:gap-12 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none"
          style={{
            animationDuration: duration,
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        >
          {loopList.map((item, idx) => {
            const emblemSrc =
              theme === "dark" && item.logoDarkUrl ? item.logoDarkUrl : item.logoUrl;

            const ItemCard = (
              <div
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl border transition-all ${
                  theme === "dark"
                    ? "bg-[#0B132B]/80 border-white/10"
                    : "bg-white border-sand shadow-xs"
                } ${
                  greyscale
                    ? "grayscale hover:grayscale-0 focus-within:grayscale-0"
                    : "grayscale-0"
                }`}
              >
                <div
                  className="relative shrink-0 flex items-center justify-center"
                  style={{ height: `${height}px`, width: `${height * 1.3}px` }}
                >
                  <Image
                    src={emblemSrc}
                    alt={`${item.name} emblem`}
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-tight whitespace-nowrap ${
                      theme === "dark" ? "text-sand" : "text-text"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );

            if (linkEnabled && item.href) {
              return (
                <Link
                  key={`${item.id}-${idx}`}
                  href={item.href}
                  className="shrink-0 focus-visible:outline-2 focus-visible:outline-royal-blue rounded-xl"
                >
                  {ItemCard}
                </Link>
              );
            }

            return (
              <div key={`${item.id}-${idx}`} className="shrink-0">
                {ItemCard}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
