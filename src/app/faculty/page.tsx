import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/common/PageBanner";
import { Reveal } from "@/components/common/Reveal";
import { motionTokens } from "@/lib/motion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { HodDeskSection } from "@/components/faculty/HodDeskSection";
import { FacultyDirectoryClient } from "@/components/faculty/FacultyDirectoryClient";
import { facultyGroupImage } from "@/data/faculty";
import { getFaculty } from "@/lib/db-data";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Faculty Directory",
  description:
    "Meet the professors, associate professors, and lecturers of the Department of Information Technology at SRIET. Academic profiles, research specializations, and mentorship.",
};

export default async function FacultyPage() {
  const faculty = await getFaculty();
  const hodMember = faculty.find((f) => f.isHod) || faculty[0];

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Faculty Directory"
        eyebrow="ACADEMIC MENTORSHIP"
        breadcrumbs={[{ label: "Faculty" }]}
        description="Our faculty team is composed of passionate researchers, experienced educators, and technology specialists committed to academic excellence."
      />

      {/* 2. Group Faculty Image (Full Width coverage) */}
      <section className="py-12 sm:py-16 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto">
        <div className="relative rounded-[3px] overflow-hidden border border-sand shadow-sm bg-midnight">
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9]">
            <Image
              src={facultyGroupImage.url}
              alt={facultyGroupImage.caption}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <Reveal effect="fade" delay={motionTokens.captionDelay} className="p-4 sm:p-5 bg-ink border-t border-sand/20 flex flex-col sm:flex-row sm:items-center justify-between text-[14px] text-sand/80 gap-2">
            <span className="font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-gold" aria-hidden="true" />
              <span>{facultyGroupImage.caption}</span>
            </span>
            <span className="text-sand/70">
              Department of Information Technology, SRIET
            </span>
          </Reveal>
        </div>
      </section>

      {/* 3. HOD's Desk: Poster-Style Section on Dark Background */}
      <HodDeskSection hod={hodMember} />

      {/* 4. Faculty Directory */}
      <section className="py-16 sm:py-20 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-10">
        <SectionHeading
          eyebrow="Academic Mentors"
          eyebrowColor="royal-blue"
          title="Teaching and Research Faculty"
          description="Browse profiles, academic backgrounds, and contact details for the department's instructional team."
        />

        <FacultyDirectoryClient faculty={faculty} />
      </section>
    </div>
  );
}
