"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Download, Mail, Menu, Phone, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { defaultNavItems } from "@/data/navItems";
import { clubsData } from "@/data/clubs";
import type { Club, DbNavItem } from "@/types";

const NavDrawer = dynamic(
  () => import("./NavDrawer").then((module) => module.NavDrawer),
  { ssr: false }
);

const DESKTOP_UTILITIES_HEIGHT = 52;
const DESKTOP_BRANDING_HEIGHT = 92;
const DESKTOP_NAV_HEIGHT = 78;
const DESKTOP_TICKER_HEIGHT = 48;
const DESKTOP_TOTAL_HEIGHT = DESKTOP_UTILITIES_HEIGHT + DESKTOP_BRANDING_HEIGHT + DESKTOP_NAV_HEIGHT + DESKTOP_TICKER_HEIGHT;

interface ProfessionalNavbarProps {
  clubs?: Club[];
}

export function ProfessionalNavbar({ clubs = [] }: ProfessionalNavbarProps) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<DbNavItem[]>(defaultNavItems);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phone, setPhone] = useState("+91 422 269 7799");
  const [brochureUrl, setBrochureUrl] = useState("/docs/brochure.pdf");
  const headerRef = useRef<HTMLElement>(null);
  const scrollFrame = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/nav-items").then((response) => response.ok ? response.json() : null).catch(() => null),
      fetch("/api/admin/settings").then((response) => response.ok ? response.json() : null).catch(() => null),
    ]).then(([navData, settingsData]) => {
      if (cancelled) return;
      if (navData?.items?.length) setNavItems(navData.items);
      const settings = settingsData?.settings;
      if (settings?.officePhone) setPhone(settings.officePhone);
      if (settings?.brochurePdfUrl) setBrochureUrl(settings.brochurePdfUrl);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const update = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 72);
        scrollFrame.current = null;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenDropdown(null);
      setDrawerOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setSearchOpen(false);
      }
    };
    const outside = (event: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenDropdown(null);
    };
    window.addEventListener("keydown", close);
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    return () => {
      window.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const activeClubs = clubs.length > 0 ? clubs : clubsData;
  const resolvedItems = navItems.map((item) => {
    if (item.type === "auto" && item.autoSource === "clubs") {
      return {
        ...item,
        children: activeClubs.map((club, index) => ({
          label: club.name,
          href: `/clubs/${club.slug}`,
          order: index + 1,
          visible: true,
        })),
      };
    }
    return item;
  }).filter((item) => item.visible).sort((a, b) => a.order - b.order);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname?.startsWith(href);
  const searchMatches = searchQuery.trim()
    ? resolvedItems.flatMap((item) => [
        item,
        ...item.children.filter((child) => child.visible),
      ]).filter((item) => item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  const tickerText = "RATHINAM INSTITUTE OF TECHNOLOGY ◆ RATHINAM GROUP OF INSTITUTIONS ◆ TECRA ◆ DEPARTMENT OF INFORMATION TECHNOLOGY";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-[#061B3B]"
      >
        Skip to main content
      </a>

      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 w-full pointer-events-none"
        aria-label="Site header"
      >
        <nav aria-label="Main navigation" className="w-full">
          <div className="hidden lg:block" style={{ height: DESKTOP_TOTAL_HEIGHT }}>
            <div
              className="absolute inset-x-0 top-0 flex items-center transition-[opacity,transform] duration-300"
              style={{
                height: DESKTOP_UTILITIES_HEIGHT,
                background: "#061B3B",
                opacity: isScrolled ? 0 : 1,
                transform: isScrolled ? "translateY(-52px)" : "translateY(0)",
                pointerEvents: isScrolled ? "none" : "auto",
              }}
            >
              <div className="mx-auto flex h-full w-[95%] items-center justify-between text-[14px] text-white">
                <div className="flex h-full items-center">
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="flex h-full items-center gap-2 pr-5 text-white no-underline">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{phone}</span>
                  </a>
                  <span className="h-5 w-px bg-white/45" aria-hidden="true" />
                  <a href="mailto:tecra@rathinam.ac.in" className="flex h-full items-center gap-2 px-5 text-white no-underline">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>tecra@rathinam.ac.in</span>
                  </a>
                </div>
                <div className="flex h-full items-center">
                  <Link href="/student-life" className="flex h-full items-center px-5 text-white no-underline">Student Portal</Link>
                  <span className="h-5 w-px bg-white/45" aria-hidden="true" />
                  <span className="px-5 font-bold">NAAC A+</span>
                  <span className="h-5 w-px bg-white/45" aria-hidden="true" />
                  <span className="pl-5 font-bold">NBA</span>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-x-0 flex items-center justify-between transition-[opacity,transform] duration-300"
              style={{
                top: DESKTOP_UTILITIES_HEIGHT,
                height: DESKTOP_BRANDING_HEIGHT,
                opacity: isScrolled ? 0 : 1,
                transform: isScrolled ? "translateY(-92px)" : "translateY(0)",
                pointerEvents: isScrolled ? "none" : "auto",
              }}
            >
              <div className="mx-auto flex h-full w-[95%] items-center justify-between">
                <Link href="/" aria-label="Rathinam Institute of Technology, TECRA home" className="flex h-full items-center">
                  <Image
                    src="/images/logos/rathinam-institute-banner.webp"
                    alt="Rathinam Institute of Technology"
                    width={310}
                    height={76}
                    priority
                    className="h-[76px] w-auto object-contain"
                  />
                </Link>

                <Link href="/" aria-label="TECRA Department of Information Technology" className="flex h-full items-center gap-3 text-white no-underline">
                  <Image
                    src="/images/logos/tecra-department-emblem.webp"
                    alt="TECRA Department emblem"
                    width={68}
                    height={68}
                    priority
                    className="h-[68px] w-[68px] object-contain"
                  />
                  <div>
                    <span className="block font-[family-name:var(--font-heading)] text-[34px] font-black italic leading-none">TECRA</span>
                    <span className="mt-1 block max-w-[220px] text-[12px] font-bold leading-[1.15] tracking-[0.08em]">DEPARTMENT OF<br />INFORMATION TECHNOLOGY</span>
                  </div>
                </Link>
              </div>
            </div>

            <div
              className="absolute inset-x-0 z-10 mx-auto transition-[top,transform,opacity] duration-300"
              style={{
                top: isScrolled ? 12 : DESKTOP_UTILITIES_HEIGHT + DESKTOP_BRANDING_HEIGHT + 8,
                width: "95%",
                height: DESKTOP_NAV_HEIGHT,
              }}
            >
              <div className="flex h-full items-center rounded-full bg-[#061B3B] px-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]" style={{ border: "none" }}>
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2">
                  {resolvedItems.map((item) => {
                    const hasDropdown = (item.type === "dropdown" || item.type === "auto") && item.children.some((child) => child.visible);
                    const active = isActive(item.href);
                    const open = openDropdown === item.id;

                    if (!hasDropdown) {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex h-[50px] shrink-0 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#168BFF]/20 xl:px-4"
                          style={active ? { background: "linear-gradient(135deg, #0046CC 0%, #168BFF 100%)", boxShadow: "0 6px 16px rgba(22,139,255,0.28)" } : undefined}
                        >
                          {active && item.href === "/" && <span aria-hidden="true" className="text-[16px]">⌂</span>}
                          <span>{item.label}</span>
                        </Link>
                      );
                    }

                    const children = item.children.filter((child) => child.visible).sort((a, b) => a.order - b.order);
                    return (
                      <div key={item.id} className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(open ? null : item.id)}
                          onMouseEnter={() => setOpenDropdown(item.id)}
                          aria-expanded={open}
                          aria-haspopup="menu"
                          className="flex h-[50px] items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#168BFF]/20 xl:px-4"
                          style={open ? { background: "rgba(22,139,255,0.18)" } : undefined}
                        >
                          <span>{item.label}</span>
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>
                        {open && (
                          <div
                            role="menu"
                            className="absolute left-0 top-[58px] w-[300px] overflow-hidden rounded-xl bg-[#061B3B] py-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                            onMouseLeave={() => setOpenDropdown(null)}
                          >
                            <Link href={item.href} role="menuitem" onClick={() => setOpenDropdown(null)} className="block px-5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#7EC1FF] no-underline">
                              {item.type === "auto" ? "View all clubs" : `${item.label} overview`}
                            </Link>
                            {children.map((child) => (
                              <Link key={child.href} href={child.href} role="menuitem" onClick={() => setOpenDropdown(null)} className="block px-5 py-3 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#168BFF]/20">
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="ml-3 flex h-full shrink-0 items-center gap-2 border-l border-white/45 pl-3">
                  <a
                    href={brochureUrl}
                    download
                    className="flex h-[50px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0046CC] to-[#168BFF] px-5 text-[14px] font-bold text-white no-underline shadow-[0_6px_16px_rgba(22,139,255,0.25)]"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Brochure</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSearchOpen((value) => !value)}
                    aria-label={searchOpen ? "Close site search" : "Search site"}
                    aria-expanded={searchOpen}
                    className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/70 text-white"
                  >
                    {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {searchOpen && (
                <div className="absolute right-0 top-[86px] w-[380px] rounded-xl bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                  <label htmlFor="site-search" className="sr-only">Search TECRA website</label>
                  <input
                    id="site-search"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search pages and departments"
                    className="h-12 w-full rounded-lg border border-slate-300 px-4 text-[15px] text-[#0F172A] outline-none focus:border-[#168BFF] focus:ring-2 focus:ring-[#168BFF]/20"
                  />
                  {searchQuery && (
                    <div className="mt-2 max-h-[280px] overflow-y-auto">
                      {searchMatches.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)} className="block rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[#061B3B] no-underline hover:bg-sky-wash">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="absolute inset-x-0 z-[9] mx-auto overflow-hidden rounded-full bg-[#092C5C] transition-[top,opacity] duration-300"
              style={{
                top: isScrolled ? 98 : DESKTOP_UTILITIES_HEIGHT + DESKTOP_BRANDING_HEIGHT + DESKTOP_NAV_HEIGHT + 12,
                width: "95%",
                height: DESKTOP_TICKER_HEIGHT,
                opacity: isScrolled ? 0 : 1,
              }}
              aria-label="Department information ticker"
            >
              <div className="professional-ticker-track">
                <span>{tickerText}</span>
                <span aria-hidden="true">{tickerText}</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto lg:hidden">
            <div
              className="fixed inset-x-0 top-0 z-[41] flex h-[64px] items-center justify-between border-b border-white/20 bg-[#061B3B] px-3"
            >
              <Link href="/" aria-label="Rathinam Institute of Technology, TECRA home" className="flex min-w-0 items-center gap-1 text-white no-underline">
                <Image src="/images/logos/rathinam-institute-banner.webp" alt="Rathinam Institute of Technology" width={118} height={40} priority className="h-10 w-[118px] object-contain" />
                <Image src="/images/logos/tecra-department-emblem.webp" alt="TECRA" width={38} height={38} priority className="h-[38px] w-[38px] object-contain" />
              </Link>
              <div className="flex items-center gap-2">
                <a href={brochureUrl} download aria-label="Download department brochure" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#0046CC] to-[#168BFF] text-white">
                  <Download className="h-4 w-4" aria-hidden="true" />
                </a>
                <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open mobile navigation menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-white">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="fixed inset-x-0 top-[64px] z-[40] h-[42px] overflow-hidden rounded-b-[24px] bg-[#092C5C]">
              <div className="professional-ticker-track professional-ticker-track-mobile">
                <span>{tickerText}</span>
                <span aria-hidden="true">{tickerText}</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div aria-hidden="true" className="hidden h-[270px] w-full lg:block" />
      <div aria-hidden="true" className="h-[106px] w-full lg:hidden" />

      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        clubs={clubs}
        navItems={resolvedItems}
      />

      <style jsx global>{`
        .professional-ticker-track {
          display: flex;
          width: max-content;
          height: 100%;
          align-items: center;
          color: white;
          font-family: var(--font-heading), sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          white-space: nowrap;
          animation: professional-ticker 30s linear infinite;
        }
        .professional-ticker-track > span {
          display: inline-flex;
          align-items: center;
          padding-right: 80px;
        }
        .professional-ticker-track-mobile {
          height: 42px;
          font-size: 11px;
          animation-duration: 24s;
        }
        @keyframes professional-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .professional-ticker-track { animation-duration: 120s; }
        }
      `}</style>
    </>
  );
}
