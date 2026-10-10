import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import {
  Users,
  GraduationCap,
  Trophy,
  Briefcase,
  Compass,
} from "lucide-react";

import { getAssociationLogoConfig } from "@/lib/db-data";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Student Life",
  description:
    "Explore student life at the Department of Information Technology, SRIET: IT Association, alumni network, student achievements, placement training, and campus activities.",
};

const studentLifeCards = [
  {
    title: "IT Association",
    href: "/student-life/it-association",
    eyebrow: "Leadership and Governance",
    borderColor: "bg-teal",
    textColor: "text-teal-text",
    icon: Users,
    description:
      "The official student governing body coordinating technical symposia, guest lectures, hackathons, and departmental initiatives.",
    actionText: "Explore IT Association",
  },
  {
    title: "Alumni Network",
    href: "/alumni",
    eyebrow: "Global Network",
    borderColor: "bg-[#1E1B4B]",
    textColor: "text-[#1E1B4B]",
    icon: GraduationCap,
    description:
      "Connect with graduates working in technology corporations, academic studies, and enterprises worldwide.",
    actionText: "View Alumni and Directories",
  },
  {
    title: "Achievements and Laurels",
    href: "/achievements",
    eyebrow: "Competitive Honors",
    borderColor: "bg-gold",
    textColor: "text-gold-text",
    icon: Trophy,
    description:
      "Recognizing laurels won by students and faculty in hackathons, research publications, and coding leagues.",
    actionText: "View Laurels Grid",
  },
  {
    title: "Career and Placements",
    href: "/placements",
    eyebrow: "Industry Readiness",
    borderColor: "bg-royal-blue",
    textColor: "text-blue-text",
    icon: Briefcase,
    description:
      "Structured training programs in software engineering, algorithmic aptitude, mock interviews, and campus recruitment.",
    actionText: "Explore Placement Records",
  },
  {
    title: "Campus Life and Culture",
    href: "/campus-life",
    eyebrow: "Holistic Development",
    borderColor: "bg-emerald",
    textColor: "text-emerald-text",
    icon: Compass,
    description:
      "Explore computing laboratories, creative arts, collegiate sports championships, industrial field visits, and department gatherings.",
    actionText: "Discover Campus Life",
  },
];

export default async function StudentLifePage() {
  const logoConfig = await getAssociationLogoConfig();

  return (
    <div className="w-full bg-ivory text-text">
      {/* Page Banner */}
      <PageBanner
        title="Student Life"
        eyebrow="COMMUNITY AND OPPORTUNITIES"
        breadcrumbs={[{ label: "Student Life" }]}
        description="An active ecosystem of leadership, academic competitions, peer collaboration, career acceleration, and collegiate life."
      />

      {/* 5 Primary Opportunity Cards */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Student Horizons"
          eyebrowColor="teal"
          title="Student Pathways and Communities"
          description="Select any domain below to explore specialized initiatives, batch records, student achievements, and campus facilities."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studentLifeCards.map((card, idx) => {
            const Icon = card.icon;
            const isAssoc = card.title === "IT Association";

            return (
              <div
                key={card.title}
                className="relative bg-white rounded-[3px] border border-sand p-8 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Card Border in Section Color */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${card.borderColor}`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {isAssoc && logoConfig.logoLight ? (
                      <div className="relative w-12 h-12 rounded-[2px] bg-mist border border-sand p-1.5 flex items-center justify-center">
                        <Image
                          src={logoConfig.logoLight}
                          alt={logoConfig.alt}
                          width={38}
                          height={38}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-[2px] bg-mist border border-sand flex items-center justify-center text-royal-blue">
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                    )}
                    <span className="text-[13px] font-semibold text-text-muted uppercase">
                      Track {idx + 1}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[12px] font-semibold uppercase tracking-wider block ${card.textColor}`}>
                      {card.eyebrow}
                    </span>
                    <h2 className="font-heading font-bold text-xl text-text mt-1">
                      {card.title}
                    </h2>
                    <p className="mt-2 text-[15px] sm:text-[16px] text-text-muted leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-sand/60">
                  <Link
                    href={card.href}
                    className="text-[14px] font-semibold text-royal-blue hover:text-gold transition-colors inline-block"
                  >
                    {card.actionText}
                  </Link>
                </div>
              </div>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}
