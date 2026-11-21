import Image from "next/image";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { Reveal } from "./Reveal";
import { RevealText } from "./RevealText";
import { motionTokens } from "@/lib/motion";

interface PageBannerProps {
  title: string;
  eyebrow?: string;
  breadcrumbs: BreadcrumbItem[];
  description?: string;
  campusImageSrc?: string;
}

export function PageBanner({
  title,
  eyebrow,
  breadcrumbs,
  description,
  campusImageSrc,
}: PageBannerProps) {
  const cleanEyebrow = eyebrow
    ? eyebrow.replace(/[•|/&]/g, " ").replace(/\s+/g, " ").trim()
    : undefined;

  return (
    <section className="page-banner relative bg-midnight bg-linear-to-br from-midnight via-deep-navy to-teal-deep text-white overflow-hidden border-b border-sand/20 min-h-[240px] lg:min-h-[280px] flex items-center py-10 lg:py-12">
      {/* 20% Opacity Campus Image Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
        {campusImageSrc && (
          <Image
            src={campusImageSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
      </div>

      <div className="brand-spectrum absolute inset-x-0 bottom-0 h-1" aria-hidden="true" />

      {/* Full Laptop/Desktop Width Coverage */}
      <div className="relative z-10 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="max-w-4xl space-y-3 text-left">
          {/* Breadcrumbs */}
          <Reveal effect="fade" delay={motionTokens.breadcrumbDelay} duration={motionTokens.durationFast} animateOnMount className="mb-2">
            <Breadcrumbs items={breadcrumbs} theme="dark" />
          </Reveal>

          {/* Eyebrow Label (uppercase, weight 600, words only) */}
          {cleanEyebrow && (
            <Reveal effect="eyebrow" duration={motionTokens.durationFast} className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-[13px] uppercase tracking-widest font-semibold text-gold">
                {cleanEyebrow}
              </span>
            </Reveal>
          )}

          {/* Page Title (Merriweather, weight 900, clamp, left-aligned) */}
          <h1 className="font-heading font-black text-[clamp(2.25rem,4.5vw,3.75rem)] text-white tracking-tight leading-[1.15]">
            <RevealText mode="words" animateOnMount>{title}</RevealText>
          </h1>

          {/* Description */}
          {description && (
            <Reveal delay={motionTokens.sectionTitleDelay}>
              <p className="text-[16px] sm:text-[17px] text-sand/85 leading-relaxed pt-1 max-w-3xl">
                {description}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
