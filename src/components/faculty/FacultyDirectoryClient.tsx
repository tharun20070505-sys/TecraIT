"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { FacultyMember } from "@/types";
import { Reveal } from "@/components/common/Reveal";
import { motionTokens } from "@/lib/motion";
import { EmptyState } from "@/components/common/EmptyState";
import { Search, Mail, Phone, Users, Filter, X } from "lucide-react";

interface FacultyDirectoryClientProps {
  faculty: FacultyMember[];
}

export function FacultyDirectoryClient({ faculty }: FacultyDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("ALL");

  // Extract unique designations
  const designations = useMemo(() => {
    const list = Array.from(new Set(faculty.map((f) => f.position)));
    return ["ALL", ...list];
  }, [faculty]);

  // Filtered faculty list
  const filteredList = useMemo(() => {
    return faculty.filter((member) => {
      // Exclude HOD from the general list if shown in HOD Desk, or keep if preferred.
      // The prompt says "Faculty list: the layout is mirrored and smaller... The same details as the HOD"
      // If we exclude the HOD from the regular faculty list, it prevents redundant repetition with the prominent poster.
      if (member.isHod) return false;

      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.qualification.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDesignation =
        designationFilter === "ALL" || member.position === designationFilter;

      return matchesSearch && matchesDesignation;
    });
  }, [faculty, searchQuery, designationFilter]);

  return (
    <div className="space-y-8">
      {/* Search and Designation Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-sand shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-royal-blue absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, specialisation, or degree..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-sand bg-mist/40 text-text placeholder-text-muted text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Designation Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted shrink-0 hidden sm:block" />
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="py-2.5 px-3 rounded-lg border border-sand bg-white text-text text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-royal-blue"
              aria-label="Filter by faculty designation"
            >
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig === "ALL" ? "All Designations" : desig}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter & Active Query Feedback */}
        <div className="flex items-center justify-between text-xs text-text-muted border-t border-sand/60 pt-3">
          <span>
            Showing <strong className="text-text">{filteredList.length}</strong> faculty{" "}
            {filteredList.length === 1 ? "member" : "members"}
          </span>
          {(searchQuery || designationFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDesignationFilter("ALL");
              }}
              className="text-blue-text font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Mirrored Faculty Cards Grid: Image on LEFT, Details on RIGHT */}
      {filteredList.length > 0 ? (
        <Reveal key={`${searchQuery}-${designationFilter}`} effect="fade" duration={motionTokens.durationFilter} observe={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredList.map((member) => (
            <div
              key={member.id}
              className="relative bg-white rounded-xl border border-sand shadow-xs p-6 flex flex-col sm:flex-row gap-6 overflow-hidden group"
            >
              {/* 3px Top Card Border in Royal Blue */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-royal-blue rounded-t-xl" />

              {/* Faculty Image on the LEFT */}
              <div className="relative w-full sm:w-36 h-48 sm:h-auto rounded-lg overflow-hidden bg-sand/30 shrink-0 border border-sand/40">
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 150px"
                  className="object-cover object-top"
                />
              </div>

              {/* Faculty Details on the RIGHT */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-blue-text uppercase tracking-wider block">
                    {member.position}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-text">
                    {member.name}
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    {member.qualification}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-sand/60 space-y-1">
                    <div>
                      <span className="text-[11px] text-text-muted font-medium block">
                        Specialisation:
                      </span>
                      <span className="text-xs text-text font-semibold">
                        {member.specialisation}
                      </span>
                    </div>

                    {member.quota && (
                      <div className="pt-1">
                        <span className="text-[11px] text-text-muted font-medium block">
                          {member.quotaLabel || "Cadre"}:
                        </span>
                        <span className="text-xs text-blue-text font-semibold">
                          {member.quota}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email and Phone with Admin Visibility Check */}
                <div className="pt-2 text-xs space-y-1 text-text-muted border-t border-sand/60">
                  {member.showEmail && member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-royal-blue shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="text-text hover:text-royal-blue hover:underline text-[11px] font-mono line-clamp-1 transition-colors"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}

                  {member.showContactNumber && member.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-royal-blue shrink-0" />
                      <span className="text-text text-[11px] font-mono">
                        {member.contactNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </Reveal>
      ) : (
        <EmptyState
          icon={<Users className="w-6 h-6 text-royal-blue" />}
          title="No Matching Faculty Found"
          message="No faculty profiles match your search criteria. Try modifying your search term or clearing the designation filter."
          actionText="Reset Search"
          onAction={() => {
            setSearchQuery("");
            setDesignationFilter("ALL");
          }}
        />
      )}
    </div>
  );
}
