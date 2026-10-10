import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { Stagger } from "@/components/common/Stagger";
import { RevealText } from "@/components/common/RevealText";
import { ImageReel } from "@/components/reels/ImageReel";
import { BatchMembersTabs } from "@/components/association/BatchMembersTabs";
import { associationData } from "@/data/association";
import { getAssociationData, getAssociationLogoConfig } from "@/lib/db-data";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "IT Association",
  description:
    "Official student governing association of the Department of Information Technology at SRIET. Student executive council, technical symposiums, and initiatives.",
};

export default async function ITAssociationPage() {
  const [dbData, logoConfig] = await Promise.all([
    getAssociationData(),
    getAssociationLogoConfig(),
  ]);
  const batches = dbData.membersByBatch && dbData.membersByBatch.length > 0
    ? dbData.membersByBatch
    : associationData.membersByBatch;

  const effectiveLogo = logoConfig.logoDark || logoConfig.logoLight;

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="IT Association"
        eyebrow="STUDENT GOVERNANCE"
        breadcrumbs={[
          { label: "Student Life", href: "/student-life" },
          { label: "IT Association" },
        ]}
        description="Fostering student technical leadership, national symposia organization, and academic community engagement."
      />

      {/* 2 & 3. Heading and Centred Association Logo under Page Title */}
      <section className="py-16 sm:py-20 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[2px] bg-mist border border-sand text-teal-text text-[13px] font-semibold uppercase tracking-wider mx-auto">
          <Users className="w-4 h-4 text-teal" aria-hidden="true" />
          <span>Student Association Charter</span>
        </div>

        <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-text tracking-tight max-w-3xl mx-auto">
          <RevealText mode="words">{associationData.name}</RevealText>
        </h2>
        <Reveal effect="fade" animateOnMount>
          <p className="text-[17px] text-text-muted font-medium max-w-xl mx-auto">
            {associationData.tagline}
          </p>
        </Reveal>

        {/* Association Logo Centred under Page Title */}
        <div className="pt-4 flex justify-center">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[3px] bg-midnight border border-gold/40 shadow-md flex items-center justify-center p-6">
            <Image
              src={effectiveLogo}
              alt={logoConfig.alt}
              width={160}
              height={160}
              className="object-contain"
              priority
            />
            <div className="absolute -bottom-3 px-3 py-1 bg-deep-navy text-gold text-[11px] uppercase tracking-widest rounded-[2px] border border-gold/40 font-semibold">
              Official Insignia
            </div>
          </div>
        </div>
      </section>

      {/* 4. About the Association and Objectives (Left colored borders, no check marks) */}
      <section className="py-16 bg-white border-y border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="Governance Mandate"
            eyebrowColor="teal"
            title="About the Association"
          />

          <Reveal animateOnMount>
            <p className="text-[16px] text-text-muted leading-relaxed max-w-3xl">
              {associationData.about}
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {associationData.objectives.map((obj, idx) => (
              <div
                key={idx}
                className="p-4 border-l-2 border-teal bg-ivory border-sand rounded-[2px] text-[15px] text-text"
              >
                <span>{obj}</span>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 5. Association Membership List (Batch-wise Clean Table) */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Leadership Roster"
          eyebrowColor="teal"
          title="Executive Council and Batch Representatives"
          description="Elected and appointed student office bearers managing association portfolios and committee initiatives."
        />

        <BatchMembersTabs batches={batches} />
      </section>

      {/* 6. ImageReel of Association Images */}
      <section className="py-20 lg:py-24 bg-mist border-t border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="Association Moments"
            eyebrowColor="gold"
            title="Association Gallery and Symposia Highlights"
            description="Moments from recent student elections, symposium ceremonies, and technical meets."
          />

          <ImageReel images={associationData.images} />
        </div>
      </section>
    </div>
  );
}
