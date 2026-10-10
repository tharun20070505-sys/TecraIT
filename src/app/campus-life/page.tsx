import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import { StatusChip } from "@/components/common/StatusChip";
import { ImageReel } from "@/components/reels/ImageReel";
import { campusLifeEntries, campusLifeReelImages } from "@/data/campus";

export const metadata: Metadata = {
  title: "Campus Life - Department of Information Technology",
  description:
    "Experience campus life at the Department of Information Technology at SRIET: computing facilities, industrial visits, cultural activities, and sports.",
};

export default function CampusLifePage() {
  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Campus Life and Facilities"
        eyebrow="TECRA STUDENT EXPERIENCE"
        breadcrumbs={[
          { label: "Student Life", href: "/student-life" },
          { label: "Campus Life" },
        ]}
        description="A vibrant environment fostering technical rigor, collaborative innovation, cultural creativity, and collegiate sportsmanship."
      />

      {/* 2. Alternating Image-and-Text Sections */}
      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-16">
          <SectionHeading
            eyebrow="CAMPUS ENVIRONMENT"
            eyebrowColor="emerald"
            title="Spaces, Activities and Explorations"
            description="Explore our specialized computing facilities, industrial exposure initiatives, and collegiate student community."
          />

          <Stagger className="space-y-16">
            {campusLifeEntries.map((entry, idx) => {
              const isReversed = idx % 2 === 1;

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Text Content (6 cols) */}
                  <div
                    className={`lg:col-span-6 space-y-4 ${
                      isReversed ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <StatusChip label={entry.category} color="emerald" size="sm" />
                      <span className="text-xs font-mono text-text-muted">
                        Experience {idx + 1}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-2xl sm:text-3xl text-text leading-tight">
                      {entry.title}
                    </h3>

                    <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                      {entry.description}
                    </p>

                    <div className="pt-2 border-l-2 border-emerald pl-3 text-xs font-semibold text-emerald-text">
                      Active Student Opportunity
                    </div>
                  </div>

                  {/* Image Visual (6 cols) */}
                  <div
                    className={`lg:col-span-6 ${
                      isReversed ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative rounded-[3px] overflow-hidden border border-sand shadow-sm bg-midnight group">
                      {/* 4px Top Accent in Emerald */}
                      <div className="absolute top-0 left-0 right-0 h-[4px] bg-emerald z-10" />
                      <div className="relative aspect-[16/10] w-full">
                        <Image
                          src={entry.imageUrl}
                          alt={entry.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 3. Campus Life Reel Section */}
      <section className="py-20 lg:py-24 bg-mist">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <SectionHeading
            eyebrow="VISUAL CHRONICLE"
            eyebrowColor="gold"
            title="Campus Moments and Laboratory Vignettes"
            description="Snapshots from everyday student collaborations, symposium gatherings, and laboratory sessions."
          />

          <ImageReel images={campusLifeReelImages} aspectRatio="video" />
        </div>
      </section>
    </div>
  );
}

