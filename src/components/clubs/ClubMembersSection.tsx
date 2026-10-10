import React from "react";
import Image from "next/image";
import { Users, Award, Shield } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import type { ClubMember } from "@/types";

interface ClubMembersSectionProps {
  clubName: string;
  members?: ClubMember[];
  themeColor?: "emerald" | "teal" | "gold";
}

const OFFICE_BEARER_ROLES = [
  "staff advisor",
  "faculty advisor",
  "president",
  "vice president",
  "secretary",
  "joint secretary",
  "treasurer",
  "coordinator",
  "lead coordinator",
  "executive coordinator",
];

export function ClubMembersSection({
  clubName,
  members = [],
  themeColor = "emerald",
}: ClubMembersSectionProps) {
  // If no members, hide the section completely
  if (!members || members.length === 0) {
    return null;
  }

  // 1. Separate Staff Advisor & Office Bearers from General Members
  const officeBearers: ClubMember[] = [];
  const otherMembers: ClubMember[] = [];

  for (const m of members) {
    const roleLower = (m.role || "").toLowerCase().trim();
    const isOfficeBearer = OFFICE_BEARER_ROLES.some((ob) => roleLower.includes(ob));
    if (isOfficeBearer) {
      officeBearers.push(m);
    } else {
      otherMembers.push(m);
    }
  }

  // 2. Group other members by batch
  const batchMap = new Map<string, ClubMember[]>();
  for (const m of otherMembers) {
    const b = m.batch?.trim() || "Members";
    if (!batchMap.has(b)) {
      batchMap.set(b, []);
    }
    batchMap.get(b)!.push(m);
  }

  const borderClass = {
    emerald: "border-t-4 border-t-emerald",
    teal: "border-t-4 border-t-teal",
    gold: "border-t-4 border-t-gold",
  }[themeColor];

  const badgeClass = {
    emerald: "bg-emerald/10 text-emerald-text border-emerald/30",
    teal: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    gold: "bg-gold/15 text-gold border-gold/30",
  }[themeColor];

  return (
    <section className="bg-white py-20 lg:py-24 border-y border-sand text-text">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="LEADERSHIP ROSTER"
          eyebrowColor={themeColor === "teal" ? "teal" : themeColor === "gold" ? "gold" : "emerald"}
          title={`${clubName} Leadership and Coordinators`}
          description="Faculty advisors, office bearers, and active student members driving continuous technical practice and events."
        />

        {/* 1. Office Bearers and Staff Advisors First */}
        {officeBearers.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" aria-hidden="true" />
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-text-muted">
                Advisors and Office Bearers
              </h3>
            </div>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {officeBearers.map((member) => (
                <div
                  key={member.id}
                  className={`relative bg-mist rounded-[3px] border border-sand p-6 shadow-xs flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-shadow ${borderClass}`}
                >
                  {/* Photo or Avatar */}
                  <div className="relative w-20 h-20 rounded-[3px] bg-white border border-sand overflow-hidden mb-4 flex items-center justify-center shrink-0">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-text-muted" aria-hidden="true" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border inline-block ${badgeClass}`}
                    >
                      {member.role}
                    </span>
                    <h4 className="font-heading font-bold text-base text-text pt-1">
                      {member.name}
                    </h4>
                    {member.batch && (
                      <p className="text-xs text-text-muted font-mono">{member.batch}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-sand w-full text-xs text-text-muted flex items-center justify-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
                    <span>Executive Coordinator</span>
                  </div>
                </div>
              ))}
            </Stagger>
          </div>
        )}

        {/* 2. Remaining Members Grouped by Batch */}
        {Array.from(batchMap.entries()).map(([batchName, batchMembers]) => (
          <div key={batchName} className="space-y-5 pt-4">
            <div className="flex items-center gap-2 border-b border-sand pb-2">
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-text-muted">
                {batchName}
              </span>
              <span className="text-xs text-text-muted">
                ({batchMembers.length} active coordinators)
              </span>
            </div>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {batchMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative bg-white rounded-[3px] border border-sand p-5 shadow-xs flex flex-col items-center text-center overflow-hidden hover:border-gold/50 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-[3px] bg-mist border border-sand overflow-hidden mb-3 flex items-center justify-center shrink-0">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-text-muted" aria-hidden="true" />
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-text-muted uppercase">
                    {member.role}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-text mt-0.5">
                    {member.name}
                  </h4>
                </div>
              ))}
            </Stagger>
          </div>
        ))}
      </div>
    </section>
  );
}
