import { WhyItCard } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import {
  Code2,
  BrainCircuit,
  DatabaseZap,
  ShieldCheck,
  CloudCog,
  Cpu,
  type LucideIcon,
} from "lucide-react";

interface WhyITSectionProps {
  cards: WhyItCard[];
}

const iconMap: Record<string, LucideIcon> = {
  Code2,
  BrainCircuit,
  DatabaseZap,
  ShieldCheck,
  CloudCog,
  Cpu,
};

export function WhyITSection({ cards }: WhyITSectionProps) {
  return (
    <section className="py-20 lg:py-24 bg-ivory text-text border-b border-sand/30" aria-labelledby="why-it-heading">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Academic and Technical Disciplines"
          eyebrowColor="royal-blue"
          title="Why Information Technology at SRIET?"
          description="A curriculum structured between algorithmic depth and real-world system engineering, preparing students for careers across modern computing disciplines."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, idx) => {
            const IconComponent = iconMap[card.iconName] || Code2;

            return (
              <div
                key={card.id || idx}
                className="group relative bg-white p-7 rounded-[3px] border border-sand flex flex-col justify-between overflow-hidden"
              >
                {/* 4px Top Bar in Royal Blue */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

                <div className="space-y-4">
                  {/* Icon Tile */}
                  <div className="w-12 h-12 rounded-[2px] bg-mist border border-sand flex items-center justify-center text-royal-blue">
                    <IconComponent className="w-6 h-6" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-[clamp(1.2rem,1.8vw,1.4rem)] text-text leading-snug">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-[15px] sm:text-[16px] text-text-muted leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-sand/60 flex items-center justify-between text-[13px] text-text-muted">
                  <span className="font-medium">Track {idx + 1}</span>
                  <span className="text-blue-text font-semibold">
                    Core Specialization
                  </span>
                </div>
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
