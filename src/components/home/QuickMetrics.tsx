import { QuickMetric } from "@/types";
import { DepartmentContentNotice } from "@/components/common/DepartmentContentNotice";
import { CountUpNumber } from "@/components/common/CountUpNumber";
import { Reveal } from "@/components/common/Reveal";
import { Stagger } from "@/components/common/Stagger";

interface QuickMetricsProps {
  metrics: QuickMetric[];
}

export function QuickMetrics({ metrics }: QuickMetricsProps) {
  return (
    <section
      className="relative bg-deep-navy text-white border-y border-sand/20 py-10 sm:py-12"
      aria-label="Department Metrics and Statistics"
    >
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8" kind="cards">
          {metrics.map((metric, idx) => {
            const isMissing =
              metric.value.includes("Content") ||
              metric.value.includes("REQUIRED");

            return (
              <div
                key={metric.id || idx}
                className="flex flex-col items-start p-5 rounded-[3px] bg-ink/40 border border-sand/20"
              >
                <div className="flex items-baseline gap-1">
                  {metric.prefix && (
                    <span className="text-xl font-bold text-gold font-mono">
                      {metric.prefix}
                    </span>
                  )}
                  {isMissing ? (
                    <DepartmentContentNotice />
                  ) : (
                    <CountUpNumber
                      className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-gold tracking-tight tabular-nums"
                      value={metric.value}
                    />
                  )}
                  {!isMissing && metric.suffix && (
                    <span className="text-xl font-bold text-gold font-mono">
                      {metric.suffix}
                    </span>
                  )}
                </div>
                <Reveal effect="fade" className="mt-2">
                  <div className="text-[14px] font-semibold tracking-wide text-sand/90 uppercase text-left">
                    {metric.label}
                  </div>
                </Reveal>
                {metric.description && (
                  <Reveal effect="fade" className="mt-1">
                    <div className="text-[13px] text-sand/60 text-left">
                      {metric.description}
                    </div>
                  </Reveal>
                )}
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
