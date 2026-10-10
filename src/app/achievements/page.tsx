import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { AchievementsGridClient } from "@/components/achievements/AchievementsGridClient";
import { achievementsData } from "@/data/achievements";

export const metadata: Metadata = {
  title: "Department Achievements",
  description:
    "Student, faculty, and departmental awards, competitive hackathon laurels, and academic honors won by the Department of Information Technology at SRIET.",
};

export default function AchievementsPage() {
  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Department Achievements"
        eyebrow="COMPETITIVE LAURELS"
        breadcrumbs={[
          { label: "Student Life", href: "/student-life" },
          { label: "Achievements" },
        ]}
        description="Recognizing outstanding laurels won by students and faculty in national competitions, hackathons, and scholarly endeavors."
      />

      {/* 2. Achievements Directory */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Hall of Laurels"
          eyebrowColor="gold"
          title="Honors, Prizes and Trophies"
          description="Browse competitive accolades across student project competitions, paper publications, and collegiate championships."
        />

        <AchievementsGridClient achievements={achievementsData} />
      </section>
    </div>
  );
}
