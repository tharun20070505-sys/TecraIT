"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  Image as ImageIcon,
  Inbox,
  Activity,
  Settings,
  ExternalLink,
  ShieldCheck,
  X,
  ChevronRight,
  Navigation,
  Film,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount?: number;
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Faculty Directory",
    href: "/admin/faculty",
    icon: Users,
    badge: null,
  },
  {
    name: "Events",
    href: "/admin/events",
    icon: Calendar,
    badge: null,
  },
  {
    name: "Notices & Announcements",
    href: "/admin/notices",
    icon: Bell,
    badge: null,
  },
  {
    name: "Gallery Media",
    href: "/admin/gallery",
    icon: ImageIcon,
    badge: null,
  },
  {
    name: "Clubs & Societies",
    href: "/admin/clubs",
    icon: Users,
    badge: null,
  },
  {
    name: "Logo Reel",
    href: "/admin/logo-reel",
    icon: Film,
    badge: null,
  },
  {
    name: "IT Association",
    href: "/admin/it-association",
    icon: Sparkles,
    badge: null,
  },
  {
    name: "Inquiries Inbox",
    href: "/admin/messages",
    icon: Inbox,
    badge: "unread",
  },
  {
    name: "Navbar Titles",
    href: "/admin/navbar",
    icon: Navigation,
    badge: null,
  },
  {
    name: "Site Settings",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
  {
    name: "System Health",
    href: "/admin/system-health",
    icon: Activity,
    badge: "Live",
  },
];

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  unreadCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#0B132B] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-blue/30 via-midnight to-gold/20 border border-gold/40 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm tracking-wide text-sand flex items-center gap-1.5">
                <span>TECRA</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-mono">
                  ADMIN
                </span>
              </div>
              <div className="text-[11px] text-sand/50">Dept. of IT, SRIET</div>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-sand/60 hover:text-sand hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-sand/40">
            Administrative Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-royal-blue/30 to-gold/15 text-sand border border-gold/40 shadow-sm"
                    : "text-sand/70 hover:text-sand hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? "text-gold"
                        : "text-sand/50 group-hover:text-sand/80"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {/* Badges */}
                {item.badge === "unread" && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose text-white">
                    {unreadCount}
                  </span>
                )}
                {item.badge === "Live" && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald/15 text-emerald border border-emerald/30">
                    Live
                  </span>
                )}
                {active && !item.badge && (
                  <ChevronRight className="w-3.5 h-3.5 text-gold shrink-0" />
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-sand/40">
            Public Website
          </div>

          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sand/70 hover:text-gold hover:bg-white/5 border border-transparent transition-all"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-sand/50 group-hover:text-gold" />
              <span>View Live Website</span>
            </div>
            <span className="text-[10px] text-sand/40 font-mono">↗</span>
          </Link>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-white/10 bg-[#070B18]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-sand truncate">
                Admin Console
              </div>
              <div className="text-[10px] text-emerald font-mono">
                Session Active
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
