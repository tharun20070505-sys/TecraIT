import { ProgramOverview } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { DepartmentContentNotice } from "@/components/common/DepartmentContentNotice";
import { Stagger } from "@/components/common/Stagger";

interface ProgramOverviewProps {
  overview: ProgramOverview;
}

export function ProgramOverviewSection({ overview }: ProgramOverviewProps) {
  return (
    <section className="py-20 lg:py-24 bg-mist border-y border-sand text-text" aria-labelledby="program-overview">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Curriculum and Degree Framework"
          eyebrowColor="teal"
          title={overview.title}
          description={overview.description}
        />

        {/* Structured Program Details Grid */}
        <div className="bg-white rounded-[3px] border border-sand shadow-xs overflow-hidden relative">
          {/* 4px Top Bar in Teal */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />

          <div className="bg-midnight text-white px-6 py-4 flex items-center justify-between border-b border-sand/20">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-gold">
              Undergraduate Degree Specifications
            </span>
            <span className="text-[13px] text-sand/80">
              Affiliated with Anna University, Chennai
            </span>
          </div>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-sand">
            {overview.details.map((item, idx) => {
              const isMissing =
                item.value.includes("Content") ||
                item.value.includes("REQUIRED");

              return (
                <div key={idx} className="p-6 space-y-2">
                  <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider block">
                    {item.label}
                  </span>
                  {isMissing ? (
                    <div className="pt-1">
                      <DepartmentContentNotice />
                    </div>
                  ) : (
                    <p className="font-heading font-bold text-[17px] text-text">
                      {item.value}
                    </p>
                  )}
                </div>
              );
            })}
          </Stagger>

          <div className="bg-ivory px-6 py-4 border-t border-sand flex flex-col sm:flex-row items-start sm:items-center justify-between text-[14px] text-text-muted gap-2">
            <span className="text-blue-text font-medium">
              Syllabus structured according to AICTE Model Curriculum standards.
            </span>
            <span className="text-[13px] text-text-muted">
              Updated regularly in coordination with Board of Studies.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
