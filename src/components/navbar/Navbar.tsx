"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, FileText } from "lucide-react";
import { siteSettings } from "@/data/site";
import { defaultNavItems } from "@/data/navItems";
import { clubsData } from "@/data/clubs";
import { WordReelStrip } from "./WordReelStrip";
import { NavDrawer } from "./NavDrawer";
import { NavbarAccreditationBadges } from "./NavbarAccreditationBadges";
import type { Club, DbNavItem } from "@/types";

interface NavbarProps {
  clubs?: Club[];
  notices?: never[];
  upcomingEvents?: never[];
}

// ─── Layout Constants ─────────────────────────────────────────────────────────
const FULL_NAV_H  = 88;  // Height of 2-tier navbar on desktop
const NOTICE_H    = 38;  // Height of notice strip
const COND_NAV_H  = 56;  // Height of condensed sticky navbar
const TOTAL_TOP_H = FULL_NAV_H + NOTICE_H; // 126px

// ─── Nav item fetch with clubs fallback ───────────────────────────────────────
function useNavItems(clubs: Club[]): DbNavItem[] {
  const [items, setItems] = useState<DbNavItem[]>(defaultNavItems);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/nav-items")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.items?.length) setItems(d.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeClubs = clubs.length > 0 ? clubs : clubsData;

  return items.map((item) => {
    if (item.type === "auto" && item.autoSource === "clubs") {
      return {
        ...item,
        children: activeClubs.map((c, i) => ({
          label: c.name,
          href: `/clubs/${c.slug}`,
          order: i + 1,
          visible: true,
        })),
      };
    }
    return item;
  });
}

// ─── Dropdown Metadata for Submenus ──────────────────────────────────────────
const ITEM_META: Record<string, { icon: string; desc: string }> = {
  "/about":                       { icon: "🏛", desc: "Academic profile, history and overview" },
  "/about#vision":                { icon: "🎯", desc: "Vision, mission and programme goals" },
  "/about#peo-pso":               { icon: "📋", desc: "Programme educational objectives and outcomes" },
  "/about#laboratories":          { icon: "🔬", desc: "Computing labs and research facilities" },
  "/about#advisory-board":        { icon: "👥", desc: "Industry and academic advisors" },
  "/student-life/it-association": { icon: "🤝", desc: "Student body governing technical initiatives" },
  "/alumni":                      { icon: "🎓", desc: "Alumni network and graduate stories" },
  "/achievements":                { icon: "🏆", desc: "Awards, competitions and student laurels" },
  "/placements":                  { icon: "💼", desc: "Recruitment records and career statistics" },
  "/campus-life":                 { icon: "🌿", desc: "Campus culture, hubs and facilities" },
  "/clubs/technexus":             { icon: "⚡", desc: "Competitive programming and hackathons" },
  "/clubs/aesthetic-ai-club":     { icon: "🤖", desc: "Machine learning and generative AI" },
  "/clubs/fine-arts-club":        { icon: "🎨", desc: "Creative arts and visual expression" },
  "/clubs/media-club":            { icon: "🎬", desc: "Photography, film and digital media" },
};

// ─── Dropdown Panel ───────────────────────────────────────────────────────────
function DropdownPanel({
  item,
  alignRight = false,
  onClose,
  clubs,
}: {
  item: DbNavItem;
  alignRight?: boolean;
  onClose: () => void;
  clubs: Club[];
}) {
  const visible = item.children.filter((c) => c.visible).sort((a, b) => a.order - b.order);
  if (!visible.length) return null;

  return (
    <div
      role="menu"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        ...(alignRight ? { right: 0 } : { left: 0 }),
        minWidth: "290px",
        zIndex: 100,
        background: "#0A0D14",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "10px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Category header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.10)", padding: "10px 16px", background: "rgba(255,255,255,0.03)" }}>
        <Link
          href={item.href}
          onClick={onClose}
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            color: "#D9A441",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#D9A441")}
        >
          <span>{item.type === "auto" ? "View all clubs" : `${item.label} overview`}</span>
          <span>→</span>
        </Link>
      </div>

      {/* Submenu items */}
      <div style={{ padding: "6px 0" }}>
        {visible.map((child) => {
          const meta      = ITEM_META[child.href];
          const clubMatch = clubs.find((c) => `/clubs/${c.slug}` === child.href);
          const icon      = meta?.icon ?? "›";
          const desc      = clubMatch?.shortDescription ?? meta?.desc ?? "";
          const logo      = clubMatch?.logoUrl;

          return (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              onClick={onClose}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "9px 16px",
                  transition: "background 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: logo ? undefined : "14px",
                    marginTop: "1px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  aria-hidden="true"
                >
                  {logo ? (
                    <Image src={logo} alt="" width={20} height={20} style={{ objectFit: "contain" }} />
                  ) : (
                    icon
                  )}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.3,
                    }}
                  >
                    {child.label}
                  </div>
                  {desc && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-body)",
                        color: "rgba(255,255,255,0.60)",
                        lineHeight: 1.35,
                        marginTop: "2px",
                      }}
                    >
                      {desc}
                    </div>
                  )}
                </div>

                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  style={{ flexShrink: 0, marginTop: "4px", opacity: 0.4 }}
                >
                  <path d="M4 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Nav Link Component ───────────────────────────────────────────────────────
function NavLink({
  item,
  isActive,
  isOpen,
  alignRight,
  condensed,
  clubs,
  onToggle,
  onClose,
}: {
  item: DbNavItem;
  isActive: boolean;
  isOpen: boolean;
  alignRight?: boolean;
  condensed?: boolean;
  clubs: Club[];
  onToggle: () => void;
  onClose: () => void;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fontSize = condensed ? "clamp(12px, 0.9vw, 13.5px)" : "clamp(12.5px, 0.95vw, 14px)";

  const hasDropdown =
    (item.type === "dropdown" || item.type === "auto") &&
    item.children.filter((c) => c.visible).length > 0;

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    fontSize,
    color: isActive ? "#F1C40F" : isOpen ? "#ffffff" : "rgba(255,255,255,0.92)",
    textDecoration: "none",
    letterSpacing: "0.01em",
    position: "relative",
    padding: condensed ? "4px 2px" : "6px 2px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    transition: "color var(--motion-duration-hover) var(--motion-ease)",
    whiteSpace: "nowrap",
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasDropdown && !isOpen) onToggle();
  };

  const handleMouseLeave = () => {
    if (hasDropdown) {
      timeoutRef.current = setTimeout(onClose, 250);
    }
  };

  if (!hasDropdown) {
    return (
      <Link
        href={item.href}
        className={`nav-hover-underline${isActive ? " nav-active" : ""}`}
        style={labelStyle}
        onMouseEnter={(e) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          (e.currentTarget as HTMLElement).style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.92)";
        }}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${isOpen ? "Close" : "Open"} ${item.label} menu`}
        className={`nav-hover-underline${isActive || isOpen ? " nav-active" : ""}`}
        style={{
          ...labelStyle,
          background: "none",
          cursor: "pointer",
        }}
      >
        <span>{item.label}</span>
        <ChevronDown
          style={{
            width: "12px",
            height: "12px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            color: isOpen ? "#D9A441" : "rgba(255,255,255,0.75)",
          }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <DropdownPanel
          item={item}
          alignRight={alignRight}
          onClose={onClose}
          clubs={clubs}
        />
      )}
    </div>
  );
}

// ─── Main Navbar Component ────────────────────────────────────────────────────
export function Navbar({ clubs = [] }: NavbarProps) {
  const pathname = usePathname();
  const navItems = useNavItems(clubs);
  const [tneaCode, setTneaCode] = useState(siteSettings.tneaCode || "2738");
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.settings?.tneaCode) {
          setTneaCode(data.settings.tneaCode);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Scroll listener for sticky condensed header
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 80;
        if (nextIsScrolled !== isScrolledRef.current) {
          isScrolledRef.current = nextIsScrolled;
          setIsScrolled(nextIsScrolled);
        }
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close dropdown on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
    setDrawerOpen(false);
  }

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, []);

  // Admin routes do not show public department navbar
  if (pathname?.startsWith("/admin")) return null;

  const phone = siteSettings.officePhone || siteSettings.departmentOffice?.phone || "+91 422 269 7799";
  const isPhoneValid = phone && !phone.toLowerCase().includes("content") && !phone.toLowerCase().includes("required");
  const brochureUrl = siteSettings.brochurePdfUrl?.trim() || "/docs/brochure.pdf";
  const logoSrc = siteSettings.srietLogoSrc || "/images/logos/sriet-logo.png";
  const badgeLogos = siteSettings.navbarBadgeLogos || [];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

  const handleToggle = (id: string) =>
    setOpenDropdown((curr) => (curr === id ? null : id));
  const handleClose = () => setOpenDropdown(null);

  const visibleItems = navItems.filter((n) => n.visible).sort((a, b) => a.order - b.order);

  // Common dark pill style for top utilities
  const topPillStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "28px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#ffffff",
    fontSize: "11.5px",
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "background 150ms ease, border-color 150ms ease",
    whiteSpace: "nowrap",
  };

  const burgerBtnStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "6px",
    color: "#ffffff",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 150ms ease",
  };

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-bold focus:outline-2 focus:outline-black"
      >
        Skip to main content
      </a>

      {/* FIXED TOP HEADER */}
      <header
        ref={navRef as React.RefObject<HTMLElement>}
        className="fixed top-0 left-0 right-0 z-40 w-full select-none"
        aria-label="Site header"
      >
        <nav aria-label="Main navigation" className="w-full">
          {/* ============================================================
              DESKTOP (≥ 1024 px)
          ============================================================ */}
          <div className="hidden lg:block w-full">
            {/* FULL TWO-TIER NAVBAR (When at top of page) */}
            <div
              aria-hidden={isScrolled}
              style={{
                width: "100%",
                height: `${FULL_NAV_H}px`,
                display: "flex",
                background: "#000000",
                borderBottom: "1px solid rgba(0,0,0,0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                opacity: isScrolled ? 0 : 1,
                pointerEvents: isScrolled ? "none" : "auto",
                transition: "opacity 200ms ease, transform 200ms ease",
                transform: isScrolled ? "translateY(-10px)" : "translateY(0)",
                position: isScrolled ? "absolute" : "relative",
                top: 0,
                left: 0,
                zIndex: 2,
              }}
            >
              {/* LEFT PANEL: 100% Solid Pure White (#FFFFFF) */}
              <div
                style={{
                  background: "#FFFFFF",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 18px 0 20px",
                  borderRight: "1px solid #E2E8F0",
                  flexShrink: 0,
                }}
              >
                {/* 1. SRIET Logo */}
                <Link
                  href="/"
                  aria-label="TECRA – SRIET Home"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={logoSrc}
                      alt="Sri Ranganathar Institute of Engineering and Technology Logo"
                      width={46}
                      height={46}
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </div>

                  {/* Vertical Divider */}
                  <div
                    style={{
                      width: "1px",
                      height: "46px",
                      background: "#E2E8F0",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />

                  {/* 2. Text Brand Block */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      lineHeight: 1.15,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Calibri",
                        fontWeight: 900,
                        fontSize: "24px",
                        color: "#7C1A77", // Vibrant institutional purple from reference screenshot
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      TECRA
                    </span>
                    <span
                      style={{
                        fontFamily: "Calibri",
                        fontWeight: 700,
                        fontSize: "10.5px",
                        color: "#0F172A",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginTop: "3px",
                      }}
                    >
                      Department of Information Technology
                    </span>
                    <span
                      style={{
                        fontFamily: "Calibri",
                        fontWeight: 500,
                        fontSize: "9px",
                        color: "#64748B",
                        marginTop: "2px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Sri Ranganathar Institute of Engineering and Technology (Autonomous)
                    </span>
                  </div>
                </Link>

                {/* Vertical Divider before Accreditation Badges */}
                <div
                  style={{
                    width: "1px",
                    height: "46px",
                    background: "#E2E8F0",
                    marginLeft: "16px",
                    marginRight: "6px",
                    flexShrink: 0,
                  }}
                  className="hidden xl:block"
                  aria-hidden="true"
                />

                {/* 3. Accreditation Badges (NBA, NAAC A+, NIRF, AUTONOMOUS) */}
                <div className="hidden xl:flex items-center h-full">
                  <NavbarAccreditationBadges customBadges={badgeLogos} />
                </div>
              </div>

              {/* RIGHT PANEL: 100% Solid Pitch Black (#000000) */}
              <div
                style={{
                  flex: 1,
                  background: "#000000",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "visible",
                }}
              >
                {/* TOP TIER: Institutional Utilities & Pills */}
                <div
                  style={{
                    height: "38px",
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "10px",
                    borderBottom: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {/* TNEA Counselling Code Pill */}
                  <div
                    style={topPillStyle}
                    title="Anna University TNEA Counselling Code"
                  >
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>TNEA Counselling Code :</span>
                    <span style={{ color: "#F1C40F", fontWeight: 700 }}>{tneaCode}</span>
                  </div>

                  {/* Call Us Pill */}
                  {isPhoneValid && (
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      style={topPillStyle}
                      aria-label={`Call department office at ${phone}`}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                      }}
                    >
                      <Phone style={{ width: "12px", height: "12px", opacity: 0.85 }} aria-hidden="true" />
                      <span>Call us :</span>
                      <span>{phone}</span>
                    </a>
                  )}

                  {/* Download Brochure Pill */}
                  {brochureUrl && (
                    <a
                      href={brochureUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      style={topPillStyle}
                      title="Download Department Brochure"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                      }}
                    >
                      <FileText style={{ width: "12px", height: "12px", opacity: 0.85 }} aria-hidden="true" />
                      <span>Download Brochure</span>
                    </a>
                  )}

                  {/* Square Hamburger Menu Button */}
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open full site navigation drawer"
                    style={burgerBtnStyle}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                    }}
                  >
                    <Menu style={{ width: "17px", height: "17px" }} aria-hidden="true" />
                  </button>
                </div>

                {/* BOTTOM TIER: Main Navigation Links */}
                <div
                  style={{
                    flex: 1,
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "clamp(12px, 1.6vw, 26px)",
                    overflow: "visible",
                  }}
                >
                  {visibleItems.map((item, idx) => (
                    <NavLink
                      key={item.id}
                      item={item}
                      isActive={isActive(item.href)}
                      isOpen={openDropdown === item.id}
                      alignRight={idx >= visibleItems.length - 3}
                      condensed={false}
                      clubs={clubs}
                      onToggle={() => handleToggle(item.id)}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CONDENSED STICKY NAVBAR (Active when scrolled past 80px) */}
            <div
              aria-hidden={!isScrolled}
              style={{
                width: "100%",
                height: `${COND_NAV_H}px`,
                display: "flex",
                alignItems: "center",
                background: "#000000",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 6px 25px rgba(0,0,0,0.65)",
                position: isScrolled ? "relative" : "absolute",
                top: 0,
                left: 0,
                opacity: isScrolled ? 1 : 0,
                pointerEvents: isScrolled ? "auto" : "none",
                transform: isScrolled ? "translateY(0)" : "translateY(-100%)",
                transition: "transform 220ms ease, opacity 200ms ease",
                zIndex: 3,
              }}
            >
              {/* White Left Badge Block */}
              <Link
                href="/"
                aria-label="TECRA home"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 18px",
                  height: "100%",
                  background: "#FFFFFF",
                  borderRight: "1px solid #E2E8F0",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="SRIET logo"
                    width={32}
                    height={32}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "19px",
                      color: "#7C1A77",
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                    }}
                  >
                    TECRA
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "9px",
                      color: "#0F172A",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginTop: "1px",
                    }}
                  >
                    Information Technology
                  </span>
                </div>
              </Link>

              {/* Black Right Nav Bar */}
              <div
                style={{
                  flex: 1,
                  background: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "clamp(10px, 1.4vw, 22px)",
                  padding: "0 18px",
                  height: "100%",
                  overflow: "visible",
                }}
              >
                {visibleItems.map((item, idx) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    isActive={isActive(item.href)}
                    isOpen={openDropdown === item.id}
                    alignRight={idx >= visibleItems.length - 3}
                    condensed={true}
                    clubs={clubs}
                    onToggle={() => handleToggle(item.id)}
                    onClose={handleClose}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open full site navigation drawer"
                  style={{
                    ...burgerBtnStyle,
                    height: "30px",
                    width: "30px",
                    marginLeft: "6px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                  }}
                >
                  <Menu style={{ width: "16px", height: "16px" }} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* NOTICE STRIP (Directly Below Desktop Navbar) */}
            <div
              aria-hidden={isScrolled}
              style={{
                width: "100%",
                height: `${NOTICE_H}px`,
                background: "#374151",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                overflow: "hidden",
                opacity: isScrolled ? 0 : 1,
                pointerEvents: isScrolled ? "none" : "auto",
                transition: "opacity 160ms ease, transform 160ms ease",
                transform: isScrolled ? "translateY(-6px)" : "translateY(0)",
                display: isScrolled ? "none" : "block",
              }}
            >
              <WordReelStrip fullWidth />
            </div>
          </div>

          {/* ============================================================
              MOBILE & TABLET (< 1024 px)
          ============================================================ */}
          <div className="lg:hidden w-full">
            {/* Mobile Bar */}
            <div
              style={{
                width: "100%",
                height: "56px",
                display: "flex",
                alignItems: "center",
                background: "#000000",
                borderBottom: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
              }}
            >
              {/* White Left Logo Block */}
              <Link
                href="/"
                aria-label="TECRA – SRIET Home"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 14px",
                  height: "100%",
                  background: "#FFFFFF",
                  borderRight: "1px solid #E2E8F0",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={logoSrc}
                    alt="SRIET logo"
                    width={30}
                    height={30}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "18px",
                      color: "#7C1A77",
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                    }}
                  >
                    TECRA
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "8.5px",
                      color: "#0F172A",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginTop: "1px",
                    }}
                  >
                    Information Technology
                  </span>
                </div>
              </Link>

              {/* Black Right Mobile Utilities */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "0 12px",
                  gap: "8px",
                }}
              >
                {/* Mobile TNEA Badge */}
                <div
                  style={{
                    ...topPillStyle,
                    height: "26px",
                    padding: "0 8px",
                    fontSize: "10.5px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>TNEA:</span>
                  <span style={{ color: "#F1C40F", fontWeight: 700 }}>{tneaCode}</span>
                </div>

                {/* Mobile Call Button */}
                {isPhoneValid && (
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    aria-label={`Call department office at ${phone}`}
                    style={{
                      ...burgerBtnStyle,
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <Phone style={{ width: "14px", height: "14px" }} aria-hidden="true" />
                  </a>
                )}

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open mobile navigation drawer"
                  style={{
                    ...burgerBtnStyle,
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <Menu style={{ width: "17px", height: "17px" }} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Mobile Notice Strip */}
            <div
              style={{
                width: "100%",
                height: "34px",
                background: "#374151",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >
              <WordReelStrip fullWidth style={{ height: "34px" }} />
            </div>
          </div>
        </nav>
      </header>

      {/* PAGE TOP SPACER
          Keeps hero poster / top content perfectly aligned under the fixed header */}
      <div
        aria-hidden="true"
        style={{
          width: "100%",
          height: isScrolled ? `${COND_NAV_H}px` : `${TOTAL_TOP_H}px`,
          transition: "height 200ms ease",
        }}
      />

      {/* FULL DRAWER MENU */}
      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        clubs={clubs}
        navItems={visibleItems}
      />
    </>
  );
}
