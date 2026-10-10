"use client";

import { useRef } from "react";
import Image from "next/image";
import { ReelImage } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageReelProps {
  images?: (ReelImage & {
    focalPoint?: { x: number; y: number };
  })[];
  speed?: "normal" | "slow";
  aspectRatio?: "video" | "wide" | "standard";
  theme?: "light" | "dark";
  hideIfEmpty?: boolean;
}

export function ImageReel({
  images = [],
  aspectRatio = "video",
  hideIfEmpty = true,
}: ImageReelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    if (hideIfEmpty) {
      return null;
    }
    return null;
  }

  const handleManualScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -350 : 350;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const aspectClass = {
    video: "w-[320px] sm:w-[380px] h-[200px] sm:h-[240px]",
    wide: "w-[360px] sm:w-[440px] h-[190px] sm:h-[220px]",
    standard: "w-[280px] sm:w-[320px] h-[210px] sm:h-[240px]",
  }[aspectRatio];

  const displayItems = images;
  const reelItems = [...displayItems, ...displayItems];
  const duration = `${Math.max(displayItems.length * 4.5, 18)}s`;

  return (
    <div
      className="relative w-full group py-4 select-none"
      aria-label="Image gallery strip"
    >
      {/* Scroll Controls (Desktop overlay on hover or under reduced motion) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => handleManualScroll("left")}
          className="p-2 rounded-full bg-ink/80 text-sand hover:text-gold border border-sand/30 backdrop-blur shadow-md focus-dark cursor-pointer"
          aria-label="Scroll images left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => handleManualScroll("right")}
          className="p-2 rounded-full bg-ink/80 text-sand hover:text-gold border border-sand/30 backdrop-blur shadow-md focus-dark cursor-pointer"
          aria-label="Scroll images right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        className="w-full overflow-hidden motion-reduce:overflow-x-auto motion-reduce:scroll-smooth no-scrollbar"
      >
        <div
          className="reel-marquee-track flex w-max gap-5 py-2 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: duration }}
        >
          {reelItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              tabIndex={0}
              className={`relative shrink-0 rounded-lg overflow-hidden border border-sand/30 shadow-md bg-midnight group/item focus:outline-hidden focus:ring-2 focus:ring-gold ${aspectClass}`}
            >
              <Image
                src={item.url}
                alt={item.altText || item.caption || "Department image"}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 320px, 440px"
                className="object-cover"
                style={{
                  objectPosition: item.focalPoint
                    ? `${item.focalPoint.x}% ${item.focalPoint.y}%`
                    : "50% 50%",
                }}
              />

              {/* Caption Overlay (Shows on hover and focus) */}
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/95 via-ink/75 to-transparent text-white opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <p className="text-xs font-medium tracking-wide text-sand line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
