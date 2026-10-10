import React from "react";
import { cn } from "@/lib/utils";
import { ChipColor } from "./StatusChip";
import { Reveal } from "./Reveal";
import { RevealText } from "./RevealText";
import { motionTokens } from "@/lib/motion";

interface SectionHeadingProps {
  number?: string;
  eyebrow?: string;
  eyebrowColor?: ChipColor;
  title: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  number,
  eyebrow,
  eyebrowColor = "royal-blue",
  title,
  description,
  theme = "light",
  className,
}: SectionHeadingProps) {
  const isDark = theme === "dark";

  const eyebrowColorsLight: Record<ChipColor, string> = {
    "royal-blue": "text-blue-text",
    burgundy: "text-burgundy-text",
    emerald: "text-emerald-text",
    gold: "text-gold-text",
    teal: "text-teal-text",
    indigo: "text-[#1E1B4B]",
    midnight: "text-[#0C1535]",
    "status-success": "text-[#3B6D11]",
    "status-warning": "text-[#854F0B]",
    "status-error": "text-[#A32D2D]",
    "status-info": "text-blue-text",
  };
  const ruleColors: Record<ChipColor, string> = {
    "royal-blue": "bg-royal-blue",
    burgundy: "bg-burgundy",
    emerald: "bg-emerald",
    gold: "bg-gold",
    teal: "bg-teal",
    indigo: "bg-indigo-deep",
    midnight: "bg-midnight",
    "status-success": "bg-status-success",
    "status-warning": "bg-status-warning",
    "status-error": "bg-status-error",
    "status-info": "bg-status-info",
  };

  // Ensure eyebrow contains words only (no bullets or symbols)
  const cleanEyebrow = eyebrow ? eyebrow.replace(/[•|/&]/g, " ").replace(/\s+/g, " ").trim() : undefined;

  return (
    <div className={cn("space-y-2 max-w-4xl text-left", className)}>
      {/* Short Eyebrow Label (uppercase, weight 600, letter spacing, words only) */}
      {(number || cleanEyebrow) && (
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          {cleanEyebrow && (
            <Reveal effect="eyebrow" duration={motionTokens.durationFast}>
              <span
                className={cn(
                  "tracking-widest font-semibold",
                  isDark ? "text-gold" : eyebrowColorsLight[eyebrowColor]
                )}
              >
                {cleanEyebrow}
              </span>
            </Reveal>
          )}
        </div>
      )}

      {/* Main Section Title (Merriweather, bold 700/900, clamp, left-aligned, tight line-height) */}
      <h2
        className={cn(
          "font-heading font-black text-[clamp(1.75rem,3.5vw,2.9rem)] leading-[1.2] tracking-tight text-left",
          isDark ? "text-white" : "text-text"
        )}
      >
        <RevealText mode="words" delay={motionTokens.sectionTitleDelay}>
          {title}
        </RevealText>
      </h2>

      {/* Short Thick CSS Colour Bar Below Title */}
      <Reveal effect="bar" delay={motionTokens.sectionTitleDelay + motionTokens.wordStagger * 2} duration={motionTokens.durationBar} className="w-14">
        <div
          className={cn(
            "w-14 h-1 rounded-[1px] my-3",
            isDark ? "bg-gold" : ruleColors[eyebrowColor]
          )}
          aria-hidden="true"
        />
      </Reveal>

      {/* Optional Description (human, 17-18px body, line height 1.6) */}
      {description && (
        <Reveal delay={motionTokens.sectionTitleDelay + motionTokens.wordStagger * 4}>
          <p
            className={cn(
              "text-[17px] sm:text-[18px] leading-[1.6] pt-1 text-left max-w-3xl",
              isDark ? "text-sand/85" : "text-text-muted"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
