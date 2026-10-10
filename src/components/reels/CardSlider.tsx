"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

interface CardSliderProps {
  cards?: React.ReactNode[];
  children?: React.ReactNode;
  emptyMessage?: string;
  theme?: "light" | "dark";
  className?: string;
}

export function CardSlider({
  cards,
  children,
  emptyMessage = "No items available to display.",
  theme = "light",
  className,
}: CardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive card items array
  const cardList: React.ReactNode[] = cards || React.Children.toArray(children);
  const total = cardList.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? Math.max(0, total - 1) : prev - 1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSlide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!cardList || cardList.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-6 h-6" />}
        title="Records"
        message={emptyMessage}
        theme={theme}
      />
    );
  }

  // Handle Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-4 select-none focus:outline-none ${className || ""}`}
      tabIndex={0}
      aria-label="Interactive Card Slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cards Viewport */}
      <div className="overflow-hidden w-full">
        <div
          className="flex gap-5 sm:gap-6"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {cardList.map((card, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
            >
              {card}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls: Arrows and Dots */}
      <div className="mt-8 flex items-center justify-between px-1">
        {/* Dots */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Slider navigation dots">
          {cardList.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-selected={currentIndex === dotIdx}
              aria-label={`Go to slide ${dotIdx + 1}`}
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-2 rounded-full ${
                currentIndex === dotIdx
                  ? "w-7 bg-royal-blue"
                  : "w-2 bg-sand hover:bg-gold"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-2 rounded-full border border-sand bg-white text-text hover:text-royal-blue hover:border-royal-blue shadow-xs transition-colors focus-visible:outline-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-2 rounded-full border border-sand bg-white text-text hover:text-royal-blue hover:border-royal-blue shadow-xs transition-colors focus-visible:outline-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
