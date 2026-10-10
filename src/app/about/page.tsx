import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ImageReel } from "@/components/reels/ImageReel";
import { aboutData } from "@/data/about";
import { programOverview } from "@/data/site";
import { Target, BookOpen } from "lucide-react";
import { ProgramOutcomesSection } from "@/components/about/ProgramOutcomesSection";
import { DepartmentContentNotice } from "@/components/common/DepartmentContentNotice";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";
import { Stagger } from "@/components/common/Stagger";
import { motionTokens } from "@/lib/motion";

export const metadata: Metadata = {
  title: "About Department",
  description:
    "Discover the vision, mission, academic framework, and computing laboratories of the Department of Information Technology at Sri Ranganathar Institute of Engineering and Technology.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="About Department"
        eyebrow="DEPARTMENT OVERVIEW"
        breadcrumbs={[{ label: "About Department" }]}
        description="Fostering computational ingenuity, robust software architecture, and research-driven engineering education at SRIET."
      />

      {/* 2. Introduction to Information Technology: Text Beside Image */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text on the Left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SectionHeading
              eyebrow="Foundations and Overview"
              eyebrowColor="royal-blue"
              title={aboutData.introTitle}
            />

            <Reveal delay={motionTokens.sectionTitleDelay + motionTokens.wordStagger * 4} animateOnMount>
              <div className="space-y-4 text-[17px] text-text-muted leading-relaxed">
                {aboutData.introParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </Reveal>

            <div className="pt-2 flex flex-wrap gap-4 text-[14px] text-blue-text font-semibold">
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand">
                Degree: B.Tech Information Technology
              </span>
              <span className="px-3.5 py-1.5 rounded-[3px] bg-mist border border-sand">
                Approved by AICTE, Anna University Affiliated
              </span>
            </div>
          </div>

          {/* Image on the Right (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[3px] overflow-hidden border border-sand shadow-sm bg-midnight">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={aboutData.introImageUrl}
                  alt={aboutData.introImageCaption}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              </div>
              <Reveal effect="fade" delay={motionTokens.captionDelay} className="relative p-4 bg-ink border-t border-sand/20">
                <p className="text-[14px] text-sand/85 font-medium">
                  {aboutData.introImageCaption}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision: Full-Width Dark Band with Large Text */}
      <section id="vision" className="relative py-20 lg:py-24 bg-midnight text-white border-y border-sand/20 overflow-hidden scroll-mt-24">
        <div className="relative z-10 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[2px] bg-deep-navy border border-gold/40 text-gold text-[13px] font-semibold uppercase tracking-wider">
            <span>{aboutData.visionTitle}</span>
          </div>

          <blockquote className="mx-auto max-w-4xl font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-snug">
            <RevealText mode="lines">{aboutData.visionText}</RevealText>
          </blockquote>

          <Reveal effect="bar" duration={motionTokens.durationBar} className="mx-auto w-16">
            <div className="w-16 h-1 bg-gold" aria-hidden="true" />
          </Reveal>
          <Reveal>
            <p className="text-[13px] text-sand/70 uppercase tracking-wider font-semibold">
              Guiding Charter, Department of Information Technology, SRIET
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4. Mission: Structured Cards */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Institutional Objectives"
          eyebrowColor="royal-blue"
          title={aboutData.missionTitle}
          description="The department translates its vision into measurable strategic imperatives designed to elevate technical education and student empowerment."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aboutData.missionItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative bg-white p-8 rounded-[3px] border border-sand hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* 4px Top Card Border in Royal Blue */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold px-3 py-1 rounded-[2px] bg-deep-navy text-gold border border-gold/30">
                    {item.number}
                  </span>
                  <Target className="w-5 h-5 text-text-muted" aria-hidden="true" />
                </div>

                <h3 className="font-heading font-bold text-xl text-text">
                  {item.title}
                </h3>

                <p className="text-[16px] text-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-sand/60 text-[13px] text-text-muted uppercase font-medium">
                Strategic Pillar {idx + 1}
              </div>
            </div>
          ))}
        </Stagger>
      </section>

      {/* 5. Program Educational Objectives (PEOs), Program Outcomes (POs), Program Specific Outcomes (PSOs) */}
      <ProgramOutcomesSection
        peos={aboutData.peos ?? []}
        pos={aboutData.pos ?? []}
        psos={aboutData.psos ?? []}
      />

      {/* 6. Course Overview: Details Grid */}
      <section className="py-20 lg:py-24 bg-mist border-y border-sand text-text">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
          <SectionHeading
            eyebrow="Academic Specifications"
            eyebrowColor="teal"
            title="Course and Degree Overview"
            description="Curricular parameters governing the Bachelor of Technology in Information Technology degree program."
          />

          <div className="bg-white rounded-[3px] border border-sand shadow-xs overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />

            <div className="bg-midnight text-white px-6 py-4 flex items-center justify-between border-b border-sand/20">
              <span className="text-[14px] font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold" aria-hidden="true" />
                <span>Academic Parameters</span>
              </span>
              <span className="text-[13px] text-sand/80">
                Department of Information Technology, SRIET
              </span>
            </div>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-sand">
              {programOverview.details.map((item, idx) => {
                const isMissing =
                  item.value.includes("Content") ||
                  item.value.includes("REQUIRED");

                return (
                  <div key={idx} className="p-6 space-y-2 hover:bg-mist/30 transition-colors">
                    <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider block">
                      {item.label}
                    </span>
                    {isMissing ? (
                      <DepartmentContentNotice />
                    ) : (
                      <p className="font-heading font-bold text-[17px] text-text">
                        {item.value}
                      </p>
                    )}
                  </div>
                );
              })}
            </Stagger>

            <div className="bg-ivory px-6 py-4 border-t border-sand flex items-center justify-between text-[14px] text-text-muted">
              <span className="text-blue-text font-medium">
                Curriculum aligned with Anna University Regulation standards.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ImageReel of About-Page Images */}
      <section id="laboratories" className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8 scroll-mt-24">
        <SectionHeading
          eyebrow="Department Infrastructure"
          eyebrowColor="gold"
          title="Laboratories and Academic Environments"
          description="Dedicated spaces for algorithmic discovery, project prototyping, and collaborative inquiry."
        />

        <ImageReel images={aboutData.reelImages} aspectRatio="video" />
      </section>
    </div>
  );
}
