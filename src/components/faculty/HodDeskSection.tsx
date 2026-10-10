import Image from "next/image";
import { FacultyMember } from "@/types";
import { Mail, Phone, Award, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";

interface HodDeskSectionProps {
  hod: FacultyMember;
}

export function HodDeskSection({ hod }: HodDeskSectionProps) {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="hod-heading">
      <div className="relative rounded-2xl bg-midnight text-white border border-sand/20 shadow-2xl overflow-hidden p-8 sm:p-12 lg:p-14">
        {/* 3px Top Card Border in Gold */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold rounded-t-2xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT: Heading "HOD's Desk" & All Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-gold/40 text-gold text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4 text-gold" />
              <span>Department Leadership</span>
            </div>

            <div>
              <h2
                id="hod-heading"
                className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight"
              >
                <RevealText mode="words">HOD&apos;s Desk</RevealText>
              </h2>
              <div className="mt-2 text-xl sm:text-2xl font-heading font-bold text-gold">
                {hod.name}
              </div>
              <p className="text-sm font-medium text-sand/80 mt-1">
                {hod.position}
              </p>
            </div>

            {/* Quote / Bio */}
            {hod.bio && (
              <Reveal animateOnMount>
                <div className="relative border-l-2 border-gold/60 pl-5 italic text-sand/90 text-sm sm:text-base leading-relaxed">
                  {hod.bio}
                </div>
              </Reveal>
            )}

            {/* Key Qualifications & Specialisation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sand/15">
              <div>
                <span className="text-[11px] font-mono uppercase text-sand/60 block">
                  Qualification
                </span>
                <span className="text-sm font-semibold text-white">
                  {hod.qualification}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-sand/60 block">
                  Specialisation
                </span>
                <span className="text-sm font-semibold text-white">
                  {hod.specialisation}
                </span>
              </div>

              {hod.quota && (
                <div>
                  <span className="text-[11px] font-mono uppercase text-sand/60 block">
                    {hod.quotaLabel || "Category / Cadre"}
                  </span>
                  <span className="text-sm font-semibold text-gold">
                    {hod.quota}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-mono uppercase text-sand/60 block">
                  Department
                </span>
                <span className="text-sm font-semibold text-white">
                  Information Technology
                </span>
              </div>
            </div>

            {/* Email & Contact Toggles */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-sand/90">
              {hod.showEmail && hod.email && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-deep-navy border border-sand/20 flex items-center justify-center text-gold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sand/60 uppercase block">Official Email</span>
                    <a href={`mailto:${hod.email}`} className="text-white hover:text-gold font-mono transition-colors">
                      {hod.email}
                    </a>
                  </div>
                </div>
              )}

              {hod.showContactNumber && hod.contactNumber && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-deep-navy border border-sand/20 flex items-center justify-center text-gold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sand/60 uppercase block">Office Telephone</span>
                    <span className="text-white font-mono">{hod.contactNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Large HOD Photo (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl bg-deep-navy group">
              <Image
                src={hod.photoUrl}
                alt={`Photograph of ${hod.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink via-ink/60 to-transparent flex items-center justify-between text-xs text-sand">
                <span className="font-semibold text-gold">Head of the Department</span>
                <ShieldCheck className="w-4 h-4 text-emerald" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
