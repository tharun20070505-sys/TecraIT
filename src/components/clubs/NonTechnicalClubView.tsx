import Image from "next/image";
import { Club } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { StatusChip } from "@/components/common/StatusChip";
import { ImageReel } from "@/components/reels/ImageReel";
import { Palette } from "lucide-react";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";

interface NonTechnicalClubViewProps {
  club: Club;
}

export function NonTechnicalClubView({ club }: NonTechnicalClubViewProps) {
  return (
    <div className="space-y-20">
      {/* 1. Header and About Section */}
      <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2">
              <StatusChip label="Non-Technical Club" color="teal" size="sm" icon={<Palette className="w-3.5 h-3.5" aria-hidden="true" />} />
              <span className="text-xs font-mono text-text-muted">
                Department of Information Technology, SRIET
              </span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text leading-tight">
              About {club.name}
            </h2>

            <Reveal animateOnMount><p className="text-base sm:text-lg text-text-muted leading-relaxed">{club.about}</p></Reveal>

            <div className="pt-2 flex flex-wrap gap-3">
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand text-xs font-medium text-text">
                Creative Arts and Design Expression
              </span>
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand text-xs font-medium text-text">
                Annual Exhibitions and Stage Showcases
              </span>
            </div>
          </div>

          {/* Large Logo Poster */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[3px] bg-midnight border-2 border-gold/40 shadow-md p-8 flex items-center justify-center">
              <Image
                src={club.logoUrl}
                alt={`${club.name} Official Logo`}
                width={160}
                height={160}
                className="object-contain"
                priority
              />
              <div className="absolute -bottom-3 px-3 py-1 bg-deep-navy text-gold text-[10px] font-mono uppercase tracking-widest rounded-[2px] border border-gold/40">
                Official Emblem
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Club Members (Office Bearers first, then by batch) */}
      <ClubMembersSection clubName={club.name} members={club.members} themeColor="teal" />

      {/* 3. ImageReel (Hidden if no images) */}
      {club.images && club.images.length > 0 && (
        <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-6">
          <SectionHeading
            eyebrow="CREATIVE SHOWCASE"
            eyebrowColor="gold"
            title={`${club.name} Showcase Gallery`}
            description="Visual highlights from artwork exhibits, workshops, and installations."
          />

          <ImageReel images={club.images} aspectRatio="video" />
        </section>
      )}
    </div>
  );
}
