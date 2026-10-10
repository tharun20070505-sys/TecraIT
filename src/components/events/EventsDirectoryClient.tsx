"use client";

import { Reveal } from "@/components/common/Reveal";
import { motionTokens } from "@/lib/motion";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EventItem } from "@/types";
import { StatusChip } from "@/components/common/StatusChip";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Bell,
} from "lucide-react";

interface EventsDirectoryClientProps {
  events: EventItem[];
}

export function EventsDirectoryClient({ events }: EventsDirectoryClientProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "Department" | "College">("ALL");

  // Determine next upcoming event for top announcement strip
  const nextEvent = useMemo(() => {
    return events.find((e) => e.isUpcoming);
  }, [events]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
        day: d.getDate(),
        year: d.getFullYear(),
      };
    } catch {
      return { month: "DATE", day: "00", year: "" };
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesTab = activeTab === "upcoming" ? e.isUpcoming : !e.isUpcoming;
      const matchesScope = scopeFilter === "ALL" || e.scope === scopeFilter;
      return matchesTab && matchesScope;
    });
  }, [events, activeTab, scopeFilter]);

  return (
    <div className="space-y-12">
      {/* 1. Highlighted Announcement Strip at the Top for the Next Event */}
      {nextEvent && (
        <div className="relative rounded-2xl bg-midnight text-white p-6 sm:p-8 border-2 border-gold/40 shadow-xl overflow-hidden group">
          {/* Subtle Burgundy/Gold Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-burgundy/20 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-burgundy border border-gold/40 flex items-center justify-center text-gold shrink-0 shadow-lg">
                <Bell className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold bg-deep-navy px-2 py-0.5 rounded border border-gold/30">
                    NEXT UPCOMING EVENT
                  </span>
                  <StatusChip label={nextEvent.scope} color={nextEvent.scope === "Department" ? "burgundy" : "royal-blue"} size="sm" />
                </div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  {nextEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sand/80">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gold" /> {nextEvent.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" /> {nextEvent.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold" /> {nextEvent.venue}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/events/${nextEvent.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-royal-blue text-white text-xs font-semibold hover:bg-royal-blue/90 shadow-md shrink-0 focus-dark"
            >
              <span>View Announcement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Tabs (Upcoming vs Past) & Scope Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand pb-4">
        {/* Upcoming vs Past Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              activeTab === "upcoming"
                ? "bg-midnight text-gold border border-gold/40 shadow-xs"
                : "bg-white text-text-muted hover:text-text border border-sand hover:bg-mist"
            }`}
          >
            Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              activeTab === "past"
                ? "bg-midnight text-gold border border-gold/40 shadow-xs"
                : "bg-white text-text-muted hover:text-text border border-sand hover:bg-mist"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Scope Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-text-muted hidden sm:inline">
            Scope:
          </span>
          {(["ALL", "Department", "College"] as const).map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setScopeFilter(sc)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                scopeFilter === sc
                  ? "bg-burgundy text-white font-semibold"
                  : "bg-mist text-text-muted hover:text-text border border-sand"
              }`}
            >
              {sc === "ALL" ? "All Scopes" : sc}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notification-style Event Cards Grid */}
      {filteredEvents.length > 0 ? (
        <Reveal key={`${activeTab}-${scopeFilter}`} effect="fade" duration={motionTokens.durationFilter} observe={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const dateObj = formatDate(evt.date);
            const isDept = evt.scope === "Department";

            return (
              <div
                key={evt.id}
                className="relative bg-white p-6 rounded-xl border border-sand shadow-xs flex flex-col sm:flex-row gap-5 overflow-hidden group justify-between"
              >
                {/* 3px Top Border in Burgundy or Royal Blue */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] ${
                    isDept ? "bg-burgundy" : "bg-royal-blue"
                  } rounded-t-xl`}
                />

                {/* Left Date Badge */}
                <div
                  className={`shrink-0 w-16 h-20 rounded-xl ${
                    isDept ? "bg-burgundy-deep text-white border-burgundy" : "bg-deep-navy text-white border-royal-blue"
                  } border flex flex-col items-center justify-center font-mono shadow-inner`}
                >
                  <span className="text-[11px] text-gold font-bold tracking-wider">
                    {dateObj.month}
                  </span>
                  <span className="text-2xl font-black leading-tight">
                    {dateObj.day}
                  </span>
                  <span className="text-[10px] text-sand/60">
                    {dateObj.year}
                  </span>
                </div>

                {/* Event Information */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip label={evt.category} color={isDept ? "burgundy" : "royal-blue"} size="sm" />
                    <span className="text-[10px] font-mono text-text-muted uppercase">
                      Scope: {evt.scope}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-text line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-2 border-t border-sand/60 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-burgundy" /> {evt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-burgundy" /> {evt.venue}
                      </span>
                    </div>

                    <Link
                      href={`/events/${evt.slug}`}
                      className="motion-link-underline inline-flex items-center gap-1 font-semibold text-royal-blue hover:text-gold"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </Reveal>
      ) : (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-burgundy" />}
          title={`No ${activeTab === "upcoming" ? "Upcoming" : "Past"} Events`}
          message={`There are currently no ${activeTab} events matching the selected scope filter. Check back soon for new announcements.`}
          actionText="Show All Upcoming Events"
          onAction={() => {
            setActiveTab("upcoming");
            setScopeFilter("ALL");
          }}
        />
      )}
    </div>
  );
}
