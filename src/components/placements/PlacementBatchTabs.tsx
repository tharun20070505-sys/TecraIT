"use client";

import { useState } from "react";
import { PlacementBatchSummary } from "@/types";
import { Calendar } from "lucide-react";
import { DepartmentContentNotice } from "@/components/common/DepartmentContentNotice";
import { Stagger } from "@/components/common/Stagger";

interface PlacementBatchTabsProps {
  batches: PlacementBatchSummary[];
}

export function PlacementBatchTabs({ batches }: PlacementBatchTabsProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!batches || batches.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-text-muted bg-white rounded-[3px] border border-sand">
        Placement batch summaries are currently being compiled.
      </div>
    );
  }

  const current = batches[selectedIdx] || batches[0];

  return (
    <div className="space-y-6">
      {/* Batch Select Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-sand pb-4">
        {batches.map((b, idx) => (
          <button
            key={b.batch}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`px-5 py-2.5 rounded-[3px] text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              selectedIdx === idx
                ? "bg-midnight text-gold border border-gold/40 shadow-xs"
                : "bg-white text-text-muted hover:text-text border border-sand hover:bg-mist"
            }`}
          >
            {b.batch}
          </button>
        ))}
      </div>

      {/* Batch Placement Summary Table with Alternating Row Tints */}
      <div className="overflow-x-auto border border-sand rounded-[3px] bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-mist border-b border-sand text-xs font-semibold text-text uppercase tracking-wider">
              <th className="py-3.5 px-4">Batch Period</th>
              <th className="py-3.5 px-4">Department Overview</th>
              <th className="py-3.5 px-4">Verification Status</th>
            </tr>
          </thead>
          <Stagger as="tbody" directItems className="divide-y divide-sand" kind="rows">
            {batches.map((b, idx) => {
              const isSelected = selectedIdx === idx;
              const isPending =
                b.summaryText.includes("Content to be provided") ||
                b.summaryText.includes("[CONTENT REQUIRED");
              return (
                <tr
                  key={b.batch}
                  onClick={() => setSelectedIdx(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gold/10 font-medium"
                      : idx % 2 === 0
                      ? "bg-white hover:bg-ivory"
                      : "bg-ivory/50 hover:bg-ivory"
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-text whitespace-nowrap">
                    {b.batch}
                  </td>
                  <td className="py-3.5 px-4 text-text-muted leading-relaxed">
                    {b.summaryText}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isPending ? (
                      <DepartmentContentNotice />
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium bg-emerald/10 text-emerald border border-emerald/20">
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Stagger>
        </table>
      </div>

      {/* Active Batch Highlight Card */}
      <div className="p-6 rounded-[3px] bg-white border border-sand shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-text">
          <Calendar className="w-4 h-4 text-royal-blue shrink-0" aria-hidden="true" />
          <span>Placement Overview: {current.batch}</span>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          {current.summaryText}
        </p>

        {(current.summaryText.includes("Content to be provided") ||
          current.summaryText.includes("[CONTENT REQUIRED")) && (
          <div className="pt-2">
            <DepartmentContentNotice />
          </div>
        )}
      </div>
    </div>
  );
}

