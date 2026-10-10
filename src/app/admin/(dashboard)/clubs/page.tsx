"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Users,
  ImageIcon,
  Search,
  ExternalLink,
  Loader2,
  Film,
  Sparkles,
  ShieldAlert,
  Edit3,
} from "lucide-react";

interface ClubItemSummary {
  id: string;
  slug: string;
  name: string;
  type: "technical" | "non-technical";
  logoUrl: string;
  shortDescription: string;
  memberCount: number;
  imageCount: number;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "technical" | "non-technical">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/clubs");
      if (!res.ok) {
        throw new Error("Unable to load clubs data");
      }
      const data = await res.json();
      setClubs(data.clubs || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading clubs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/clubs");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setClubs(data.clubs || []);
        } else {
          if (mounted) setError("Unable to load clubs data");
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "Error loading clubs";
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070B18]">
      <AdminHeader
        title="Clubs and Societies Administration"
        subtitle="Manage technical societies, creative chapters, image reels, and student rosters"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Navigation Shortcut Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/logo-reel"
            className="group p-5 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#121E42] border border-white/10 hover:border-gold/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-sand group-hover:text-gold transition-colors font-heading">
                  Club Logo Reel
                </h2>
                <p className="text-xs text-sand/60 mt-0.5">
                  Configure seamless scrolling logos, speed, height, and custom affiliations
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-gold/20 text-sand group-hover:text-gold border border-white/10 transition-colors">
              Manage Reel
            </span>
          </Link>

          <Link
            href="/admin/it-association"
            className="group p-5 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#121E42] border border-white/10 hover:border-royal-blue/50 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-royal-blue/20 text-sand border border-royal-blue/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-sand group-hover:text-gold transition-colors font-heading">
                  Information Technology Association Logo
                </h2>
                <p className="text-xs text-sand/60 mt-0.5">
                  Upload primary and dark theme emblems with real size previews
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-gold/20 text-sand group-hover:text-gold border border-white/10 transition-colors">
              Manage Logo
            </span>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0B132B] p-4 rounded-2xl border border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-sand/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club by name or slug"
              className="w-full bg-[#070B18] border border-white/10 text-sand text-xs rounded-xl pl-9 pr-4 py-2.5 focus:border-gold focus:outline-hidden transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "all"
                  ? "bg-gold/20 text-gold border-gold/40"
                  : "bg-white/5 text-sand/70 border-white/10 hover:bg-white/10"
              }`}
            >
              All Chapters
            </button>
            <button
              onClick={() => setFilterType("technical")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "technical"
                  ? "bg-emerald/20 text-emerald border-emerald/40"
                  : "bg-white/5 text-sand/70 border-white/10 hover:bg-white/10"
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setFilterType("non-technical")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "non-technical"
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                  : "bg-white/5 text-sand/70 border-white/10 hover:bg-white/10"
              }`}
            >
              Non Technical
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose/10 border border-rose/30 flex items-center justify-between text-xs text-rose">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchClubs}
              className="underline hover:no-underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-sand/60">
            <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
            <p className="text-xs font-mono">Loading clubs and societies records</p>
          </div>
        )}

        {/* Clubs Grid */}
        {!loading && filteredClubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map((club) => {
              const hasLogo =
                club.logoUrl &&
                !club.logoUrl.includes("placeholder") &&
                club.logoUrl.trim() !== "";

              return (
                <div
                  key={club.id}
                  className="bg-[#0B132B] rounded-2xl border border-white/10 p-5 flex flex-col justify-between hover:border-gold/30 transition-all shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Club Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-[#070B18] border border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                        {hasLogo ? (
                          <Image
                            src={club.logoUrl}
                            alt={`${club.name} emblem`}
                            width={44}
                            height={44}
                            className="object-contain"
                          />
                        ) : (
                          <div className="text-[10px] text-sand/40 font-mono text-center">
                            No Logo
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            club.type === "technical"
                              ? "bg-emerald/15 text-emerald border-emerald/30"
                              : "bg-teal-500/15 text-teal-300 border-teal-500/30"
                          }`}
                        >
                          {club.type === "technical" ? "Technical" : "Creative"}
                        </span>
                        {!hasLogo && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Logo missing
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title and Short Description */}
                    <div>
                      <h3 className="font-heading font-bold text-base text-sand">
                        {club.name}
                      </h3>
                      <p className="text-xs text-sand/60 line-clamp-2 mt-1 leading-relaxed">
                        {club.shortDescription}
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-sand/80">
                        <Users className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{club.memberCount} Members</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 text-sand/80">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald shrink-0" />
                        <span>{club.imageCount} Images</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/clubs/${club.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Manage Club</span>
                    </Link>

                    <Link
                      href={`/clubs/${club.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand border border-white/10 transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && filteredClubs.length === 0 && (
          <div className="py-20 text-center bg-[#0B132B] rounded-2xl border border-white/10 p-8">
            <Users className="w-10 h-10 text-sand/30 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-sand">No clubs matching search criteria</h3>
            <p className="text-xs text-sand/60 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or switching the category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
