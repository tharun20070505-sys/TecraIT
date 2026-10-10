"use client";

import { useState, useId } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger } from "@/components/common/Stagger";
import type { PeoItem, PoItem, PsoItem } from "@/types";
import {
  GraduationCap,
  Target,
  Cpu,
  Layers,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ProgramOutcomesSectionProps {
  peos: PeoItem[];
  pos: PoItem[];
  psos: PsoItem[];
}

type TabType = "all" | "peo" | "po" | "pso";

export function ProgramOutcomesSection({
  peos = [],
  pos = [],
  psos = [],
}: ProgramOutcomesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const tabListId = useId();

  const tabs: { id: TabType; label: string; count: number; badgeColor: string }[] = [
    { id: "all", label: "All Frameworks", count: peos.length + pos.length + psos.length, badgeColor: "bg-deep-navy text-gold" },
    { id: "peo", label: "PEOs (Educational Objectives)", count: peos.length, badgeColor: "bg-gold/20 text-gold-dark border-gold/40" },
    { id: "po", label: "POs (Graduate Attributes)", count: pos.length, badgeColor: "bg-royal-blue/15 text-royal-blue border-royal-blue/30" },
    { id: "pso", label: "PSOs (Specific Outcomes)", count: psos.length, badgeColor: "bg-teal/15 text-teal border-teal/30" },
  ];

  const showPeo = activeTab === "all" || activeTab === "peo";
  const showPo = activeTab === "all" || activeTab === "po";
  const showPso = activeTab === "all" || activeTab === "pso";

  return (
    <section
      id="peo-pso"
      className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto scroll-mt-24 space-y-12"
      aria-labelledby="peo-pso-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-sand pb-8">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Academic Charter & NBA Attributes"
            eyebrowColor="royal-blue"
            title="Program Educational Objectives & Outcomes"
            description="The structured academic frameworks governing student competence, professional ethics, and graduate engineering attributes in the Department of Information Technology."
          />
        </div>

        {/* Tab Controls */}
        <div
          role="tablist"
          aria-label="Outcome category tabs"
          className="flex flex-wrap items-center gap-2 p-1.5 rounded-[4px] bg-mist border border-sand shrink-0"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`${tabListId}-${tab.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[3px] text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-midnight text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-white/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold border ${
                    isActive ? "bg-white/20 text-white border-white/20" : "bg-sand/40 text-text border-sand"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PROGRAM EDUCATIONAL OBJECTIVES (PEOs) */}
      {showPeo && (
        <div id="peo" className="space-y-6 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-deep-navy to-midnight p-5 sm:p-6 rounded-[3px] border border-gold/30 text-white shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>Program Educational Objectives (PEOs)</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Graduates will be able to:
              </h3>
            </div>
            <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-[2px] bg-gold/20 text-gold border border-gold/40 font-semibold tracking-wide">
              {peos.length} Core Objectives
            </span>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peos.map((peo, idx) => (
              <div
                key={peo.id || idx}
                className="relative bg-white p-7 rounded-[3px] border border-sand hover:border-gold/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* 3px Top Card Accent in Gold */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-[2px] bg-deep-navy text-gold border border-gold/40 tracking-wider">
                      {peo.code}
                    </span>
                    <Target className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors" aria-hidden="true" />
                  </div>

                  <p className="text-[15px] sm:text-[16px] text-text leading-relaxed">
                    {peo.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-sand/60 flex items-center justify-between text-xs text-text-muted font-medium">
                  <span className="uppercase tracking-wider">Objective {idx + 1}</span>
                  <span className="text-blue-text font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-royal-blue" aria-hidden="true" />
                    Career Competence
                  </span>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      )}

      {/* 2. PROGRAM OUTCOMES (POs) */}
      {showPo && (
        <div id="po" className="space-y-6 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0C1A38] to-[#162B5E] p-5 sm:p-6 rounded-[3px] border border-royal-blue/30 text-white shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-royal-blue-light text-xs font-bold uppercase tracking-widest text-[#7CA8FF]">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>National Board of Accreditation Framework</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Program Outcomes (POs)
              </h3>
            </div>
            <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-[2px] bg-royal-blue/20 text-[#B8D2FF] border border-royal-blue/40 font-semibold tracking-wide">
              {pos.length} Graduate Attributes
            </span>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pos.map((po, idx) => (
              <div
                key={po.id || idx}
                className="relative bg-white p-6 sm:p-7 rounded-[3px] border border-sand hover:border-royal-blue/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* 3px Top Card Accent in Royal Blue */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-[2px] bg-royal-blue text-white shadow-xs">
                      {po.code}
                    </span>
                    <BookOpenCheck className="w-4 h-4 text-text-muted group-hover:text-royal-blue transition-colors" aria-hidden="true" />
                  </div>

                  <h4 className="font-heading font-bold text-[17px] text-text group-hover:text-royal-blue transition-colors leading-snug">
                    {po.title}
                  </h4>

                  <p className="text-[14px] text-text-muted leading-relaxed">
                    {po.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-sand/60 flex items-center justify-between text-[11px] text-text-muted font-medium">
                  <span className="uppercase tracking-wider">Attribute {idx + 1}</span>
                  <span className="text-teal font-semibold">NBA Accredited</span>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      )}

      {/* 3. PROGRAM SPECIFIC OUTCOMES (PSOs) */}
      {showPso && (
        <div id="pso" className="space-y-6 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#063339] to-[#0D4B53] p-5 sm:p-6 rounded-[3px] border border-teal/40 text-white shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-teal-light text-xs font-bold uppercase tracking-widest text-[#5EEAD4]">
                <Cpu className="w-4 h-4" aria-hidden="true" />
                <span>Department Technical Mandate</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Program Specific Outcomes (PSOs)
              </h3>
            </div>
            <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-[2px] bg-teal/20 text-[#A7F3D0] border border-teal/40 font-semibold tracking-wide">
              {psos.length} Department Outcomes
            </span>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {psos.map((pso, idx) => (
              <div
                key={pso.id || idx}
                className="relative bg-white p-7 rounded-[3px] border border-sand hover:border-teal/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* 3px Top Card Accent in Teal */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-[2px] bg-[#0E525B] text-white">
                      {pso.code}
                    </span>
                    <Sparkles className="w-4 h-4 text-text-muted group-hover:text-teal transition-colors" aria-hidden="true" />
                  </div>

                  <p className="text-[15px] sm:text-[16px] text-text font-medium leading-relaxed">
                    {pso.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-sand/60 flex items-center justify-between text-xs text-text-muted font-medium">
                  <span className="uppercase tracking-wider">Domain Focus {idx + 1}</span>
                  <span className="text-teal font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    Specialization
                  </span>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      )}
    </section>
  );
}
