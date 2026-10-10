"use client";

import { useState } from "react";
import Image from "next/image";
import { ITAssociationInfo } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Users, Award } from "lucide-react";
import { Stagger } from "@/components/common/Stagger";

interface BatchMembersTabsProps {
  batches: ITAssociationInfo["membersByBatch"];
}

export function BatchMembersTabs({ batches }: BatchMembersTabsProps) {
  const [selectedBatchIdx, setSelectedBatchIdx] = useState(0);

  if (!batches || batches.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-teal" />}
        title="No Member Records"
        message="Executive committee members for this term will be updated shortly."
      />
    );
  }

  const currentBatch = batches[selectedBatchIdx] || batches[0];

  return (
    <div className="space-y-8">
      {/* Batch Tabs Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-sand pb-4">
        {batches.map((b, idx) => (
          <button
            key={b.batch}
            type="button"
            onClick={() => setSelectedBatchIdx(idx)}
            className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              selectedBatchIdx === idx
                ? "bg-midnight text-gold shadow-md border border-gold/40"
                : "bg-white text-text-muted hover:text-text border border-sand hover:bg-mist"
            }`}
          >
            Academic Term: {b.batch}
          </button>
        ))}
      </div>

      {/* Member Cards Grid for Selected Batch */}
      <Stagger key={selectedBatchIdx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" kind="rows">
        {currentBatch.members.map((member) => (
          <div
            key={member.id}
            className="relative bg-white rounded-xl border border-sand p-6 shadow-xs flex flex-col items-center text-center group overflow-hidden"
          >
            {/* 3px Top Border in Teal */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal rounded-t-xl" />

            {/* Member Photo */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-sand bg-mist mb-4 shadow-inner">
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                sizes="112px"
                className="object-cover object-top"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-teal-text uppercase tracking-wider font-mono">
                {member.role}
              </span>
              <h3 className="font-heading font-bold text-base text-text">
                {member.name}
              </h3>
              <p className="text-xs text-text-muted">
                {member.batch}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sand/60 w-full flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
              <Award className="w-3.5 h-3.5 text-gold" /> Executive Committee
            </div>
          </div>
        ))}
      </Stagger>
    </div>
  );
}
