"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavbarTitlesPanel } from "@/components/admin/AdminNavbarTitlesPanel";
import { HeroImagesManager } from "@/components/admin/HeroImagesManager";
import { HeroTitleFade } from "@/components/home/HeroTitleFade";
import {
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Phone,
  FileText,
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  Save,
  X,
} from "lucide-react";
import type { BrandReelItem, NavbarBadgeLogo } from "@/types";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Settings State
  const [tneaCode, setTneaCode] = useState("2738");
  const [officePhone, setOfficePhone] = useState("");
  const [highlightPillText, setHighlightPillText] = useState("");
  const [brochurePdfUrl, setBrochurePdfUrl] = useState("");
  const [srietLogoSrc, setSrietLogoSrc] = useState("/images/logos/sriet-logo.png");
  const [navbarBadgeLogos, setNavbarBadgeLogos] = useState<NavbarBadgeLogo[]>([]);
  const [brandReel, setBrandReel] = useState<BrandReelItem[]>([]);

  // Hero Title Switch State
  const [heroTitleLineOne, setHeroTitleLineOne] = useState("TECRA");
  const [heroTitleLineTwo, setHeroTitleLineTwo] = useState("Department of Information Technology");
  const [heroTextSeconds, setHeroTextSeconds] = useState(3);
  const [previewPaused, setPreviewPaused] = useState(false);

  // Hero Image State
  // Logo file input ref
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  // Brochure file input ref
  const brochureFileInputRef = useRef<HTMLInputElement>(null);
  // Badge file input ref
  const badgeFileInputRef = useRef<HTMLInputElement>(null);
  const [newBadgeAlt, setNewBadgeAlt] = useState("");

  // New Brand Word State
  const [newWordText, setNewWordText] = useState("");


  useEffect(() => {
    let ignore = false;
    const loadSettings = async () => {
      try {
        const resSettings = await fetch("/api/admin/settings");
        if (resSettings.ok) {
          const data = await resSettings.json();
          if (ignore) return;
          const s = data.settings || {};
          setTneaCode(s.tneaCode || "2738");
          setOfficePhone(s.officePhone || "");
          setHighlightPillText(s.highlightPillText || "");
          setBrochurePdfUrl(s.brochurePdfUrl || "");
          setSrietLogoSrc(s.srietLogoSrc || "/images/logos/sriet-logo.png");
          setNavbarBadgeLogos(s.navbarBadgeLogos || []);
          setBrandReel(
            s.brandReel || [
              { id: "br-1", text: "TECRA", order: 1, active: true },
              { id: "br-2", text: "Department of Information Technology", order: 2, active: true },
              { id: "br-3", text: "Sri Ranganathar Institute of Engineering and Technology", order: 3, active: true },
              { id: "br-4", text: "Rathinam Group of Institutions", order: 4, active: true },
            ]
          );
          if (s.heroTitleLineOne) setHeroTitleLineOne(s.heroTitleLineOne);
          if (s.heroTitleLineTwo) setHeroTitleLineTwo(s.heroTitleLineTwo);
          if (s.heroTextSeconds) setHeroTextSeconds(Math.max(2, Math.min(6, Number(s.heroTextSeconds) || 3)));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  // Save General Site Settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tneaCode,
          officePhone,
          highlightPillText,
          brochurePdfUrl,
          srietLogoSrc,
          navbarBadgeLogos,
          brandReel,
          heroTitleLineOne,
          heroTitleLineTwo,
          heroTextSeconds,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setStatusMessage({
        type: "success",
        text: "Website and navigation settings updated successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update settings";
      setStatusMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload Generic File (Brochure PDF / Badge Image / Logo)
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "File upload failed");
    }
    const data = await res.json();
    return data.url as string;
  };

  // SRIET Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await handleFileUpload(file);
      setSrietLogoSrc(url);
      setStatusMessage({
        type: "success",
        text: "SRIET logo updated. Click 'Save Settings' to apply changes.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload logo";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Brochure PDF Upload
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await handleFileUpload(file);
      setBrochurePdfUrl(url);
      setStatusMessage({
        type: "success",
        text: "Brochure PDF uploaded. Click 'Save Settings' to apply changes.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload brochure";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Add Badge Logo
  const handleAddBadge = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await handleFileUpload(file);
      const newBadge: NavbarBadgeLogo = {
        id: `badge-${Date.now()}`,
        url,
        alt: newBadgeAlt || "Accreditation Logo",
        order: (navbarBadgeLogos.length + 1) * 10,
      };
      setNavbarBadgeLogos([...navbarBadgeLogos, newBadge]);
      setNewBadgeAlt("");
      if (badgeFileInputRef.current) badgeFileInputRef.current.value = "";
      setStatusMessage({
        type: "success",
        text: "Badge added. Click 'Save Settings' to commit.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add badge";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const removeBadge = (id: string) => {
    setNavbarBadgeLogos(navbarBadgeLogos.filter((b) => b.id !== id));
  };

  // Brand Reel Word Management
  const handleAddWord = () => {
    if (!newWordText.trim()) return;
    const newWord: BrandReelItem = {
      id: `br-${Date.now()}`,
      text: newWordText.trim(),
      order: (brandReel.length + 1) * 10,
      active: true,
    };
    setBrandReel([...brandReel, newWord]);
    setNewWordText("");
  };

  const removeWord = (id: string) => {
    setBrandReel(brandReel.filter((w) => w.id !== id));
  };

  const toggleWordActive = (id: string) => {
    setBrandReel(
      brandReel.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const moveWord = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= brandReel.length) return;
    const updated = [...brandReel];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setBrandReel(updated);
  };

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Site Settings & Assets"
        subtitle="Manage navbar branding, contact pills, brand reel, brochure, and hero imagery"
      />

      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,48px)),1400px)] mx-auto mt-8 space-y-8">
        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-[3px] border flex items-center gap-3 text-[14px] ${
              statusMessage.type === "success"
                ? "bg-emerald-deep/40 border-emerald/50 text-sand"
                : "bg-burgundy-deep/40 border-burgundy/50 text-white"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-coral shrink-0" />
            )}
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="ml-auto text-sand/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Save Button Banner */}
        <div className="flex items-center justify-between bg-midnight border border-gold/30 rounded-[3px] p-4">
          <div className="text-[13px] text-sand/80">
            Ensure you click <strong className="text-gold">Save All Settings</strong> after modifying navigation pills, logos, or brand words.
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold text-[14px] rounded-[2px] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>Save All Settings</span>
          </button>
        </div>

        {/* SECTION 1: HEADER PILLS & CONTACT INFO */}
        <div className="bg-midnight border border-sand/20 rounded-[3px] p-6 lg:p-8 space-y-6">
          <div className="border-b border-sand/15 pb-4">
            <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-gold" />
              <span>Navbar Action Pills (Top Row)</span>
            </h2>
            <p className="text-[13px] text-sand/75 mt-1">
              Pills display in the upper right row of the navbar. They are hidden automatically when fields are empty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[14px]">
            {/* Pill 1: TNEA Counselling Code */}
            <div className="space-y-2">
              <label className="block font-semibold text-sand">
                Pill 1: TNEA Counselling Code
              </label>
              <input
                type="text"
                placeholder="e.g. 2738"
                value={tneaCode}
                onChange={(e) => setTneaCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold font-mono text-[13px]"
              />
              <span className="text-[12px] text-sand/60 block">
                Official TNEA code displayed in the top pill.
              </span>
            </div>

            {/* Pill 2: Office Phone */}
            <div className="space-y-2">
              <label className="block font-semibold text-sand">
                Pill 2: Office Phone Number (&quot;Call us&quot;)
              </label>
              <input
                type="text"
                placeholder="e.g. +91 422 269 7799 (Leave empty to hide)"
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold font-mono text-[13px]"
              />
              <span className="text-[12px] text-sand/60 block">
                Rule: No invented numbers. Hidden if left blank.
              </span>
            </div>

            {/* Pill 3: Optional Highlight Text */}
            <div className="space-y-2">
              <label className="block font-semibold text-sand">
                Pill 3: Optional Highlight Text
              </label>
              <input
                type="text"
                placeholder="e.g. Admissions Open 2026-27 (Leave empty to hide)"
                value={highlightPillText}
                onChange={(e) => setHighlightPillText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold"
              />
              <span className="text-[12px] text-sand/60 block">
                Appears as a prominent pill on the top row if provided.
              </span>
            </div>
          </div>

          {/* Pill 2: Department Brochure PDF Upload */}
          <div className="border-t border-sand/10 pt-4 space-y-3 text-[14px]">
            <label className="block font-semibold text-sand flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold" />
              <span>Pill 2: Department Brochure (PDF Document)</span>
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={brochureFileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleBrochureUpload}
                className="hidden"
                id="brochure-file-input"
              />
              <label
                htmlFor="brochure-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-deep-navy hover:bg-deep-navy/80 text-sand hover:text-white border border-sand/30 rounded-[2px] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-gold" />
                <span>Upload New Brochure PDF</span>
              </label>

              {brochurePdfUrl ? (
                <div className="flex items-center gap-3">
                  <a
                    href={brochurePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-gold hover:underline flex items-center gap-1"
                  >
                    <span>View Current Brochure</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setBrochurePdfUrl("")}
                    className="text-coral hover:text-white text-[12px] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-[13px] text-sand/50">
                  No brochure uploaded. (Pill 2 is currently hidden).
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: BRAND REEL WORDS (Continuous Word Reel Strip) */}
        <div className="bg-midnight border border-sand/20 rounded-[3px] p-6 lg:p-8 space-y-6">
          <div className="border-b border-sand/15 pb-4">
            <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-gold" />
              <span>Notice Strip / Brand Word Reel</span>
            </h2>
            <p className="text-[13px] text-sand/75 mt-1">
              Words scroll in the continuous burgundy strip below the navbar at 60px/second, separated by gold CSS diamonds.
            </p>
          </div>

          {/* Words List */}
          <div className="space-y-3">
            {brandReel.map((w, index) => (
              <div
                key={w.id}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_100px] items-center gap-3 p-3 rounded-lg bg-deep-navy border border-sand/20 text-[14px]"
              >
                {/* Left side: Index & Word Text */}
                <div className="flex items-center gap-3 text-left min-w-0">
                  <span className="w-6 h-6 rounded-full bg-sand/15 text-sand flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={w.text}
                    onChange={(e) => {
                      const updated = [...brandReel];
                      updated[index].text = e.target.value;
                      setBrandReel(updated);
                    }}
                    className="w-full bg-transparent border-b border-sand/30 text-white font-heading font-bold uppercase tracking-wider text-[14px] focus:border-gold outline-none px-1 py-0.5"
                  />
                </div>

                {/* Center: Active/Hidden Status Toggle */}
                <div className="flex items-center justify-center text-center">
                  <button
                    type="button"
                    onClick={() => toggleWordActive(w.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      w.active
                        ? "bg-emerald/15 text-emerald-300 border border-emerald/30"
                        : "bg-sand/10 text-sand/50 border border-sand/20"
                    }`}
                  >
                    {w.active ? "Active" : "Hidden"}
                  </button>
                </div>

                {/* Right side: Reorder & Remove Actions */}
                <div className="flex items-center justify-end gap-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => moveWord(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-sand hover:text-white disabled:opacity-20 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWord(index, "down")}
                    disabled={index === brandReel.length - 1}
                    className="p-1.5 text-sand hover:text-white disabled:opacity-20 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWord(w.id)}
                    className="p-1.5 text-coral hover:text-white transition-colors"
                    title="Remove word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Word Row */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="text"
              placeholder="Add another brand word or title..."
              value={newWordText}
              onChange={(e) => setNewWordText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddWord();
                }
              }}
              className="flex-1 px-3.5 py-2 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold text-[14px]"
            />
            <button
              type="button"
              onClick={handleAddWord}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-[2px] text-[13px] font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Word</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: LOGOS MODULE (SRIET Logo & Optional Navbar Badges) */}
        <div className="bg-midnight border border-sand/20 rounded-[3px] p-6 lg:p-8 space-y-6">
          <div className="border-b border-sand/15 pb-4">
            <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" />
              <span>Logos & Accreditation Badges</span>
            </h2>
            <p className="text-[13px] text-sand/75 mt-1">
              Manage the SRIET College logo and optional badges shown in the left white panel of the navbar.
            </p>
          </div>

          {/* SRIET Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[2px] bg-deep-navy/40 border border-sand/15">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-[2px] p-1.5 flex items-center justify-center border border-sand/30 shrink-0">
                <Image
                  src={srietLogoSrc}
                  alt="SRIET Logo"
                  width={48}
                  height={48}
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-semibold text-white block text-[15px]">
                  SRIET College Logo (Navbar Left Panel)
                </span>
                <span className="text-[12px] text-sand/60 font-mono">{srietLogoSrc}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-file-input"
              />
              <label
                htmlFor="logo-file-input"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-deep-navy hover:bg-deep-navy/80 text-sand hover:text-white border border-sand/25 rounded-[2px] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-gold" />
                <span>Replace Logo PNG</span>
              </label>

              {srietLogoSrc !== "/images/logos/sriet-logo.png" && (
                <button
                  type="button"
                  onClick={() => setSrietLogoSrc("/images/logos/sriet-logo.png")}
                  className="text-coral hover:text-white text-[12px] underline"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>

          {/* Optional Badges */}
          <div className="space-y-4 pt-2">
            <div>
              <span className="font-semibold text-sand block text-[14px]">
                Optional Navbar Badges (Accreditation / Group Logos)
              </span>
              <span className="text-[12px] text-sand/65 block">
                Rule: Do not show any badges by default. Only logos added by admin will appear.
              </span>
            </div>

            {navbarBadgeLogos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {navbarBadgeLogos.map((badge) => (
                  <div
                    key={badge.id}
                    className="relative bg-deep-navy p-3 rounded-[2px] border border-sand/20 flex flex-col items-center gap-2 text-center"
                  >
                    <div className="relative w-12 h-12 bg-white/10 rounded-[2px] flex items-center justify-center p-1">
                      <Image
                        src={badge.url}
                        alt={badge.alt}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[12px] text-sand/80 truncate w-full">
                      {badge.alt}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBadge(badge.id)}
                      className="text-coral hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-sand/50 italic">
                No badges uploaded. The left panel shows only the SRIET logo and department typography.
              </p>
            )}

            {/* Add Badge Input */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                type="text"
                placeholder="Badge description (e.g. NAAC / NBA)"
                value={newBadgeAlt}
                onChange={(e) => setNewBadgeAlt(e.target.value)}
                className="px-3.5 py-1.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white text-[13px] outline-none focus:border-gold"
              />
              <input
                ref={badgeFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAddBadge}
                className="hidden"
                id="badge-file-input"
              />
              <label
                htmlFor="badge-file-input"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-[2px] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Badge Logo</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION: HERO TITLE & TEXT SWITCH ANIMATION */}
        <div className="bg-midnight border border-sand/20 rounded-[3px] p-6 lg:p-8 space-y-6">
          <div className="border-b border-sand/15 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span>Hero Title & Text Switch Animation</span>
              </h2>
              <p className="text-[13px] text-sand/75 mt-1">
                Configure the rotating hero titles. Timing is drift-corrected with performance.now.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12px] bg-deep-navy px-3 py-1.5 rounded-[2px] border border-sand/20 text-gold font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span>Live Switching: {heroTextSeconds}s per text ({heroTextSeconds * 2}s full cycle)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[14px]">
            {/* Left Column: Form Controls */}
            <div className="space-y-5">
              {/* Line 1 */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-sand flex items-center justify-between">
                  <span>Hero Text Line One</span>
                  <span className="text-[12px] text-sand/50 font-normal">Slot 1 (Letters stagger in)</span>
                </label>
                <input
                  type="text"
                  value={heroTitleLineOne}
                  onChange={(e) => setHeroTitleLineOne(e.target.value)}
                  placeholder="TECRA"
                  className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold font-mono text-[13px]"
                />
                <p className="text-[12px] text-sand/60">
                  Default: <strong className="text-sand/80">TECRA</strong>. Letters fade in from blur (70ms stagger, 550ms each, rising 14px).
                </p>
              </div>

              {/* Line 2 */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-sand flex items-center justify-between">
                  <span>Hero Text Line Two</span>
                  <span className="text-[12px] text-sand/50 font-normal">Slot 2 (Words stagger in)</span>
                </label>
                <input
                  type="text"
                  value={heroTitleLineTwo}
                  onChange={(e) => setHeroTitleLineTwo(e.target.value)}
                  placeholder="Department of Information Technology"
                  className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold font-mono text-[13px]"
                />
                <p className="text-[12px] text-sand/60">
                  Default: <strong className="text-sand/80">Department of Information Technology</strong>. Words fade in from blur (90ms stagger, 550ms each, rising 14px).
                </p>
              </div>

              {/* Seconds Per Text Slider & Number */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-sand">
                    Switch Interval (Seconds per text)
                  </label>
                  <span className="font-mono text-gold font-bold text-[15px] bg-deep-navy px-2.5 py-0.5 rounded-[2px] border border-gold/30">
                    {heroTextSeconds}s
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={2}
                    max={6}
                    step={0.5}
                    value={heroTextSeconds}
                    onChange={(e) => setHeroTextSeconds(Number(e.target.value))}
                    className="flex-1 accent-gold cursor-pointer"
                  />
                  <input
                    type="number"
                    min={2}
                    max={6}
                    step={0.5}
                    value={heroTextSeconds}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 2 && val <= 6) setHeroTextSeconds(val);
                    }}
                    className="w-16 px-2 py-1.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white text-center font-mono text-[13px] outline-none focus:border-gold"
                  />
                </div>
                <p className="text-[12px] text-sand/60">
                  Allowed range: 2 to 6 seconds. Changing seconds scales the hold time ({Math.max(0, Math.round(heroTextSeconds * 1000 - 1400))}ms) while keeping enter fixed at 900ms and exit at 500ms.
                </p>

                {/* Timing Breakdown Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
                  <div className="p-2 bg-deep-navy/70 border border-sand/15 rounded-[2px]">
                    <span className="block text-sand/60">Enter</span>
                    <span className="font-mono text-sand font-semibold">900 ms</span>
                  </div>
                  <div className="p-2 bg-deep-navy/70 border border-gold/30 rounded-[2px]">
                    <span className="block text-gold/80">Hold (Sharp)</span>
                    <span className="font-mono text-gold font-semibold">
                      {Math.max(0, Math.round(heroTextSeconds * 1000 - 1400))} ms
                    </span>
                  </div>
                  <div className="p-2 bg-deep-navy/70 border border-sand/15 rounded-[2px]">
                    <span className="block text-sand/60">Exit</span>
                    <span className="font-mono text-sand font-semibold">500 ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sand flex items-center gap-2">
                  <span>Live Hero Title Preview</span>
                  <span className="text-[11px] font-normal text-sand/50 bg-deep-navy px-2 py-0.5 rounded-[2px] border border-sand/20">
                    Real-time motion
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewPaused((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded-[2px] border border-sand/30 bg-deep-navy hover:bg-royal-blue text-sand hover:text-white transition-colors cursor-pointer"
                >
                  {previewPaused ? <span>Resume</span> : <span>Pause Preview</span>}
                </button>
              </div>

              {/* Hero Poster mini simulator */}
              <div className="flex-1 min-h-[220px] bg-midnight border border-sand/30 rounded-[3px] p-6 sm:p-8 flex items-center justify-start relative overflow-hidden shadow-inner">
                {/* Subtle dark overlay simulation */}
                <div className="absolute inset-0 bg-radial from-deep-navy/60 to-midnight pointer-events-none" />
                <div className="relative z-10 w-full">
                  <HeroTitleFade
                    lineOne={heroTitleLineOne || "TECRA"}
                    lineTwo={heroTitleLineTwo || "Department of Information Technology"}
                    secondsPerText={heroTextSeconds}
                    paused={previewPaused}
                    manualPaused={previewPaused}
                  />
                </div>
              </div>
              <p className="text-[11px] text-sand/50 text-right">
                Preview renders exact typography, gold bar animation, and drift-corrected state machine.
              </p>
            </div>
          </div>
        </div>

        <HeroImagesManager />

        {/* Live Navbar Titles & Site Hierarchy Inspector */}
        <AdminNavbarTitlesPanel />
      </div>
    </div>
  );
}
