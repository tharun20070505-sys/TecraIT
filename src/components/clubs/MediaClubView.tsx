"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Club } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { StatusChip } from "@/components/common/StatusChip";
import { ImageReel } from "@/components/reels/ImageReel";
import { Video, Play, X } from "lucide-react";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";

interface MediaClubViewProps {
  club: Club;
}

export function MediaClubView({ club }: MediaClubViewProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Close video modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoModalOpen(false);
      }
    };
    if (isVideoModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVideoModalOpen]);

  return (
    <div className="space-y-20">
      {/* 1. About on LEFT and Video Poster on RIGHT */}
      <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* About Media Club Text on the LEFT (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <StatusChip label="Digital Media and Production" color="teal" size="sm" icon={<Video className="w-3.5 h-3.5" aria-hidden="true" />} />
              <span className="text-xs font-mono text-text-muted">
                Department of Information Technology, SRIET
              </span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text leading-tight">
              About {club.name}
            </h2>

            <Reveal animateOnMount><p className="text-base sm:text-lg text-text-muted leading-relaxed">{club.about}</p></Reveal>

            <div className="pt-2 flex flex-wrap gap-3 text-xs font-mono text-[#0B5F66]">
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand">
                Event Cinematography and Coverage
              </span>
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand">
                Audio-Visual Productions and Podcasts
              </span>
            </div>
          </div>

          {/* Video Poster on the RIGHT (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[16/10] rounded-[3px] overflow-hidden border border-sand shadow-md bg-midnight group">
              <Image
                src={club.videoPoster || "/images/clubs/club-placeholder.png"}
                alt="Media Club Showcase Video Poster"
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover"
              />

              {/* Dark Overlay with Play Icon */}
              <div className="absolute inset-0 bg-ink/40 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-16 h-16 rounded-[3px] bg-midnight/90 text-gold border border-gold/60 flex items-center justify-center shadow-lg"
                  aria-label="Play Media Club reel video"
                >
                  <Play className="w-6 h-6 ml-0.5 fill-gold text-gold" aria-hidden="true" />
                </button>
                <span className="text-xs font-semibold text-white tracking-wider uppercase font-mono bg-ink/70 px-3 py-1 rounded-[2px] border border-sand/20">
                  Watch Production Reel
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Video Modal (Never Autoplay, Lazy-loaded) */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <div className="relative w-full max-w-4xl bg-midnight rounded-[3px] border border-sand/30 shadow-2xl overflow-hidden">
            {/* Modal Bar */}
            <div className="px-5 py-3 border-b border-sand/20 flex items-center justify-between bg-ink">
              <span id="video-modal-title" className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                <Video className="w-4 h-4 text-gold" aria-hidden="true" />
                {club.name}: Featured Media Reel
              </span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-[2px] text-sand hover:text-white hover:bg-midnight transition-colors"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video w-full bg-black">
              {club.videoUrl?.includes("youtube.com") || club.videoUrl?.includes("youtu.be") ? (
                <iframe
                  src={club.videoUrl}
                  title={`${club.name} Featured Video`}
                  className="w-full h-full border-0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={club.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={club.videoPoster}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Club Members (Office Bearers first, then by batch) */}
      <ClubMembersSection clubName={club.name} members={club.members} themeColor="teal" />

      {/* 4. ImageReel (Hidden if no images) */}
      {club.images && club.images.length > 0 && (
        <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-6">
          <SectionHeading
            eyebrow="MEDIA SHOWCASE"
            eyebrowColor="gold"
            title={`${club.name} Production Archive`}
            description="Visual gallery covering photojournalism, coverage reels, and post-production artifacts."
          />

          <ImageReel images={club.images} aspectRatio="video" />
        </section>
      )}
    </div>
  );
}
