import Image from "next/image";
import Link from "next/link";
import { FacultyMember } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Mail } from "lucide-react";
import { Stagger } from "@/components/common/Stagger";

interface FacultyHomeSectionProps {
  faculty: FacultyMember[];
}

export function FacultyHomeSection({ faculty }: FacultyHomeSectionProps) {
  const featuredFaculty = faculty.slice(0, 4);

  return (
    <section className="py-20 lg:py-24 bg-ivory text-text border-b border-sand/30" aria-labelledby="faculty-heading">
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Academic Mentorship"
            eyebrowColor="royal-blue"
            title="Distinguished Faculty and Instructors"
            description="Our academic staff brings scholarly depth, specialized research domains, and dedicated student mentorship to classrooms and laboratories."
          />
          <Link
            href="/faculty"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[3px] bg-royal-blue text-white text-[14px] font-semibold hover:bg-royal-blue/90 transition-colors shadow-xs shrink-0"
          >
            Full Faculty Directory
          </Link>
        </div>

        {/* 4 Faculty Highlights per row on screens 1280px and wider */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFaculty.map((member) => (
            <div
              key={member.id}
              className="relative bg-white rounded-[3px] border border-sand p-5 flex flex-col justify-between overflow-hidden"
            >
              {/* 4px Top Bar in Royal Blue */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-royal-blue" />

              <div className="space-y-4">
                {/* Faculty Photo */}
                <div className="relative w-full h-56 rounded-[2px] overflow-hidden bg-sand/30 border border-sand/50">
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top"
                  />
                  {member.isHod && (
                    <span className="absolute top-2 left-2 bg-midnight text-gold text-[12px] font-bold px-2 py-0.5 rounded-[2px] border border-gold/40 uppercase">
                      HOD
                    </span>
                  )}
                </div>

                {/* Faculty Details */}
                <div>
                  <span className="text-[12px] font-semibold text-blue-text uppercase tracking-wide block mb-1">
                    {member.position}
                  </span>
                  <h3 className="font-heading font-bold text-[18px] text-text leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-[14px] text-text-muted mt-0.5">
                    {member.qualification}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-sand/60">
                    <span className="text-[12px] font-medium text-text-muted block">
                      Specialisation:
                    </span>
                    <span className="text-[13px] text-text font-medium leading-tight block mt-0.5">
                      {member.specialisation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Contact */}
              {member.showEmail && member.email && (
                <div className="mt-4 pt-3 border-t border-sand/60 text-[13px]">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-blue-text hover:underline flex items-center gap-1.5 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{member.email}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
