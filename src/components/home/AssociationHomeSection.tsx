import Image from "next/image";
import Link from "next/link";
import { ITAssociationInfo } from "@/types";
import { Users } from "lucide-react";
import { Stagger } from "@/components/common/Stagger";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";

interface AssociationHomeSectionProps {
  association: ITAssociationInfo;
}

export function AssociationHomeSection({ association }: AssociationHomeSectionProps) {
  return (
    <section className="py-20 lg:py-24 bg-ivory text-text border-b border-sand/30" aria-labelledby="association-heading">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="relative rounded-[3px] bg-midnight text-white p-8 sm:p-12 lg:p-14 overflow-hidden border border-sand/20">
          {/* 4px Top Bar in Teal */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Association Details (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-teal-deep border border-teal text-sand text-[13px] font-semibold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
                <span>Student Body Governance</span>
              </div>

              <div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                  <RevealText mode="words">{association.name}</RevealText>
                </h2>
                <p className="text-[17px] text-gold font-medium mt-1">
                  {association.tagline}
                </p>
              </div>

              <Reveal>
                <p className="text-[16px] sm:text-[17px] text-sand/85 leading-relaxed max-w-2xl">
                  {association.about}
                </p>
              </Reveal>

              {/* Lists use spacing and a thin coloured left border, not bullets or check marks */}
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {association.objectives.slice(0, 4).map((obj, idx) => (
                  <div key={idx} className="border-l-2 border-teal pl-3 text-[14px] text-sand/90">
                    <span>{obj}</span>
                  </div>
                ))}
              </Stagger>

              <div className="pt-4">
                <Link
                  href="/student-life/it-association"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-[3px] bg-teal text-white text-[15px] font-semibold hover:bg-teal/90 shadow-sm transition-colors focus-dark"
                >
                  Explore IT Association and Batch Council
                </Link>
              </div>
            </div>

            {/* Right Association Logo Poster (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[3px] bg-ink border border-sand/20 shadow-md flex items-center justify-center p-8">
                <Image
                  src={association.logoUrl}
                  alt={`${association.name} Logo`}
                  width={160}
                  height={160}
                  className="object-contain"
                />
                <div className="absolute -bottom-3 px-3 py-1 bg-deep-navy text-gold text-[11px] uppercase tracking-widest rounded-[2px] border border-gold/40 font-semibold">
                  Official Insignia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
