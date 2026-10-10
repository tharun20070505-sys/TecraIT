"use client";

import { Reveal } from "@/components/common/Reveal";
import { motionTokens } from "@/lib/motion";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { AchievementItem } from "@/types";
import { StatusChip } from "@/components/common/StatusChip";
import { EmptyState } from "@/components/common/EmptyState";
import { Trophy, Calendar, Award, X, ArrowRight } from "lucide-react";

interface AchievementsGridClientProps {
  achievements: AchievementItem[];
}

export function AchievementsGridClient({ achievements }: AchievementsGridClientProps) {
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [activeModalItem, setActiveModalItem] = useState<AchievementItem | null>(null);

  // Extract unique years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(achievements.map((a) => a.year)));
    return ["ALL", ...years.sort().reverse()];
  }, [achievements]);

  // Filtered achievements
  const filtered = useMemo(() => {
    if (selectedYear === "ALL") return achievements;
    return achievements.filter((a) => a.year === selectedYear);
  }, [achievements, selectedYear]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalItem(null);
      }
    };
    if (activeModalItem) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalItem]);

  return (
    <div className="space-y-8">
      {/* Year Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-sand shadow-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text">
            Filter Achievements by Year:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                selectedYear === yr
                  ? "bg-midnight text-gold border border-gold/40 shadow-xs"
                  : "bg-mist text-text-muted hover:text-text border border-sand hover:bg-white"
              }`}
            >
              {yr === "ALL" ? "All Laurels" : yr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      {filtered.length > 0 ? (
        <Reveal key={selectedYear} effect="fade" duration={motionTokens.durationFilter} observe={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-xl border border-sand shadow-xs flex flex-col justify-between overflow-hidden group"
            >
              {/* 3px Top Card Border in Gold */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold rounded-t-xl" />

              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand/30">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusChip label={item.category} color="gold" size="sm" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-gold-text font-semibold">
                    <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{item.prizePosition}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-text line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs font-medium text-text-muted">
                    {item.eventName}
                  </p>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {item.details}
                  </p>
                </div>
              </div>

              {/* Action Button: Opens Detail Modal */}
              <div className="p-6 pt-0 border-t border-sand/60 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-text-muted" /> {item.date}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveModalItem(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-royal-blue hover:text-gold transition-colors focus-visible:outline-2"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      ) : (
        <EmptyState
          icon={<Trophy className="w-6 h-6 text-gold" />}
          title="No Achievements for Selected Year"
          message="No records found matching this year filter. Select another year or reset filters."
          actionText="Show All Laurels"
          onAction={() => setSelectedYear("ALL")}
        />
      )}

      {/* Detail Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-sand shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="relative aspect-[16/9] w-full bg-midnight">
              <Image
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-ink/80 text-sand hover:text-white border border-sand/30 backdrop-blur transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <StatusChip label={activeModalItem.category} color="gold" size="sm" />
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-gold-text font-bold">
                <Award className="w-4 h-4 text-gold" aria-hidden="true" />
                <span>{activeModalItem.prizePosition}, {activeModalItem.date}</span>
              </div>

              <h2 id="modal-title" className="font-heading font-extrabold text-xl sm:text-2xl text-text">
                {activeModalItem.title}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-blue-text">
                Event: {activeModalItem.eventName} (Year: {activeModalItem.year})
              </p>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed pt-2 border-t border-sand">
                {activeModalItem.details}
              </p>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-5 py-2.5 rounded-lg bg-midnight text-sand hover:text-white text-xs font-semibold transition-colors"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
