/**
 * Static default nav items — browser-safe, no Mongoose dependencies.
 * Used as a client-side fallback when the API is unavailable.
 */
import type { DbNavItem } from "@/types";

export const defaultNavItems: DbNavItem[] = [
  { id: "nav-home", label: "Home", href: "/", type: "page", autoSource: null, children: [], order: 1, visible: true, isSystem: true },
  {
    id: "nav-about",
    label: "About Department",
    href: "/about",
    type: "dropdown",
    autoSource: null,
    children: [
      { label: "Department Overview", href: "/about", order: 1, visible: true },
      { label: "Vision, Mission and Goals", href: "/about#vision", order: 2, visible: true },
      { label: "Program Outcomes", href: "/about#peo-pso", order: 3, visible: true },
      { label: "Laboratories", href: "/about#laboratories", order: 4, visible: true },
      { label: "Advisory Board", href: "/about#advisory-board", order: 5, visible: true },
    ],
    order: 2,
    visible: true,
    isSystem: true,
  },
  { id: "nav-faculty", label: "Faculty", href: "/faculty", type: "page", autoSource: null, children: [], order: 3, visible: true, isSystem: true },
  {
    id: "nav-student-life",
    label: "Student Life",
    href: "/student-life",
    type: "dropdown",
    autoSource: null,
    children: [
      { label: "IT Association", href: "/student-life/it-association", order: 1, visible: true },
      { label: "Alumni", href: "/alumni", order: 2, visible: true },
      { label: "Achievements", href: "/achievements", order: 3, visible: true },
      { label: "Placements", href: "/placements", order: 4, visible: true },
      { label: "Campus Life", href: "/campus-life", order: 5, visible: true },
    ],
    order: 4,
    visible: true,
    isSystem: true,
  },
  {
    id: "nav-clubs",
    label: "Clubs",
    href: "/clubs",
    type: "auto",
    autoSource: "clubs",
    children: [
      { label: "TechNexus", href: "/clubs/technexus", order: 1, visible: true },
      { label: "Aesthetic AI Club", href: "/clubs/aesthetic-ai-club", order: 2, visible: true },
      { label: "Fine Arts Club", href: "/clubs/fine-arts-club", order: 3, visible: true },
      { label: "Media Club", href: "/clubs/media-club", order: 4, visible: true },
    ],
    order: 5,
    visible: true,
    isSystem: true,
  },
  { id: "nav-gallery", label: "Gallery", href: "/gallery", type: "page", autoSource: null, children: [], order: 6, visible: true, isSystem: true },
  { id: "nav-events", label: "Events", href: "/events", type: "page", autoSource: null, children: [], order: 7, visible: true, isSystem: true },
  { id: "nav-contact", label: "Contact", href: "/contact", type: "page", autoSource: null, children: [], order: 8, visible: true, isSystem: true },
];
