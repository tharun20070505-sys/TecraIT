import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { HeadquartersSection } from "@/components/contact/HeadquartersSection";

export const metadata: Metadata = {
  title: "Inquiry Portal and Contact - Department of Information Technology",
  description:
    "Official Inquiry Portal of the Department of Information Technology at Sri Ranganathar Institute of Engineering and Technology. Submit admissions, academic queries, or industry collaboration requests.",
};

export default function ContactPage() {
  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Inquiry Portal and Contact"
        eyebrow="TECRA DEPARTMENT COMMUNICATIONS"
        breadcrumbs={[{ label: "Contact" }]}
        description="Connect with the administrative office, department leadership, or program coordinators for admissions, academic collaborations, and industry partnerships."
      />

      {/* 2. Main Inquiry and Headquarters Grid */}
      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
          <SectionHeading
            eyebrow="DIRECT INQUIRIES"
            eyebrowColor="midnight"
            title="Reach the Information Technology Desk"
            description="Send an official message or review office location and coordinate details below."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Inquiry Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <InquiryForm />
            </div>

            {/* Headquarters Details Column (5 cols) */}
            <div className="lg:col-span-5">
              <HeadquartersSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

