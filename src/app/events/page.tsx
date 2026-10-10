import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EventsDirectoryClient } from "@/components/events/EventsDirectoryClient";
import { getEvents } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "Department and College Events",
  description:
    "Official schedule of academic conferences, coding workshops, technical symposia, and athletic championships at the Department of Information Technology, SRIET.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Department and College Events"
        eyebrow="ACADEMIC AND CULTURAL ENGAGEMENTS"
        breadcrumbs={[{ label: "Events" }]}
        description="Stay informed on upcoming academic conferences, workshops, technical symposia, hackathons, and athletic championships."
      />

      {/* 2. Events Directory */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Event Schedules"
          eyebrowColor="burgundy"
          title="Announcements, Symposia and Meets"
          description="Browse department initiatives and institute-wide conventions. Review agendas, venues, and registration links."
        />

        <EventsDirectoryClient events={events} />
      </section>
    </div>
  );
}
