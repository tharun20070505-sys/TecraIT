"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Upload,
  Trash2,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Sliders,
  ExternalLink,
  X,
  Layout,
  Sun,
  Moon,
} from "lucide-react";

interface AssociationLogoState {
  logoLight: string;
  logoDark?: string;
  alt: string;
  showInFooter: boolean;
  showInReel: boolean;
}

export default function AdminITAssociationLogoPage() {
  const [data, setData] = useState<AssociationLogoState>({
    logoLight: "",
    logoDark: "",
    alt: "Department of Information Technology Association Emblem",
    showInFooter: false,
    showInReel: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // File previews before saving
  const [lightPreview, setLightPreview] = useState<string | null>(null);
  const [darkPreview, setDarkPreview] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<"light" | "dark" | null>(null);

  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await fetch("/api/admin/it-association/logo");
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setData({
              logoLight: json.logoLight || "",
              logoDark: json.logoDark || "",
              alt: json.alt || "Department of Information Technology Association Emblem",
              showInFooter: Boolean(json.showInFooter),
              showInReel: Boolean(json.showInReel),
            });
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error loading logo configuration";
          setStatusMessage({ type: "error", text: msg });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Upload or replace light / primary logo
  const handleUploadLight = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLight(true);
    setWarningMessage(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("logoLight", file);

    try {
      const res = await fetch("/api/admin/it-association/logo", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setData((prev) => ({ ...prev, logoLight: json.data.logoLight }));
      setLightPreview(null);

      if (json.warning) {
        setWarningMessage(json.warning);
        setStatusMessage({ type: "warning", text: json.warning });
      } else {
        setStatusMessage({
          type: "success",
          text: "Primary Association logo verified, trimmed and updated.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload encountered an error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingLight(false);
      if (lightFileInputRef.current) lightFileInputRef.current.value = "";
    }
  };

  // Upload or replace dark background logo
  const handleUploadDark = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDark(true);
    setWarningMessage(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("logoDark", file);

    try {
      const res = await fetch("/api/admin/it-association/logo", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setData((prev) => ({ ...prev, logoDark: json.data.logoDark }));
      setDarkPreview(null);

      if (json.warning) {
        setWarningMessage(json.warning);
        setStatusMessage({ type: "warning", text: json.warning });
      } else {
        setStatusMessage({
          type: "success",
          text: "Dark theme Association logo verified and updated.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload encountered an error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingDark(false);
      if (darkFileInputRef.current) darkFileInputRef.current.value = "";
    }
  };

  // Save textual properties & toggles
  const handleSaveProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/it-association/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: data.alt,
          showInFooter: data.showInFooter,
          showInReel: data.showInReel,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update properties");

      setStatusMessage({
        type: "success",
        text: "Association emblem settings saved and published.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSavingSettings(false);
    }
  };

  // Delete logo file
  const handleDeleteLogo = async (target: "light" | "dark") => {
    try {
      const res = await fetch(`/api/admin/it-association/logo?target=${target}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Delete failed");
      }

      if (target === "light") {
        setData((prev) => ({ ...prev, logoLight: "" }));
      } else {
        setData((prev) => ({ ...prev, logoDark: "" }));
      }

      setDeleteConfirmTarget(null);
      setStatusMessage({
        type: "success",
        text: `The ${target} version emblem was removed from storage.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting emblem";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const effectiveLightLogo = lightPreview || data.logoLight;
  const effectiveDarkLogo = darkPreview || data.logoDark || effectiveLightLogo;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070B18] text-sand p-8">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-3" />
        <p className="text-xs font-mono">Loading Association logo console</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#070B18]">
      <AdminHeader
        title="Information Technology Association Logo"
        subtitle="Manage official association emblems, dark theme variants, real size previews, and footer toggles"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Navigation & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-sand/60">Association Console</span>
            <span className="text-sand/30 font-mono">/</span>
            <span className="text-xs font-semibold text-gold">Official Logo</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/student-life/it-association"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand/80 hover:text-gold border border-white/10 text-xs font-semibold transition-colors"
            >
              <span>View Live IT Association Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald/10 border-emerald/30 text-emerald"
                : statusMessage.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose/10 border-rose/30 text-rose"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 rounded-md hover:bg-white/10 text-sand/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Warning Notification Banner */}
        {warningMessage && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Background Warning</span>
              <span>{warningMessage}</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* FOUR LIVE REAL SIZE PREVIEWS GRID */}
        {/* ================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              <span>Real Size Previews (Test before publishing)</span>
            </h2>
            <span className="text-[11px] font-mono text-sand/50">
              Rendered at 100% natural display proportion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Light Background Preview */}
            <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-sand">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Background</span>
                </span>
                <span className="text-[10px] font-mono text-sand/40">Default</span>
              </div>

              <div className="relative aspect-4/3 w-full rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] flex items-center justify-center p-4 overflow-hidden">
                {effectiveLightLogo ? (
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <Image
                      src={effectiveLightLogo}
                      alt={data.alt}
                      fill
                      sizes="112px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 font-mono text-center">
                    No light emblem
                  </span>
                )}
              </div>
              <span className="text-[10px] text-sand/50 text-center block">
                Public white and ivory content bands
              </span>
            </div>

            {/* 2. Dark Background Preview */}
            <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-sand">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-royal-blue" />
                  <span>Dark Background</span>
                </span>
                <span className="text-[10px] font-mono text-sand/40">Dark Band</span>
              </div>

              <div className="relative aspect-4/3 w-full rounded-xl bg-[#070B18] border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                {effectiveDarkLogo ? (
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <Image
                      src={effectiveDarkLogo}
                      alt={data.alt}
                      fill
                      sizes="112px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-sand/40 font-mono text-center">
                    No dark emblem
                  </span>
                )}
              </div>
              <span className="text-[10px] text-sand/50 text-center block">
                Midnight and deep navy sections
              </span>
            </div>

            {/* 3. Logo Reel Preview */}
            <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-sand">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald" />
                  <span>Logo Reel Preview</span>
                </span>
                <span className="text-[10px] font-mono text-sand/40">64px Height</span>
              </div>

              <div className="relative aspect-4/3 w-full rounded-xl bg-[#070B18] border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                {effectiveLightLogo ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <Image
                        src={effectiveLightLogo}
                        alt={data.alt}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-sand truncate max-w-20">
                      IT Assoc
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-sand/40 font-mono text-center">
                    Not configured
                  </span>
                )}
              </div>
              <span className="text-[10px] text-sand/50 text-center block">
                Campus partner scroll display
              </span>
            </div>

            {/* 4. Page Header Preview */}
            <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-sand">
                <span className="flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-gold" />
                  <span>Page Header Preview</span>
                </span>
                <span className="text-[10px] font-mono text-sand/40">Hero</span>
              </div>

              <div className="relative aspect-4/3 w-full rounded-xl bg-gradient-to-b from-[#0B132B] to-[#070B18] border border-white/10 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                {effectiveDarkLogo ? (
                  <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                    <Image
                      src={effectiveDarkLogo}
                      alt={data.alt}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-sand/40 font-mono text-center">
                    No emblem
                  </span>
                )}
                <span className="text-[10px] font-bold text-sand font-heading line-clamp-1">
                  TECRA IT ASSOCIATION
                </span>
                <span className="text-[8px] font-mono text-sand/40 uppercase">
                  SRIET Department of IT
                </span>
              </div>
              <span className="text-[10px] text-sand/50 text-center block">
                Top banner beneath page title
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* LOGO UPLOAD & CONFIGURATION CONTROLS */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Light Logo Box (6 cols) */}
          <div className="md:col-span-6 bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-sand font-heading">
                  Primary Emblem (Light Backgrounds)
                </h3>
                <p className="text-xs text-sand/60">
                  Required main PNG emblem. Transparent background preferred, at least 400px long side, up to 2 MB.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070B18] border border-white/10 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                {data.logoLight ? (
                  <Image
                    src={data.logoLight}
                    alt="Current light emblem"
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-sand/40 font-mono text-center">
                    None
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-xs font-semibold text-sand block truncate">
                  {data.logoLight ? "Active Primary Logo" : "No emblem uploaded"}
                </span>
                <span className="text-[11px] text-sand/50 font-mono block">
                  Used on main student life cards and content
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={lightFileInputRef}
              accept="image/png"
              onChange={handleUploadLight}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => lightFileInputRef.current?.click()}
                disabled={uploadingLight}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploadingLight ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{data.logoLight ? "Replace Light Logo" : "Upload Light Logo"}</span>
              </button>

              {data.logoLight && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget("light")}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-rose/20 text-sand/60 hover:text-rose border border-white/10 transition-colors"
                  title="Remove light logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dark Logo Box (6 cols) */}
          <div className="md:col-span-6 bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-sand font-heading">
                  Secondary Emblem (Dark Backgrounds)
                </h3>
                <p className="text-xs text-sand/60">
                  Optional white or high-contrast variant for dark bands and midnight headers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070B18] border border-white/10 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-[#070B18] border border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                {data.logoDark ? (
                  <Image
                    src={data.logoDark}
                    alt="Current dark emblem"
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-sand/40 font-mono text-center">
                    Optional
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-xs font-semibold text-sand block truncate">
                  {data.logoDark ? "Active Dark Theme Variant" : "Using light logo fallback"}
                </span>
                <span className="text-[11px] text-sand/50 font-mono block">
                  Applied automatically to dark sections
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={darkFileInputRef}
              accept="image/png"
              onChange={handleUploadDark}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => darkFileInputRef.current?.click()}
                disabled={uploadingDark}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand border border-white/15 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploadingDark ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-gold" />
                )}
                <span>{data.logoDark ? "Replace Dark Logo" : "Upload Dark Logo"}</span>
              </button>

              {data.logoDark && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget("dark")}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-rose/20 text-sand/60 hover:text-rose border border-white/10 transition-colors"
                  title="Remove dark logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ALT TEXT & PLACEMENT TOGGLES FORM */}
        {/* ================================================================= */}
        <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-sand font-heading">
              Accessibility Alt Text and Placement Toggles
            </h3>
            <p className="text-xs text-sand/60">
              Configure screen reader descriptions and where the emblem displays across public modules.
            </p>
          </div>

          <form onSubmit={handleSaveProperties} className="space-y-4">
            {/* Alt Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sand">
                Emblem Alt Text (Required for accessibility)
              </label>
              <input
                type="text"
                required
                value={data.alt}
                onChange={(e) => setData({ ...data, alt: e.target.value })}
                placeholder="Department of Information Technology Association Emblem"
                className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-sand focus:border-gold focus:outline-hidden"
              />
              <span className="text-[11px] text-sand/40">
                Created automatically from association name. Editable anytime.
              </span>
            </div>

            {/* Placement Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#070B18] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showInFooter}
                  onChange={(e) =>
                    setData({ ...data, showInFooter: e.target.checked })
                  }
                  className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-sand block">
                    Show in Website Footer
                  </span>
                  <span className="text-[11px] text-sand/50 block">
                    Displays association emblem in department footer badge row
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#070B18] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showInReel}
                  onChange={(e) =>
                    setData({ ...data, showInReel: e.target.checked })
                  }
                  className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-sand block">
                    Include in Club Logo Reel
                  </span>
                  <span className="text-[11px] text-sand/50 block">
                    Automatically adds association emblem to the continuous scrolling reel
                  </span>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save Association Logo Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ===================================================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Confirm Emblem Removal
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Permanently remove the {deleteConfirmTarget} Association emblem? The image file will be erased immediately from cloud storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLogo(deleteConfirmTarget)}
                className="px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/90 text-xs font-semibold"
              >
                Remove Emblem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
