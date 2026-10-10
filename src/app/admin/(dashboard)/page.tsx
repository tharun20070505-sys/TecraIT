"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Image as ImageIcon,
  Inbox,
  ArrowRight,
  Database,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Clock,
  Mail,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavbarTitlesPanel } from "@/components/admin/AdminNavbarTitlesPanel";

interface DashboardStats {
  facultyCount: number;
  eventsCount: number;
  galleryCount: number;
  messagesCount: number;
  unreadCount: number;
  recentMessages: Array<{
    _id: string;
    name: string;
    email: string;
    category: string;
    subject: string;
    createdAt: string;
    isRead: boolean;
  }>;
  isFallback: boolean;
}

export default function AdminDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    facultyCount: 0,
    eventsCount: 0,
    galleryCount: 0,
    messagesCount: 0,
    unreadCount: 0,
    recentMessages: [],
    isFallback: false,
  });

  const loadDashboardData = async () => {
    try {
      const [facultyRes, eventsRes, galleryRes, msgRes] = await Promise.all([
        fetch("/api/admin/faculty"),
        fetch("/api/admin/events"),
        fetch("/api/admin/gallery"),
        fetch("/api/admin/messages"),
      ]);

      const facultyData = facultyRes.ok ? await facultyRes.json() : { faculty: [] };
      const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };
      const galleryData = galleryRes.ok ? await galleryRes.json() : { items: [] };
      const msgData = msgRes.ok
        ? await msgRes.json()
        : { messages: [], unreadCount: 0, isFallback: false };

      setStats({
        facultyCount: facultyData.faculty?.length || 0,
        eventsCount: eventsData.events?.length || 0,
        galleryCount: galleryData.items?.length || 0,
        messagesCount: msgData.messages?.length || 0,
        unreadCount: msgData.unreadCount || 0,
        recentMessages: (msgData.messages || []).slice(0, 5),
        isFallback: !!msgData.isFallback,
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const [facultyRes, eventsRes, galleryRes, msgRes] = await Promise.all([
          fetch("/api/admin/faculty"),
          fetch("/api/admin/events"),
          fetch("/api/admin/gallery"),
          fetch("/api/admin/messages"),
        ]);

        const facultyData = facultyRes.ok ? await facultyRes.json() : { faculty: [] };
        const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };
        const galleryData = galleryRes.ok ? await galleryRes.json() : { items: [] };
        const msgData = msgRes.ok
          ? await msgRes.json()
          : { messages: [], unreadCount: 0, isFallback: false };

        if (isMounted) {
          setStats({
            facultyCount: facultyData.faculty?.length || 0,
            eventsCount: eventsData.events?.length || 0,
            galleryCount: galleryData.items?.length || 0,
            messagesCount: msgData.messages?.length || 0,
            unreadCount: msgData.unreadCount || 0,
            recentMessages: (msgData.messages || []).slice(0, 5),
            isFallback: !!msgData.isFallback,
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const metricCards = [
    {
      title: "Faculty Members",
      value: stats.facultyCount,
      subtext: "Permanent & technical staff",
      href: "/admin/faculty",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    },
    {
      title: "Events & Notices",
      value: stats.eventsCount,
      subtext: "Symposiums, hackathons & lectures",
      href: "/admin/events",
      icon: Calendar,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Gallery Photographs",
      value: stats.galleryCount,
      subtext: "Campus, lab & event records",
      href: "/admin/gallery",
      icon: ImageIcon,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Inquiries Received",
      value: stats.messagesCount,
      badge: stats.unreadCount > 0 ? `${stats.unreadCount} Unread` : null,
      subtext: "Prospective students & queries",
      href: "/admin/messages",
      icon: Inbox,
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        title="Admin Control Center"
        subtitle="Department of Information Technology, SRIET"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B132B] via-[#111C44] to-[#0B132B] border border-white/10 p-6 sm:p-8 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-gold/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TECRA IT Administrative Console</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-sand">
                Welcome back, Administrator
              </h2>
              <p className="text-xs sm:text-sm text-sand/70 max-w-2xl">
                Manage all public content for the Department of Information Technology.
                Changes take effect across public directories, event schedules, and live applicant forms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sand/80 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gold" />
                <span>Sync Data</span>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold text-midnight bg-gold hover:bg-[#e6b866] transition-all flex items-center gap-2 shadow-md shadow-gold/20"
              >
                <span>Preview Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 p-5 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose/20 text-rose border border-rose/30 font-mono">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-sand">
                    {loading ? "..." : card.value}
                  </div>
                  <div className="text-xs font-semibold text-sand/80 group-hover:text-gold transition-colors">
                    {card.title}
                  </div>
                  <div className="text-[11px] text-sand/50">{card.subtext}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-sand/60 group-hover:text-gold transition-colors">
                  <span>Manage collection</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Public Navigation Menu & Titles Hierarchy (Live Navbar Inspector) */}
        <AdminNavbarTitlesPanel />

        {/* Quick Actions & System Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Action Shortcuts */}
          <div className="lg:col-span-1 rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-heading font-bold text-sand flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-gold" />
              <span>Quick Management Actions</span>
            </h3>
            <p className="text-xs text-sand/60">
              Direct access to create new department resources.
            </p>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/admin/faculty?action=new"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-sand transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Register Faculty Member</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sand/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/events?action=new"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-sand transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Publish Event Notice</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sand/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/gallery?action=upload"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-sand transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Upload Media Asset</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sand/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/messages"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-sand transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>Review Inquiries Inbox</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sand/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* Database & Infrastructure Status */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-sand flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan" />
                <span>Data Tier & Telemetry Health</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald" />
                <span className="text-xs font-mono text-emerald">ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-sand/50">
                  Active Storage Engine
                </div>
                <div className="text-sm font-semibold text-sand flex items-center gap-2">
                  <span>MongoDB Atlas M0 / Mongoose 8</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
                </div>
                <div className="text-[11px] text-sand/60">
                  10 Defined Mongoose Schemas with resilient offline fallbacks.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-sand/50">
                  Authentication Standard
                </div>
                <div className="text-sm font-semibold text-sand flex items-center gap-2">
                  <span>Web Crypto HMAC-SHA256</span>
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                </div>
                <div className="text-[11px] text-sand/60">
                  Edge Runtime compatible session signing via HTTP-only cookie.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-sand/50">
                  Department Entity
                </div>
                <div className="text-sm font-semibold text-sand">
                  TECRA, Department of Information Technology
                </div>
                <div className="text-[11px] text-sand/60">
                  SRIET Coimbatore, Affiliated to Anna University, Chennai
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-sand/50">
                  Hosting and CDN Pipeline
                </div>
                <div className="text-sm font-semibold text-sand flex items-center gap-2">
                  <span>Vercel Edge Global Network</span>
                </div>
                <div className="text-[11px] text-sand/60">
                  Next.js App Router 16.3.8 and React 19.2.8
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Inquiries Inbox Preview */}
        <div className="rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-heading font-bold text-sand flex items-center gap-2">
                <Inbox className="w-4 h-4 text-gold" />
                <span>Recent Contact Inquiries</span>
              </h3>
              <p className="text-xs text-sand/60 mt-0.5">
                Latest submissions from prospective students, academics, and partners.
              </p>
            </div>
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
            >
              <span>Open Full Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats.recentMessages.length === 0 ? (
              <div className="py-8 text-center text-xs text-sand/50">
                No inquiries received yet. New submissions will appear here.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-sand/40 font-mono uppercase text-[10px]">
                    <th className="py-3 px-3 text-left">Sender (Left)</th>
                    <th className="py-3 px-3 text-center">Category (Center)</th>
                    <th className="py-3 px-3 text-left">Subject (Left)</th>
                    <th className="py-3 px-3 text-center">Date (Center)</th>
                    <th className="py-3 px-3 text-right">Status (Right)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentMessages.map((msg) => (
                    <tr
                      key={msg._id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* 1. Sender (Left) */}
                      <td className="py-3 px-3 text-left">
                        <div className="font-semibold text-sand">{msg.name}</div>
                        <div className="text-[11px] text-sand/50 font-mono">
                          {msg.email}
                        </div>
                      </td>

                      {/* 2. Category (Center) */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-sand/80 text-[10px] font-mono border border-white/10">
                          {msg.category || "General"}
                        </span>
                      </td>

                      {/* 3. Subject (Left) */}
                      <td className="py-3 px-3 text-left max-w-xs truncate text-sand/80">
                        {msg.subject}
                      </td>

                      {/* 4. Date (Center) */}
                      <td className="py-3 px-3 text-center text-sand/50 font-mono text-[11px] whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Clock className="w-3 h-3 text-sand/40" />
                          <span>
                            {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* 5. Status (Right) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {msg.isRead ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-sand/10 text-sand/60 text-[10px]">
                            Read
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose/20 text-rose text-[10px] font-bold border border-rose/30">
                            New
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
