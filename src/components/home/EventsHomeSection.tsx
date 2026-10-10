import Link from "next/link";
import { EventItem } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusChip } from "@/components/common/StatusChip";
import { Clock, MapPin } from "lucide-react";
import { Stagger } from "@/components/common/Stagger";

interface EventsHomeSectionProps {
  events: EventItem[];
}

export function EventsHomeSection({ events }: EventsHomeSectionProps) {
  const departmentEvents = events.filter((e) => e.scope === "Department");
  const collegeEvents = events.filter((e) => e.scope === "College");

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

  return (
    <section className="py-20 lg:py-24 bg-mist border-y border-sand text-text" aria-labelledby="events-heading">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Campus Symposia and Meets"
            eyebrowColor="burgundy"
            title="Department and Institutional Events"
            description="Participate in national academic conferences, workshops, technical competitions, and collegiate sports meets."
          />
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[3px] bg-burgundy text-white text-[14px] font-semibold hover:bg-burgundy/90 transition-colors shadow-xs shrink-0"
          >
            View All Events
          </Link>
        </div>

        {/* Notice-board style list with date blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Group 1: Department Initiatives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <h3 className="font-heading font-bold text-[18px] text-text flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-burgundy" />
                <span>Department Initiatives</span>
              </h3>
              <span className="text-[12px] uppercase text-burgundy-text font-semibold">
                Scope: Department
              </span>
            </div>

            <Stagger className="space-y-4">
              {departmentEvents.map((evt) => {
                const dateObj = formatDate(evt.date);

                return (
                  <div
                    key={evt.id}
                    className="relative bg-white p-5 rounded-[3px] border border-sand flex gap-4 overflow-hidden"
                  >
                    {/* 4px Top Bar in Burgundy */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-burgundy" />

                    {/* Notice-board Date Block */}
                    <div className="shrink-0 w-16 h-18 rounded-[2px] bg-burgundy-deep text-white border border-burgundy flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] text-gold font-bold tracking-wider">
                        {dateObj.month}
                      </span>
                      <span className="text-2xl font-black leading-tight">
                        {dateObj.day}
                      </span>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusChip label={evt.category} color="burgundy" size="sm" />
                      </div>

                      <h4 className="font-heading font-bold text-[16px] text-text hover:text-burgundy transition-colors line-clamp-2">
                        {evt.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-burgundy shrink-0" aria-hidden="true" />
                          <span>{evt.time}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-burgundy shrink-0" aria-hidden="true" />
                          <span>{evt.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Stagger>
          </div>

          {/* Group 2: Other College Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <h3 className="font-heading font-bold text-[18px] text-text flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-deep-navy" />
                <span>Other College Events</span>
              </h3>
              <span className="text-[12px] uppercase text-blue-text font-semibold">
                Scope: College-wide
              </span>
            </div>

            <Stagger className="space-y-4">
              {collegeEvents.map((evt) => {
                const dateObj = formatDate(evt.date);

                return (
                  <div
                    key={evt.id}
                    className="relative bg-white p-5 rounded-[3px] border border-sand flex gap-4 overflow-hidden"
                  >
                    {/* 4px Top Bar in Royal Blue */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

                    {/* Notice-board Date Block */}
                    <div className="shrink-0 w-16 h-18 rounded-[2px] bg-deep-navy text-white border border-royal-blue flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] text-gold font-bold tracking-wider">
                        {dateObj.month}
                      </span>
                      <span className="text-2xl font-black leading-tight">
                        {dateObj.day}
                      </span>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusChip label={evt.category} color="royal-blue" size="sm" />
                      </div>

                      <h4 className="font-heading font-bold text-[16px] text-text hover:text-blue-text transition-colors line-clamp-2">
                        {evt.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-royal-blue shrink-0" aria-hidden="true" />
                          <span>{evt.time}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-royal-blue shrink-0" aria-hidden="true" />
                          <span>{evt.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
