import { CareerPath } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import { Briefcase } from "lucide-react";

interface CareerOpportunitiesSectionProps {
  careers: CareerPath[];
}

export function CareerOpportunitiesSection({ careers }: CareerOpportunitiesSectionProps) {
  return (
    <section className="py-20 lg:py-24 bg-ivory text-text border-b border-sand/30" aria-labelledby="career-paths">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Industry Pathways"
          eyebrowColor="royal-blue"
          title="Career Opportunities and Trajectories"
          description="Graduates in Information Technology are equipped with computational foundations, qualifying them for technical roles across software engineering, analytics, security, and academic research."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {careers.map((career) => (
            <div
              key={career.id}
              className="relative bg-white p-7 rounded-[3px] border border-sand flex flex-col justify-between overflow-hidden"
            >
              {/* 4px Top Bar in Royal Blue */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

              <div>
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-[2px] bg-mist text-royal-blue border border-sand flex items-center justify-center">
                    <Briefcase className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="font-heading font-bold text-[clamp(1.2rem,1.8vw,1.4rem)] text-text leading-snug">
                  {career.title}
                </h3>
                <p className="mt-2 text-[15px] sm:text-[16px] text-text-muted leading-relaxed">
                  {career.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-sand/70">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-blue-text block mb-2">
                  Key Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {career.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-[2px] bg-mist text-text text-[13px] border border-sand"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
