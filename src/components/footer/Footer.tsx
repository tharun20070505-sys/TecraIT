"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteSettings } from "@/data/site";
import { MapPin, Mail, Phone, Clock, ShieldCheck } from "lucide-react";
import { BackToTop } from "./BackToTop";
import { DepartmentContentNotice } from "@/components/common/DepartmentContentNotice";
import { Stagger } from "@/components/common/Stagger";

import { useState, useEffect } from "react";

export function Footer({ heroImageSrc }: { heroImageSrc?: string | null }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [assocLogo, setAssocLogo] = useState<{
    showInFooter: boolean;
    logoUrl: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadLogo() {
      try {
        const res = await fetch("/api/association-logo");
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.logo?.showInFooter) {
            setAssocLogo({
              showInFooter: true,
              logoUrl: json.logo.logoDark || json.logo.logoLight,
              alt: json.logo.alt || "IT Association Emblem",
            });
          }
        }
      } catch {
        // graceful ignore
      }
    }
    loadLogo();
    return () => {
      mounted = false;
    };
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const office = siteSettings.departmentOffice;
  const isPhoneMissing =
    !office.phone ||
    office.phone.includes("CONTENT") ||
    office.phone.includes("Content");

  return (
    <footer className="relative bg-ink text-sand border-t border-sand/20 overflow-hidden">
      {/* Footer Top Band with 20% Opacity Campus Image */}
      <div className="relative w-full h-24 border-b border-sand/15 overflow-hidden bg-midnight">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {heroImageSrc && (
            <Image
              src={heroImageSrc}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover object-center"
            />
          )}
        </div>
        <div className="relative w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="text-[14px] uppercase tracking-widest text-gold font-semibold">
              SRIET Campus, Coimbatore, India
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[14px] text-sand/70">
            <ShieldCheck className="w-4 h-4 text-emerald" />
            <span>Approved by AICTE and Affiliated to Anna University, Chennai</span>
          </div>
        </div>
      </div>

      {/* Main Footer Columns (Dense four-column layout on full-width ink background) */}
      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto py-14 lg:py-16">
        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8"
          kind="footer"
          animateOnMount
          itemClassNames={["lg:col-span-4", "lg:col-span-3", "lg:col-span-2", "lg:col-span-3"]}
        >
          {/* Column 1: Department Brand and College Name (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[3px] bg-midnight border border-sand/20 flex items-center justify-center p-1">
                <Image
                  src="/images/logos/tecra-logo.png"
                  alt="TECRA Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-white">TECRA</h3>
                <p className="text-[14px] text-sand/85 font-medium">Department of Information Technology</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-sand/80 max-w-sm">
              {siteSettings.institutionName} (SRIET). Committed to academic rigor, ethical engineering, and computing innovation.
            </p>
            <div className="pt-2 text-[14px] text-gold flex items-center gap-3 font-medium">
              <span>Department Code: {siteSettings.departmentCode}</span>
              <span className="text-sand/40">,</span>
              <span>Degree: B.Tech IT</span>
            </div>

            {assocLogo?.showInFooter && assocLogo.logoUrl && (
              <div className="pt-2">
                <Link
                  href="/student-life/it-association"
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-sand/20 hover:border-gold/40 transition-colors group"
                >
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Image
                      src={assocLogo.logoUrl}
                      alt={assocLogo.alt}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-sand group-hover:text-gold transition-colors">
                    IT Association Chapter
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Column 2: Quick Academic Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[14px] font-semibold uppercase tracking-wider text-white border-b border-sand/15 pb-2">
              Academic Navigation
            </h4>
            <ul className="space-y-2 text-[15px]">
              <li>
                <Link href="/about" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  About Department
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Faculty Directory and Head of Department
                </Link>
              </li>
              <li>
                <Link href="/student-life/it-association" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  IT Association
                </Link>
              </li>
              <li>
                <Link href="/clubs" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Technical and Cultural Clubs
                </Link>
              </li>
              <li>
                <Link href="/placements" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Career Readiness and Placements
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Department Achievements
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Alumni Network and Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Student Life & Engagement (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[14px] font-semibold uppercase tracking-wider text-white border-b border-sand/15 pb-2">
              Student Life
            </h4>
            <ul className="space-y-2 text-[15px]">
              <li>
                <Link href="/events" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Department Gallery
                </Link>
              </li>
              <li>
                <Link href="/campus-life" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Campus Facilities
                </Link>
              </li>
              <li>
                <Link href="/contact" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Contact Department
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="motion-link-underline hover:text-gold transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="motion-link-underline text-sand/50 hover:text-gold transition-colors inline-block">
                  Faculty and Administrator Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Department Office and Contact Details (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[14px] font-semibold uppercase tracking-wider text-white border-b border-sand/15 pb-2">
              Department Office
            </h4>
            <div className="space-y-2.5 text-[15px] text-sand/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" aria-hidden="true" />
                <span>
                  {office.room}, {office.block}
                  <br />
                  {office.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${office.email}`}
                  className="hover:text-white transition-colors"
                >
                  {office.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                {isPhoneMissing ? (
                  <DepartmentContentNotice />
                ) : (
                  <a href={`tel:${office.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white transition-colors">
                    {office.phone}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                <span>{office.officeHours.replace(/-/g, "to")}</span>
              </div>
            </div>

            {/* Social Links (Plain words, no arrows) */}
            <div className="pt-3 border-t border-sand/15 flex items-center gap-4 text-[14px]">
              {siteSettings.socialLinks.linkedin && (
                <a
                  href={siteSettings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit SRIET on LinkedIn (opens in a new tab)"
                  className="text-sand/75 hover:text-gold transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {siteSettings.socialLinks.youtube && (
                <a
                  href={siteSettings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit SRIET on YouTube (opens in a new tab)"
                  className="text-sand/75 hover:text-gold transition-colors"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </Stagger>

        {/* Dynamic Copyright Footer Line (Words only, no copyright symbol, no bullet characters) */}
        <div className="mt-12 pt-6 border-t border-gold/30 flex flex-col sm:flex-row items-center justify-between text-[14px] text-sand/70 gap-4">
          <p>
            Copyright {currentYear} TECRA, Department of Information Technology, Sri Ranganathar Institute of Engineering and Technology.
          </p>
          <p className="text-[13px] text-sand/50">
            Sri Ranganathar Institute of Engineering and Technology, Coimbatore
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
