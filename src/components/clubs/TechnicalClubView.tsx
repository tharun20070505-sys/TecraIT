import Image from "next/image";
import { Club } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import { Reveal } from "@/components/common/Reveal";
import { StatusChip } from "@/components/common/StatusChip";
import { ImageReel } from "@/components/reels/ImageReel";
import {
  Eye,
  Target,
  Calendar,
  FileText,
} from "lucide-react";

import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";

interface TechnicalClubViewProps {
  club: Club;
}

export function TechnicalClubView({ club }: TechnicalClubViewProps) {
  return (
    <div className="space-y-20">
      {/* 1. Header and About the Club */}
      <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* About Text (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2">
              <StatusChip label="Technical Society" color="emerald" size="sm" />
              <span className="text-xs font-mono text-text-muted">
                Department of Information Technology, SRIET
              </span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text leading-tight">
              About {club.name}
            </h2>

            <Reveal animateOnMount><p className="text-base sm:text-lg text-text-muted leading-relaxed">{club.about}</p></Reveal>

            {/* Core Leads */}
            <div className="pt-2 border-t border-sand">
              <span className="text-xs font-mono text-emerald-text uppercase font-semibold block mb-2">
                Executive Student Coordinators
              </span>
              <Stagger className="flex flex-wrap gap-3">
                {club.members.map((m) => (
                  <div
                    key={m.id}
                    className="px-3.5 py-1.5 rounded-[3px] bg-white border border-sand text-xs flex items-center gap-2 shadow-xs"
                  >
                    <span className="font-bold text-text">{m.name}</span>
                    <span className="text-emerald-text font-medium">({m.role})</span>
                  </div>
                ))}
              </Stagger>
            </div>
          </div>

          {/* Club Logo Poster (4 cols) */}
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

      {/* 2. Vision and Mission Cards */}
      {(club.vision || club.mission) && (
        <section className="bg-white py-20 lg:py-24 border-y border-sand">
          <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {club.vision && (
                <div className="relative bg-white p-8 rounded-[3px] border border-sand shadow-xs space-y-4 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald" />
                  <div className="flex items-center gap-2 text-emerald-text font-semibold text-xs uppercase tracking-wider font-mono">
                    <Eye className="w-4 h-4 text-emerald" aria-hidden="true" />
                    <span>Strategic Vision</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-text">
                    Vision Statement
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {club.vision}
                  </p>
                </div>
              )}

              {club.mission && (
                <div className="relative bg-white p-8 rounded-[3px] border border-sand shadow-xs space-y-4 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-royal-blue" />
                  <div className="flex items-center gap-2 text-blue-text font-semibold text-xs uppercase tracking-wider font-mono">
                    <Target className="w-4 h-4 text-royal-blue" aria-hidden="true" />
                    <span>Operative Mission</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-text">
                    Mission Statement
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {club.mission}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. What We Do */}
      {club.whatWeDo && club.whatWeDo.length > 0 && (
        <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="INITIATIVES AND PRACTICE"
            eyebrowColor="emerald"
            title="What We Do"
            description="Core engineering practices and student training workshops organized on a continuous basis."
          />

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {club.whatWeDo.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[3px] bg-white border border-sand shadow-xs flex items-start gap-3.5 border-l-4 border-l-emerald"
              >
                <span className="font-mono text-xs font-bold text-emerald shrink-0 mt-0.5">
                  {idx + 1}.
                </span>
                <p className="text-sm text-text leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </Stagger>
        </section>
      )}

      {/* 4. Weekly Report (List of Weekly Entries) */}
      <section className="bg-mist py-20 lg:py-24 border-y border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="ACTIVITY LOG"
            eyebrowColor="emerald"
            title="Weekly Activity Reports"
            description="Chronological log of meetings, code sprints, technical workshops, and progress entries."
          />

          {club.weeklyReports && club.weeklyReports.length > 0 ? (
            <Stagger className="space-y-4" kind="rows">
              {club.weeklyReports.map((report) => (
                <div
                  key={report.id}
                  className="relative bg-white p-6 rounded-[3px] border border-sand shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-[2px] bg-emerald text-white text-xs font-mono font-bold uppercase tracking-wide">
                        Week {report.weekNumber}
                      </span>
                      <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                        <span>{report.date}</span>
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-text">
                      {report.title}
                    </h4>

                    <p className="text-sm text-text-muted leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {report.attachmentUrl && (
                    <div className="shrink-0 pt-2 sm:pt-0">
                      <a
                        href={report.attachmentUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-mist text-text border border-sand hover:border-gold hover:text-royal-blue text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald" aria-hidden="true" />
                        <span>View Attachment</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </Stagger>
          ) : (
            <div className="p-8 text-center text-sm text-text-muted bg-white rounded-[3px] border border-sand">
              No weekly reports filed yet for this session.
            </div>
          )}
        </div>
      </section>

      {/* 5. Club Members Leadership Roster */}
      <ClubMembersSection clubName={club.name} members={club.members} themeColor="emerald" />

      {/* 6. ImageReel of Club Images (hidden if no images) */}
      {club.images && club.images.length > 0 && (
        <section className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-6">
          <SectionHeading
            eyebrow="VISUAL RECORD"
            eyebrowColor="gold"
            title={`${club.name} Gallery and Sessions`}
            description="Photographs from member discussions, sprint sessions, and presentations."
          />

          <ImageReel images={club.images} aspectRatio="video" />
        </section>
      )}
    </div>
  );
}
