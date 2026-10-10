import React from "react";

export function DepartmentContentNotice({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block text-[14px] font-normal text-text-muted bg-sand/35 border border-sand/70 px-2 py-0.5 rounded-[3px] select-none ${className}`}
    >
      Content to be provided by the department
    </span>
  );
}
