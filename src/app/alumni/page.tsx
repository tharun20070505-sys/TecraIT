import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CardSlider } from "@/components/reels/CardSlider";
import { ImageReel } from "@/components/reels/ImageReel";
import { alumniData } from "@/data/alumni";
import { getAlumniBatchPdfs } from "@/lib/db-data";
import { GraduationCap } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { Stagger } from "@/components/common/Stagger";

export const metadata: Metadata = {
  title: "Alumni Network",
  description:
    "Connect with the distinguished alumni network of the Department of Information Technology at SRIET. Download batch records and read graduate experiences.",
};

export default async function AlumniPage() {
  const batchPdfs = await getAlumniBatchPdfs();
  const approvedReviews = alumniData.reviews.filter((r) => r.approved);

  return (
    <div className="w-full bg-ivory text-text">
      {/* 1. Page Banner */}
      <PageBanner
        title="Alumni Network"
        eyebrow="DEPARTMENT GRADUATES"
        breadcrumbs={[{ label: "Alumni" }]}
        description="Celebrating our network of Information Technology graduates excelling across industry, entrepreneurship, and academia."
      />

      {/* 2. About Alumni Section */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            <SectionHeading
              eyebrow="Graduate Community"
              eyebrowColor="indigo"
              title="A Thriving Alumni Tradition"
            />
            <Reveal animateOnMount>
              <p className="text-[17px] text-text-muted leading-relaxed">
                {alumniData.about}
              </p>
            </Reveal>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-[3px] bg-white border-l-4 border-indigo-deep border border-sand">
                <h4 className="font-heading font-bold text-base text-text">
                  Mentorship Initiatives
                </h4>
                <p className="text-[14px] text-text-muted mt-1">
                  Senior alumni conduct mock interview sessions and portfolio critiques for final-year students.
                </p>
              </div>

              <div className="p-4 rounded-[3px] bg-white border-l-4 border-indigo-deep border border-sand">
                <h4 className="font-heading font-bold text-base text-text">
                  Industry Referrals
                </h4>
                <p className="text-[14px] text-text-muted mt-1">
                  Alumni facilitate internships and recruitment opportunities at leading software firms.
                </p>
              </div>
            </Stagger>
          </div>

          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[3px] border border-sand shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E1B4B]" />
            <div className="w-12 h-12 rounded-[2px] bg-deep-navy text-gold flex items-center justify-center">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text">
              Alumni Relations Office
            </h3>
            <Reveal animateOnMount>
              <p className="text-[14px] text-text-muted leading-relaxed">
                Are you an alumnus seeking to update records, contribute to student mentoring, or deliver an expert guest lecture? Connect with the department office.
              </p>
            </Reveal>
            <div className="pt-2 text-[14px] text-blue-text font-semibold">
              Email: alumni.it@sriet.ac.in
            </div>
          </div>
        </div>
      </section>

      {/* 3. Batch Details: Clean Table with Clear Headings and Alternating Row Tints */}
      <section className="py-20 lg:py-24 bg-mist border-y border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="Archival Records"
            eyebrowColor="indigo"
            title="Batch-Wise Alumni Directories"
            description="Official graduate registers and batch directories cataloged by graduation year."
          />

          <div className="bg-white rounded-[3px] border border-sand shadow-xs overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E1B4B]" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-midnight text-white text-[13px] uppercase font-semibold border-b border-sand/20">
                    <th className="py-3.5 px-6">Graduation Batch</th>
                    <th className="py-3.5 px-6">Directory Title</th>
                    <th className="py-3.5 px-6">Document Format</th>
                    <th className="py-3.5 px-6 text-right">Access File</th>
                  </tr>
                </thead>
                <Stagger as="tbody" directItems className="divide-y divide-sand/70 text-[15px]" kind="rows">
                  {batchPdfs.map((batch, idx) => (
                    <tr
                      key={batch.id}
                      className={idx % 2 === 0 ? "bg-white hover:bg-mist/30 transition-colors" : "bg-ivory/50 hover:bg-mist/30 transition-colors"}
                    >
                      <td className="py-4 px-6 font-semibold text-text">
                        {batch.batchYear}
                      </td>
                      <td className="py-4 px-6 text-text">
                        {batch.title}
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        {batch.fileSize || "PDF Document"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={batch.fileUrl || "#"}
                          download
                          className="inline-block px-4 py-1.5 rounded-[2px] bg-[#1E1B4B] text-white text-[13px] font-semibold hover:bg-midnight transition-colors"
                        >
                          Download Directory
                        </a>
                      </td>
                    </tr>
                  ))}
                </Stagger>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Alumni Testimonials in CardSlider */}
      <section className="py-20 lg:py-24 w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <SectionHeading
          eyebrow="Alumni Voices"
          eyebrowColor="indigo"
          title="Graduate Experiences and Reflections"
          description="Read verified feedback and career journeys shared by department alumni."
        />

        <CardSlider>
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-8 rounded-[3px] border border-sand hover:shadow-md transition-shadow duration-200 space-y-4 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E1B4B]" />
              <div className="space-y-3">
                <Reveal key={rev.id}>
                  <p className="text-[15px] sm:text-[16px] text-text leading-relaxed italic">
                    {rev.reviewText}
                  </p>
                </Reveal>
              </div>

              <div className="pt-4 border-t border-sand flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-text">
                    {rev.name}
                  </h4>
                  {rev.companyRole && (
                    <p className="text-[14px] text-text-muted">
                      {rev.companyRole}
                    </p>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-gold-text bg-mist px-2.5 py-1 rounded-[2px] border border-sand">
                  {rev.batch}
                </span>
              </div>
            </div>
          ))}
        </CardSlider>
      </section>

      {/* 5. ImageReel */}
      <section className="py-20 lg:py-24 bg-mist border-t border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-8">
          <SectionHeading
            eyebrow="Alumni Engagements"
            eyebrowColor="gold"
            title="Reunions and Guest Lecture Moments"
            description="Photographs from alumni homecomings, convocation ceremonies, and technical workshops."
          />

          <ImageReel images={alumniData.images} />
        </div>
      </section>
    </div>
  );
}
