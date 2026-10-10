import React from "react";
import { cn } from "@/lib/utils";

export type ChipColor =
  | "royal-blue"
  | "burgundy"
  | "emerald"
  | "gold"
  | "teal"
  | "indigo"
  | "midnight"
  | "status-success"
  | "status-warning"
  | "status-error"
  | "status-info";

interface StatusChipProps {
  label: string;
  color?: ChipColor;
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export function StatusChip({
  label,
  color = "royal-blue",
  size = "sm",
  className,
  icon,
}: StatusChipProps) {
  // Light background styles with WCAG AA compliant text-safe colors
  const colorMap: Record<ChipColor, string> = {
    "royal-blue": "bg-[#E8EEFF] text-[#1E3A8A] border-[#C3D2FC]",
    burgundy: "bg-[#FDF0F3] text-[#8C1F46] border-[#F8CCD6]",
    emerald: "bg-[#EDF8F2] text-[#146C43] border-[#C2EAD3]",
    gold: "bg-[#FBF6EA] text-[#8A6212] border-[#F2DEB0]",
    teal: "bg-[#ECF8F8] text-[#0B5F66] border-[#BDE8EA]",
    indigo: "bg-[#EEEDFC] text-[#1E1B4B] border-[#D0CEFA]",
    midnight: "bg-[#EDF1F7] text-[#0C1535] border-[#D1DBE8]",
    "status-success": "bg-[#EAF3DE] text-[#3B6D11] border-[#C5E1A5]",
    "status-warning": "bg-[#FAEEDA] text-[#854F0B] border-[#F5D8A5]",
    "status-error": "bg-[#FCEBEB] text-[#A32D2D] border-[#F5C2C2]",
    "status-info": "bg-[#E3EBFB] text-[#1E3A8A] border-[#BFD4F8]",
  };

  const sizeMap = {
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide uppercase",
        colorMap[color],
        sizeMap[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
