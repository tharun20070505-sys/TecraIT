import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { Stagger } from "@/components/common/Stagger";
import { RevealText } from "@/components/common/RevealText";
import { StatusChip } from "@/components/common/StatusChip";
import { LogoReel } from "@/components/reels/LogoReel";
import { getClubs, getLogoReelData } from "@/lib/db-data";
import { Code, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Department Clubs and Societies - Department of Information Technology",
  description:
    "Explore the technical and non-technical student clubs of the Department of Information Technology at SRIET: TechNexus, Aesthetic AI Club, Fine and Arts Club, and Media Club.",
};

export default async function ClubsOverviewPage() {
  const [clubs, reelData] = await Promise.all([
    getClubs(),
    getLogoReelData(),
  ]);
  const technicalClubs = clubs.filter((c) => c.type === "technical");
  const nonTechnicalClubs = clubs.filter((c) => c.type === "non-technical");

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Student Clubs and Societies"
        eyebrow="TECRA CHAPTERS AND GUILDS"
        breadcrumbs={[{ label: "Clubs" }]}
        description="Fostering technical mastery, algorithmic problem solving, design thinking, and creative digital media through dedicated student societies."
      />

      {/* 2. About Clubs Narrative */}
      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
          <div className="max-w-4xl space-y-4">
            <SectionHeading
              eyebrow="STUDENT SOCIETIES"
              eyebrowColor="emerald"
              title="About Department Clubs"
            />
            <Reveal>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                Student clubs form the energetic core of the Information Technology department at SRIET. Divided into rigorous technical societies and multidisciplinary creative guilds, these chapters provide structured weekly programming, hackathons, peer code reviews, art showcases, and multimedia productions throughout the academic year.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Group 1: Technical Clubs */}
      <section className="py-20 lg:py-24 bg-mist border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusChip label="Technical Guilds" color="emerald" size="sm" icon={<Code className="w-3.5 h-3.5" aria-hidden="true" />} />
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text">
                <RevealText mode="words">Technical Clubs</RevealText>
              </h2>
            </div>
            <p className="text-sm text-text-muted max-w-md">
              Focusing on software development, competitive programming, AI research, and applied computer vision.
            </p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalClubs.map((club) => (
              <div
                key={club.id}
                className="relative bg-white rounded-[3px] border border-sand p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Card Border in Emerald */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="relative w-14 h-14 rounded-[3px] bg-midnight p-2 border border-sand/30 flex items-center justify-center">
                      <Image
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <StatusChip label="Technical" color="emerald" size="sm" />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-text">
                      {club.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                      {club.shortDescription}
                    </p>
                  </div>

                  {club.whatWeDo && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-mono text-emerald-text uppercase font-semibold block">
                        Focus Areas:
                      </span>
                      <div className="space-y-1 border-l-2 border-emerald/30 pl-3">
                        {club.whatWeDo.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-text-muted line-clamp-1">{item}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-sand">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-[3px] bg-emerald text-white text-xs font-semibold hover:bg-emerald/90 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    Explore Club
                  </Link>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 4. Group 2: Non-Technical Clubs */}
      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusChip label="Creative Chapters" color="teal" size="sm" icon={<Palette className="w-3.5 h-3.5" aria-hidden="true" />} />
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text">
                <RevealText mode="words">Non-Technical and Creative Clubs</RevealText>
              </h2>
            </div>
            <p className="text-sm text-text-muted max-w-md">
              Championing fine arts, design aesthetics, event cinematography, photography, and digital publications.
            </p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {nonTechnicalClubs.map((club) => (
              <div
                key={club.id}
                className="relative bg-white rounded-[3px] border border-sand p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Card Border in Teal */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-teal" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="relative w-14 h-14 rounded-[3px] bg-midnight p-2 border border-sand/30 flex items-center justify-center">
                      <Image
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <StatusChip label="Creative" color="teal" size="sm" />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-text">
                      {club.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                      {club.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-text-muted flex items-center gap-2">
                    <span className="font-semibold text-text">Active Members:</span>
                    <span>{club.members.length} Core Coordinators</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-sand">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-[3px] bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    Explore Club
                  </Link>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 5. LogoReel of Club Logos */}
      <section className="py-20 lg:py-24 bg-mist">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="SOCIETY BADGES"
            eyebrowColor="emerald"
            title="Club Logos and Emblems"
          />

          <LogoReel logos={reelData.items} settings={reelData.settings} />
        </div>
      </section>
    </div>
  );
}

