"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  User,
  Loader2,
  Database,
  ExternalLink,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleMobile?: () => void;
  title: string;
  subtitle?: string;
}

export function AdminHeader({
  onToggleMobile,
  title,
  subtitle,
}: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err: unknown) {
      console.error("Logout error", err);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#0B132B]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* ── LEFT SIDE: Mobile Toggle & Page Title / Subtitle ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-sand/70 hover:text-sand hover:bg-white/5 border border-white/10 transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-left min-w-0">
          <h1 className="text-base sm:text-lg font-bold font-heading text-sand tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-sand/50 hidden sm:block truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── CENTER: Institution & System Node Status ── */}
      <div className="hidden lg:flex items-center justify-center flex-1">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sand/90 font-medium">SRIET IT Central Node</span>
          <span className="text-white/20">·</span>
          <span className="text-gold font-semibold">TNEA Code 2738</span>
          <span className="text-white/20">·</span>
          <span className="text-emerald-400 text-[11px]">System Online</span>
        </div>
      </div>

      {/* ── RIGHT SIDE: Live Site Link, DB Status, Profile, and Sign Out ── */}
      <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0">
        {/* Quick Link to Public Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sand/80 hover:text-gold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 rounded-xl transition-all"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3 h-3 text-sand/50" />
        </a>

        {/* Database Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald/10 border border-emerald/20 text-[11px] font-mono text-emerald">
          <Database className="w-3 h-3 shrink-0" />
          <span>MongoDB v8</span>
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-royal-blue to-gold/70 text-midnight font-bold text-xs flex items-center justify-center ring-2 ring-white/10 shadow-sm shrink-0">
            <User className="w-4 h-4 text-midnight" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-sand leading-none">
              TECRA Admin
            </div>
            <div className="text-[10px] text-sand/50 font-mono mt-0.5">
              admin@tecra.sriet.ac.in
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of administration console"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-rose hover:bg-rose/10 border border-rose/30 hover:border-rose/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
