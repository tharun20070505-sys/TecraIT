"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ChevronDown, Phone, FileText } from "lucide-react";
import { siteSettings } from "@/data/site";
import { defaultNavItems } from "@/data/navItems";
import { clubsData } from "@/data/clubs";
import type { Club, DbNavItem } from "@/types";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clubs?: Club[];
  /** Resolved nav items from the Navbar (includes auto-populated clubs). */
  navItems?: DbNavItem[];
}

export function NavDrawer({ isOpen, onClose, clubs = [], navItems = [] }: NavDrawerProps) {
  const pathname = usePathname();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const logoSrc = siteSettings.srietLogoSrc || "/images/logos/sriet-logo.png";
  const phone = siteSettings.officePhone || siteSettings.departmentOffice?.phone || "";
  const isPhoneValid =
    phone &&
    !phone.toLowerCase().includes("content") &&
    !phone.toLowerCase().includes("required");
  const brochureUrl = siteSettings.brochurePdfUrl?.trim() || "";
  const social = siteSettings.socialLinks || {};

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const activeClubs = clubs.length > 0 ? clubs : clubsData;
  const allItems = navItems.length > 0 ? navItems : defaultNavItems;

  // Merge clubs into any "auto" club dropdown (fallback if navItems is already resolved)
  const resolvedItems = allItems.map((item) => {
    if (item.type === "auto" && item.autoSource === "clubs") {
      const existingChildren = item.children.filter((c) => c.visible);
      if (existingChildren.length === 0) {
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
    }
    return item;
  });

  const visibleItems = resolvedItems.filter((n) => n.visible).sort((a, b) => a.order - b.order);

  // Base link classes
  const linkBase =
    "flex items-center justify-between px-4 py-3 min-h-[48px] text-[15px] font-[var(--font-heading)] font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[-2px] rounded-lg";
  const activeLinkBase = `${linkBase} bg-white/10 text-white border-l-[3px] border-gold`;
  const inactiveLinkBase = `${linkBase} text-white/90 hover:bg-white/5 hover:text-white`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation menu"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer panel */}
      <div className="relative z-10 w-full max-w-[400px] bg-black text-white flex flex-col h-full overflow-y-auto border-l border-[#6E6E6E]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#6E6E6E] shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            aria-label="TECRA home"
          >
            <div className="relative h-9 w-9 bg-white p-0.5 shrink-0 flex items-center justify-center">
              <Image src={logoSrc} alt="SRIET logo" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <div
                className="font-[var(--font-merriweather)] font-black text-white leading-none"
                style={{ fontSize: "22px" }}
              >
                TECRA
              </div>
              <div className="font-[var(--font-source-sans)] font-bold text-[11px] uppercase tracking-wider text-[#BDBDBD] mt-0.5">
                Information Technology
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-[44px] h-[44px] flex items-center justify-center bg-[#6E6E6E] text-white hover:bg-[#585858] transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Utility buttons ──────────────────────────────────────────────── */}
        {(isPhoneValid || brochureUrl) && (
          <div className="px-5 py-4 border-b border-[#6E6E6E] space-y-2.5 shrink-0">
            {isPhoneValid && (
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 rounded-full bg-[#6E6E6E] text-white font-[var(--font-source-sans)] font-bold text-[14px] hover:bg-[#585858] transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Call us</span>
                <span className="text-white/50 mx-1" aria-hidden="true">|</span>
                <span>{phone}</span>
              </a>
            )}
            {brochureUrl && (
              <a
                href={brochureUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 rounded-full border border-[#6E6E6E] text-white font-[var(--font-source-sans)] font-bold text-[14px] hover:bg-[#1A1A1A] transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Department Brochure</span>
              </a>
            )}
          </div>
        )}

        {/* ── Navigation links ──────────────────────────────────────────────── */}
        <nav className="flex-1 px-4 py-4 space-y-0.5" aria-label="Drawer navigation">
          {visibleItems.map((item) => {
            const hasChildren =
              (item.type === "dropdown" || item.type === "auto") &&
              item.children.filter((c) => c.visible).length > 0;
            const active = isActive(item.href);
            const expanded = expandedIds.has(item.id);

            if (!hasChildren) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={active ? activeLinkBase : inactiveLinkBase}
                >
                  <span>{item.label}</span>
                </Link>
              );
            }

            const visibleChildren = item.children
              .filter((c) => c.visible)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={item.id} className="border-b border-white/5 last:border-b-0 pb-1">
                {/* Section heading row - Touching ANYWHERE on the row expands the dropdown details */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={expanded}
                  aria-label={expanded ? `Collapse ${item.label} details` : `Expand ${item.label} details`}
                  className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] text-[15px] font-[var(--font-heading)] font-semibold transition-all rounded-lg select-none cursor-pointer ${
                    expanded
                      ? "bg-white/10 text-white border border-white/15 shadow-sm"
                      : active
                      ? "bg-[#1A1A1A] text-white border-l-[3px] border-gold"
                      : "text-white/90 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-sand/70 border border-white/10">
                      {visibleChildren.length} items
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-sand/80 transition-transform duration-200 shrink-0 ${
                      expanded ? "rotate-180 text-gold" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown details revealed on touch */}
                {expanded && (
                  <div className="pl-3 pr-1 py-1.5 ml-3 border-l-2 border-gold/40 mt-1 space-y-1 bg-white/[0.02] rounded-r-lg">
                    {/* Parent Overview Link */}
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 min-h-[44px] text-[13px] font-[var(--font-heading)] font-bold text-gold hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      <span>{item.type === "auto" ? "Explore All Clubs" : `${item.label} Overview`}</span>
                      <span className="text-xs">→</span>
                    </Link>

                    {/* Sub-items */}
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`flex items-center px-3 py-2.5 min-h-[44px] text-[13.5px] font-[var(--font-body)] font-medium transition-colors rounded-md ${
                          isActive(child.href)
                            ? "text-white bg-gold/20 font-semibold border-l-2 border-gold pl-2.5"
                            : "text-[#D1D5DB] hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="mr-2 text-gold/60 text-xs">›</span>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Footer: privacy + social ────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-[#6E6E6E] space-y-3 shrink-0">
          <div className="flex items-center justify-between text-[13px] text-[#BDBDBD]">
            <Link
              href="/privacy"
              onClick={onClose}
              className="hover:text-white underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Privacy Policy
            </Link>
            <span>SRIET IT Dept</span>
          </div>

          {/* Social links */}
          {(social.linkedin || social.instagram || social.twitter || social.youtube) && (
            <div className="flex items-center gap-2 flex-wrap">
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="px-3 py-1.5 text-[12px] font-semibold text-[#BDBDBD] border border-[#6E6E6E] hover:text-white hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  LinkedIn
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="px-3 py-1.5 text-[12px] font-semibold text-[#BDBDBD] border border-[#6E6E6E] hover:text-white hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Instagram
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="px-3 py-1.5 text-[12px] font-semibold text-[#BDBDBD] border border-[#6E6E6E] hover:text-white hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Twitter
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="px-3 py-1.5 text-[12px] font-semibold text-[#BDBDBD] border border-[#6E6E6E] hover:text-white hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
