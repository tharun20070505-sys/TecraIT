import Image from "next/image";
import Link from "next/link";
import { Club } from "@/types";
import { clubsData } from "@/data/clubs";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusChip } from "@/components/common/StatusChip";
import { LogoReel, type LogoItem, type LogoReelSettingsProps } from "@/components/reels/LogoReel";
import { Stagger } from "@/components/common/Stagger";

interface ClubsHomeSectionProps {
  clubs: Club[];
  reelLogos?: LogoItem[];
  reelSettings?: LogoReelSettingsProps;
}

export function ClubsHomeSection({
  clubs,
  reelLogos,
  reelSettings,
}: ClubsHomeSectionProps) {
  const fallbackLogos = clubs.map((c) => ({
    id: c.id,
    name: c.name,
    logoUrl: c.logoUrl,
    badge: c.type,
    href: `/clubs/${c.slug}`,
  }));

  const configuredLogos = reelLogos?.length ? reelLogos : fallbackLogos;
  const techNexus = clubsData.find((club) => club.slug === "technexus");
  const isTechNexus = (item: LogoItem) =>
    item.href?.replace(/\/$/, "").endsWith("/clubs/technexus") ||
    item.name.replace(/[^a-z]/gi, "").toLowerCase().startsWith("technexus");
  const activeReelLogos = techNexus
    ? [
        {
          id: "technexus-logo",
          name: techNexus.name,
          logoUrl: techNexus.logoUrl,
          href: "/clubs/technexus",
          transparent: true,
        },
        ...configuredLogos.filter((item) => !isTechNexus(item)),
      ]
    : configuredLogos;

  return (
    <section className="py-20 lg:py-24 bg-mint-wash border-y border-sand text-text" aria-labelledby="clubs-heading">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Student Engineering Societies"
            eyebrowColor="emerald"
            title="Active Student Clubs and Chapters"
            description="Explore our specialized technical societies and creative organizations designed to advance practical skills, peer collaboration, and campus community."
          />
          <Link
            href="/clubs"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[3px] bg-emerald-deep text-white text-[14px] font-semibold hover:bg-emerald-text transition-colors shadow-xs shrink-0"
          >
            View All Clubs
          </Link>
        </div>

        {/* 4 Club Cards: Editorial white card, 1px sand border, 4px emerald top bar, square corners */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clubs.map((club) => {
            return (
              <div
                key={club.id}
                className="relative bg-white p-6 rounded-[3px] border border-sand flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Bar in Emerald */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`relative rounded-[2px] p-2 flex items-center justify-center ${club.slug === "technexus" ? "w-28 h-12" : "w-12 h-12 bg-mist border border-sand/30"}`}>
                      <Image
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        width={club.slug === "technexus" ? 96 : 36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <StatusChip
                      label={club.type}
                      color={club.type === "technical" ? "emerald" : "teal"}
                      size="sm"
                    />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-[18px] text-text hover:text-emerald-text transition-colors">
                      {club.name}
                    </h3>
                    <p className="mt-2 text-[14px] text-text-muted leading-relaxed line-clamp-3">
                      {club.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-sand/60">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="text-[14px] font-semibold text-emerald-text hover:text-gold transition-colors inline-block"
                  >
                    Explore Club
                  </Link>
                </div>
              </div>
            );
          })}
        </Stagger>

        {/* Club Logo Reel */}
        <div className="pt-4 border-t border-sand">
          <div className="text-[12px] uppercase tracking-widest text-text-muted mb-2 text-left font-semibold">
            Society Logos and Chapter Affiliations
          </div>
          <LogoReel logos={activeReelLogos} settings={reelSettings} />
        </div>
      </div>
    </section>
  );
}
