import Image from "next/image";
import type { WhyItCard } from "@/types";
import { siteSettings } from "@/data/site";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";
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
  { text: "text-blue-text", tile: "bg-sky-wash", rule: "bg-royal-blue" },
  { text: "text-teal-text", tile: "bg-teal-wash", rule: "bg-teal" },
  { text: "text-burgundy-text", tile: "bg-rose-wash", rule: "bg-burgundy" },
  { text: "text-emerald-text", tile: "bg-mint-wash", rule: "bg-emerald" },
  { text: "text-gold-text", tile: "bg-amber-wash", rule: "bg-gold" },
  { text: "text-indigo-deep", tile: "bg-indigo-50", rule: "bg-indigo-500" },
] as const;

export function WhyITSection({ cards }: WhyITSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 lg:py-24" aria-labelledby="why-it-heading">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" aria-hidden="true">
        <Image
          src="/images/home/computing-lab.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_45%]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/45" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/10 via-transparent to-ink" />
      </div>

      <div className="mx-auto w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] space-y-10 lg:space-y-12">
        <header className="max-w-4xl">
          <h2 id="why-it-heading" className="font-heading text-[clamp(2rem,4.5vw,4.25rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-white">
            <span className="block">
              <RevealText mode="words">Why Information Technology</RevealText>
            </span>
            <span className="mt-1 block text-[#79e5d2]">
              <RevealText mode="words" delay={140}>{`at ${siteSettings.institutionName}?`}</RevealText>
            </span>
          </h2>
          <div className="brand-spectrum mt-5 h-1 w-24 rounded-full" aria-hidden="true" />
          <Reveal delay={220}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand sm:text-lg">
              Build foundations in computing, then apply them to real systems across six areas of Information Technology.
            </p>
          </Reveal>
        </header>

        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, index) => {
            const Icon = iconMap[card.iconName] ?? Code2;
            const { text, tile, rule } = disciplineColors[index % disciplineColors.length];

            return (
              <article
                key={card.id || index}
                className="relative h-full overflow-hidden rounded-2xl bg-white p-6 shadow-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 sm:p-7"
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${rule}`} aria-hidden="true" />
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tile} ${text}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className={`font-heading text-lg font-extrabold leading-snug sm:text-xl ${text}`}>
                  {card.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted sm:text-base">
                  {card.description}
                </p>
              </article>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
