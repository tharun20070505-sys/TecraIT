import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GalleryGridClient } from "@/components/gallery/GalleryGridClient";
import { getGalleryItems } from "@/lib/db-data";

export const metadata: Metadata = {
  title: "Department Gallery",
  description:
    "Explore the visual archive of the Department of Information Technology at SRIET: events, academic symposiums, hackathons, lab sessions, and campus facilities.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Department Gallery"
        eyebrow="VISUAL ARCHIVE"
        breadcrumbs={[{ label: "Gallery" }]}
        description="A visual collection of moments from student hackathons, symposiums, industrial visits, computing laboratories, and campus culture."
      />

      {/* 2. Gallery Directory */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Curated Archives"
          eyebrowColor="gold"
          title="Campus Life and Events in Focus"
          description="Filter through category archives or select any photograph to view in full resolution."
        />

        <GalleryGridClient items={items} />
      </section>
    </div>
  );
}
