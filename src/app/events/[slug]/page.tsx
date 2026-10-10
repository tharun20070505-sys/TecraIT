import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/common/PageBanner";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";
import { StatusChip } from "@/components/common/StatusChip";
import { eventsData } from "@/data/events";
import { getEventBySlug } from "@/lib/db-data";
import { Calendar, Clock, MapPin } from "lucide-react";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return eventsData.map((e) => ({
    slug: e.slug,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const evt = await getEventBySlug(slug);

  if (!evt) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: evt.title,
    description: evt.description,
    openGraph: {
      title: evt.title,
      description: evt.description,
      images: [evt.posterUrl],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const evt = await getEventBySlug(slug);

  if (!evt) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tecra.sriet.ac.in";
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: evt.title,
    description: evt.description,
    startDate: evt.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: evt.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        postalCode: "641110",
        streetAddress: "SRIET Campus, Athipalayam",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Department of Information Technology, SRIET",
      url: siteUrl,
    },
    image: evt.posterUrl.startsWith("http") ? evt.posterUrl : `${siteUrl}${evt.posterUrl}`,
  };

  return (
    <div className="w-full bg-ivory text-text">
      {/* Schema.org Event JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* 1. Page Banner */}
      <PageBanner
        title={evt.title}
        eyebrow={evt.category.toUpperCase()}
        breadcrumbs={[
          { label: "Events", href: "/events" },
          { label: evt.title },
        ]}
        description={evt.description}
      />

      {/* 2. Main Event Detail Body */}
      <section className="py-16 sm:py-20 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Event Poster Frame */}
            <div className="relative rounded-[3px] overflow-hidden border border-sand shadow-sm bg-midnight aspect-[16/9]">
              <Image
                src={evt.posterUrl}
                alt={evt.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusChip label={evt.category} color="burgundy" />
                <StatusChip label={`Scope: ${evt.scope}`} color="royal-blue" />
              </div>
            </div>

            {/* Event Narrative */}
            <div className="bg-white p-8 sm:p-10 rounded-[3px] border border-sand shadow-xs space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-burgundy" />

              <h2 className="font-heading font-black text-2xl sm:text-3xl text-text">
                <RevealText mode="words">Event Overview and Agenda</RevealText>
              </h2>

              <Reveal>
                <p className="text-[16px] text-text-muted leading-relaxed">
                  {evt.description}
                </p>
              </Reveal>

              {evt.fullContent && (
                <Reveal>
                  <div className="pt-4 border-t border-sand space-y-4 text-[16px] text-text-muted leading-relaxed">
                    <p>{evt.fullContent}</p>
                  </div>
                </Reveal>
              )}

              <div className="pt-6 border-t border-sand flex items-center justify-between text-[13px] text-text-muted">
                <span className="text-blue-text font-medium">
                  Official Department Notice
                </span>
                <span className="font-mono">ID: {evt.id}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/events"
                className="text-[14px] font-semibold text-royal-blue hover:text-gold transition-colors inline-block"
              >
                Return to All Events
              </Link>
            </div>
          </div>

          {/* Right Sidebar Details Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[3px] border border-sand shadow-xs space-y-6 sticky top-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

              <h3 className="font-heading font-bold text-lg text-text border-b border-sand pb-3">
                Key Event Specifications
              </h3>

              <div className="space-y-4 text-[14px]">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-burgundy shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[12px] uppercase text-text-muted block">
                      Scheduled Date
                    </span>
                    <span className="font-bold text-text">{evt.date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-burgundy shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[12px] uppercase text-text-muted block">
                      Duration and Time
                    </span>
                    <span className="font-bold text-text">{evt.time}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-burgundy shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[12px] uppercase text-text-muted block">
                      Venue Location
                    </span>
                    <span className="font-bold text-text">{evt.venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-sand space-y-3">
                {evt.registrationUrl ? (
                  <a
                    href={evt.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-[3px] bg-burgundy text-white text-[14px] font-semibold hover:bg-burgundy/90 transition-colors shadow-xs"
                  >
                    Register for Event
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-[3px] bg-royal-blue text-white text-[14px] font-semibold hover:bg-royal-blue/90 transition-colors shadow-xs"
                  >
                    Contact Department Desk
                  </Link>
                )}

                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-[3px] bg-mist text-text border border-sand hover:bg-white text-[14px] font-medium transition-colors"
                >
                  Event Inquiries
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
