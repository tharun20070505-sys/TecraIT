"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, Mail, House, GraduationCap, Download, Search } from "lucide-react";
import { siteSettings } from "@/data/site";
import { defaultNavItems } from "@/data/navItems";
import { clubsData } from "@/data/clubs";
import { WordReelStrip } from "./WordReelStrip";
import { NavDrawer } from "./NavDrawer";
import "./reference-header.css";
import type { Club, DbNavItem } from "@/types";

interface NavbarProps {
  clubs?: Club[];
  notices?: never[];
  upcomingEvents?: never[];
}

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
        {item.href === "/" && <House size={18} />}<span>{item.label}</span>
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
  const [tneaCode, setTneaCode] = useState(siteSettings.tneaCode ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);
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

  // Close dropdown on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSearchOpen(false);
    setOpenDropdown(null);
    setDrawerOpen(false);
  }

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenDropdown(null); setSearchOpen(false); }
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
  const brochureUrl = siteSettings.brochurePdfUrl || "/docs/brochure.pdf";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

  const handleToggle = (id: string) =>
    setOpenDropdown((curr) => (curr === id ? null : id));
  const handleClose = () => setOpenDropdown(null);

  const visibleItems = navItems.filter((n) => n.visible).sort((a, b) => a.order - b.order);

  const results = visibleItems.flatMap(item => [item, ...item.children.filter(child => child.visible)])
    .filter(item => typeof item.label === "string" && typeof item.href === "string" && item.label.toLowerCase().includes(query.trim().toLowerCase()));

  return <>
    <header ref={navRef} className="tecra-head" data-home={pathname === "/"}>
      <div className="tecra-tools">
        <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`}><Phone />{phone}</a>
        <a href="mailto:it@rathinam.ac.in"><Mail />it@rathinam.ac.in</a>
        <a href="https://rathinam.global/"><House />Rathinam Home</a>
        <a href="https://portal.rathinam.in/"><GraduationCap />Student Portal</a>
        <span>NAAC A+</span><span>NBA</span>
        {tneaCode && tneaCode !== "2738" && <span>TNEA {tneaCode}</span>}
      </div>
      <Link href="/" className="tecra-brand">
        <Image priority width={900} height={293} className="tecra-college" src="/images/logos/rathinam-accreditation.webp"
          alt="Rathinam Institute of Technology (Autonomous), NAAC A+ and NBA" />
        <Image priority width={220} height={220} className="tecra-emblem" src="/images/logos/tecra-dragon-phoenix.webp"
          alt="TECRA" />
        <span className="tecra-dept">Department of<br />Information Technology</span>
      </Link>
      <nav className="tecra-pill" aria-label="Department navigation">
        <button className="tecra-mobile" onClick={() => setDrawerOpen(true)}><Menu /> Menu</button>
        {visibleItems.map((item, index) => <div className="tecra-desktop" key={item.id}>
          <NavLink item={item} isActive={isActive(item.href)} isOpen={openDropdown === item.id}
            alignRight={index >= visibleItems.length - 3} clubs={clubs}
            onToggle={() => handleToggle(item.id)} onClose={handleClose} />
        </div>)}
        <a className="tecra-download" href={brochureUrl} download><Download />Download Brochure</a>
        <button aria-label="Search site navigation" aria-expanded={searchOpen} onClick={() => {setSearchOpen(!searchOpen); setQuery(""); handleClose();}}><Search /></button>
        {searchOpen && <div className="tecra-search">
          <input autoFocus aria-label="Search pages" placeholder="Search pages" value={query} onChange={e => setQuery(e.target.value)} />
          {results.map((item, i) => <Link key={i} href={item.href} onClick={() => setSearchOpen(false)}>{item.label}</Link>)}
          {!results.length && <p>No matching pages</p>}
        </div>}
      </nav>
      <div className="tecra-strip"><WordReelStrip fullWidth /></div>
    </header>
    <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} clubs={clubs} navItems={visibleItems} />
  </>;
}
