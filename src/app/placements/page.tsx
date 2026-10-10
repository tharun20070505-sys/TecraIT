import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { Stagger } from "@/components/common/Stagger";
import { CardSlider } from "@/components/reels/CardSlider";
import { PlacementBatchTabs } from "@/components/placements/PlacementBatchTabs";
import { placementData } from "@/data/placements";
import { getPlacementBatches } from "@/lib/db-data";
import { BookOpen, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Career and Placements - Department of Information Technology",
  description:
    "Placement training framework, career preparation, batch recruitment records, and placed students of the Department of Information Technology at SRIET.",
};

export default async function PlacementsPage() {
  const dbBatches = await getPlacementBatches();
  const batches = dbBatches && dbBatches.length > 0 ? dbBatches : placementData.batches;

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Career and Placements"
        eyebrow="TECRA INDUSTRY PATHWAYS"
        breadcrumbs={[
          { label: "Student Life", href: "/student-life" },
          { label: "Placements" },
        ]}
        description="Structured multi-year career training, algorithmic interview preparation, and corporate recruitment records."
      />

      {/* 2. Placement Training Framework */}
      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
          <div className="max-w-4xl space-y-4">
            <SectionHeading
              eyebrow="CAREER ACCELERATION"
              eyebrowColor="royal-blue"
              title="Comprehensive Placement Training Framework"
            />
            <Reveal animateOnMount>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                {placementData.trainingAbout}
              </p>
            </Reveal>
          </div>

          {/* Training Programme Cards */}
          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {placementData.trainingPrograms.map((prog, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-[3px] border border-sand p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Bar in Royal Blue */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-royal-blue" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-text bg-mist px-2.5 py-1 rounded-[2px] border border-sand">
                      Phase {idx + 1}
                    </span>
                    <BookOpen className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  </div>

                  <h3 className="font-heading font-bold text-lg text-text">
                    {prog.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="pt-2 border-l-2 border-royal-blue/30 pl-3 text-xs text-text-muted">
                    Target: {prog.targetYear}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-sand text-xs font-mono text-text-muted">
                  Department Curriculum Program
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 3. Batch-wise Placement Details (Tabs by Batch) */}
      <section className="py-20 lg:py-24 bg-mist border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <SectionHeading
            eyebrow="ANNUAL STATISTICS"
            eyebrowColor="royal-blue"
            title="Batch-Wise Placement Summary"
            description="Official placement reports verified by the institutional training and placement cell."
          />

          <PlacementBatchTabs batches={batches} />
        </div>
      </section>

      {/* 4. Placed Students (CardSlider) */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <SectionHeading
            eyebrow="RECRUITMENT SUCCESS"
            eyebrowColor="gold"
            title="Placed Students and Recruited Graduates"
            description="Graduates who have secured roles across enterprise technology and software firms."
          />

          <CardSlider
            cards={placementData.placedStudents.map((student) => (
              <Reveal key={student.id} className="h-full">
              <div className="relative bg-white rounded-[3px] border border-sand p-6 shadow-xs h-full flex flex-col justify-between overflow-hidden">
                {/* 4px Top Bar in Gold */}
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gold" />

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-[3px] overflow-hidden border border-sand bg-mist shrink-0">
                      <Image
                        src={student.photoUrl}
                        alt={student.name}
                        fill
                        sizes="64px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-text">
                        {student.name}
                      </h4>
                      <p className="text-xs text-text-muted">
                        Batch: {student.batch}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-sand">
                    <div className="flex items-center gap-2 text-xs text-text">
                      <Building2 className="w-3.5 h-3.5 text-royal-blue shrink-0" aria-hidden="true" />
                      <span className="font-semibold">{student.company}</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      Role: {student.role}
                    </div>
                    <div className="text-xs font-mono font-bold text-gold-text pt-1">
                      Package: {student.lpa}
                    </div>
                  </div>
                </div>
              </div>
              </Reveal>
            ))}
          />
        </div>
      </section>
    </div>
  );
}

