"use client";

import { Reveal } from "@/components/common/Reveal";
import { motionTokens } from "@/lib/motion";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { GalleryItem } from "@/types";
import { StatusChip } from "@/components/common/StatusChip";
import { EmptyState } from "@/components/common/EmptyState";
import { galleryCategories } from "@/data/gallery";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

interface GalleryGridClientProps {
  items: GalleryItem[];
}

export function GalleryGridClient({ items }: GalleryGridClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "ALL") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(8);
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;

      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      }
    };

    if (activeLightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, filteredItems.length]);

  const activeItem =
    activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <div className="space-y-10">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-sand pb-6">
        {galleryCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              selectedCategory === cat
                ? "bg-midnight text-gold border border-gold/40 shadow-xs"
                : "bg-white text-text-muted hover:text-text border border-sand hover:bg-mist"
            }`}
          >
            {cat === "ALL" ? "All Photos" : cat}
          </button>
        ))}
      </div>

      {/* Grid of Gallery Items */}
      {displayedItems.length > 0 ? (
        <Reveal key={selectedCategory} effect="fade" duration={motionTokens.durationFilter} observe={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className="group relative bg-white rounded-xl border border-sand shadow-xs overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              {/* 3px Top Border in Gold */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold rounded-t-xl z-10" />

              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand/30">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />

                {/* Hover Maximize Overlay */}
                <div className="absolute inset-0 bg-ink/20 flex items-center justify-center">
                  <div className="p-2.5 rounded-full bg-midnight/90 text-gold border border-gold/40 backdrop-blur shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <StatusChip label={item.category} color="gold" size="sm" />
                </div>
              </div>

              <div className="p-4 space-y-1.5 bg-white">
                <h4 className="font-heading font-bold text-sm text-text line-clamp-1">
                  {item.title}
                </h4>
                {item.caption && (
                  <Reveal effect="fade" delay={motionTokens.captionDelay}>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {item.caption}
                    </p>
                  </Reveal>
                )}
                <div className="pt-2 border-t border-sand/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-text-muted" /> {item.date}
                  </span>
                  <span className="text-blue-text font-semibold">
                    Enlarge
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      ) : (
        <EmptyState
          icon={<ImageIcon className="w-6 h-6 text-gold" />}
          title="No Images in Category"
          message="No gallery images have been published for this category yet. Please check other categories."
          actionText="Show All Photos"
          onAction={() => handleCategoryChange("ALL")}
        />
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="px-6 py-3 rounded-lg bg-royal-blue text-white text-xs sm:text-sm font-semibold hover:bg-royal-blue/90 shadow-md transition-colors focus-visible:outline-2"
          >
            Load More Photos ({filteredItems.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-midnight text-sand hover:text-white border border-sand/30 backdrop-blur transition-colors"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() =>
              setActiveLightboxIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-midnight/80 text-sand hover:text-white border border-sand/30 backdrop-blur transition-colors hidden sm:block"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveLightboxIndex((prev) =>
                prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-midnight/80 text-sand hover:text-white border border-sand/30 backdrop-blur transition-colors hidden sm:block"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Modal Card */}
          <div className="relative w-full max-w-4xl bg-midnight rounded-2xl border border-sand/30 shadow-2xl overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-ink">
              <Image
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="p-6 bg-ink border-t border-sand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusChip label={activeItem.category} color="gold" size="sm" />
                  <span className="text-xs text-sand/60 font-mono">
                    {activeItem.date}
                  </span>
                </div>
                <h3 id="lightbox-title" className="font-heading font-bold text-base sm:text-lg text-white">
                  {activeItem.title}
                </h3>
                {activeItem.caption && (
                  <p className="text-xs text-sand/80 max-w-2xl">
                    {activeItem.caption}
                  </p>
                )}
              </div>

              <div className="text-xs font-mono text-sand/60 shrink-0">
                Photo {(activeLightboxIndex ?? 0) + 1} of {filteredItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
