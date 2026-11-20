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

const disciplineColors = [
  "bg-sky-wash text-blue-text",
  "bg-teal-wash text-teal-text",
  "bg-rose-wash text-burgundy-text",
  "bg-mint-wash text-emerald-text",
  "bg-amber-wash text-gold-text",
  "bg-indigo-50 text-indigo-deep",
] as const;

export function WhyITSection({ cards }: WhyITSectionProps) {
  return (
    <section className="py-20 lg:py-24 bg-ivory text-text border-b border-sand/30" aria-label="Why Information Technology at SRIET?">
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
            const color = disciplineColors[idx % disciplineColors.length];

            return (
              <div
                key={card.id || idx}
                className="group relative h-full overflow-hidden rounded-xl border border-sand bg-white p-7 shadow-sm hover:border-blue-text/30 hover:shadow-md motion-safe:transition-[translate,box-shadow,border-color] motion-safe:duration-300 motion-safe:hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Icon Tile */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105 ${color}`}>
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
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
