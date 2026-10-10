import React from "react";
import Image from "next/image";
import type { NavbarBadgeLogo } from "@/types";

interface BadgesProps {
  customBadges?: NavbarBadgeLogo[];
}

export function NavbarAccreditationBadges({ customBadges = [] }: BadgesProps) {
  // If admin has defined custom badges in Settings, render them with vertical dividers
  if (customBadges && customBadges.length > 0) {
    return (
      <div className="hidden xl:flex items-center h-full">
        {customBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center h-full px-2.5 xl:px-3 border-r border-gray-300 last:border-r-0"
            title={badge.alt}
          >
            <div className="relative h-9 w-9 overflow-hidden flex items-center justify-center">
              <Image
                src={badge.url}
                alt={badge.alt || "Accreditation Badge"}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default prestigious accreditation badges mirroring institutional tier-1 quality
  return (
    <div className="flex items-center h-full select-none"> 

      {/* 2. NAAC A+ BADGE */}
      <div
        className="flex items-center gap-1.5 px-2 xl:px-2.5 h-8 border-r border-gray-200"
        title="NAAC Accredited with A+ Grade"
      >
        <div className="w-7 h-7 rounded-xs bg-[#8B1A1A] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
          <span className="text-[10px] font-black leading-none tracking-tight">A+</span>
          <span className="text-[5.5px] font-bold tracking-widest leading-none mt-0.5 text-amber-200">
            NAAC
          </span>
        </div>
        <div className="flex flex-col text-[7.5px] leading-[8.5px] font-sans font-semibold text-gray-700">
          <span className="font-bold text-[#8B1A1A]">NAAC A+</span>
          
        </div>
      </div>

     

      {/* 4. AUTONOMOUS / AICTE RATING BADGE */}
      <div
        className="hidden 2xl:flex items-center gap-1.5 px-2 xl:px-2.5 h-8"
        title="Autonomous Status & AICTE Approval"
      >
        <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white flex flex-col items-center justify-center shadow-xs">
          <span className="text-[6.5px] font-bold tracking-wider leading-none">AICTE</span>
          <span className="text-[5.5px] font-extrabold text-amber-200 tracking-tight leading-none mt-0.5">
            GOVT
          </span>
        </div>
        <div className="flex flex-col text-[7.5px] leading-[8.5px] font-sans font-semibold text-gray-700">
          <span className="font-bold text-[#ea580c]">AUTONOMOUS</span>
          <span className="text-[7px] text-gray-500 font-medium">ANNA UNIV.</span>
        </div>
      </div>
    </div>
  );
}
