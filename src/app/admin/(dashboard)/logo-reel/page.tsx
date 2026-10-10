"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Film,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sliders,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  X,
  Play,
  Pause,
} from "lucide-react";

interface ReelItem {
  id: string;
  type: "club" | "association" | "custom";
  refId?: string;
  label: string;
  logoUrl: string;
  logoDarkUrl?: string;
  href?: string;
  order: number;
  active: boolean;
  missingLogo?: boolean;
}

interface ReelSettings {
  speed: "slow" | "medium" | "fast";
  height: number;
  greyscale: boolean;
  linkEnabled: boolean;
}

export default function AdminLogoReelPage() {
  const [items, setItems] = useState<ReelItem[]>([]);
  const [settings, setSettings] = useState<ReelSettings>({
    speed: "slow",
    height: 64,
    greyscale: true,
    linkEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // Custom Logo Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [uploadingCustom, setUploadingCustom] = useState(false);
  const [customWarning, setCustomWarning] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live Preview Animation Toggle
  const [previewPaused, setPreviewPaused] = useState(false);

  const customFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await fetch("/api/admin/logo-reel");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setItems(data.items || []);
            if (data.settings) {
              setSettings({
                speed: data.settings.speed || "slow",
                height: data.settings.height || 64,
                greyscale: data.settings.greyscale ?? true,
                linkEnabled: data.settings.linkEnabled ?? true,
              });
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error loading logo reel";
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

  // Handle reorder
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(reordered);

    try {
      await fetch("/api/admin/logo-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: reordered.map((item) => ({
            id: item.id,
            order: item.order,
            active: item.active,
            href: item.href,
          })),
        }),
      });
    } catch {
      setStatusMessage({ type: "warning", text: "Order could not be saved to server" });
    }
  };

  // Toggle active status for item
  const handleToggleItemActive = async (item: ReelItem) => {
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, active: !i.active } : i
    );
    setItems(updated);

    try {
      await fetch("/api/admin/logo-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: updated.map((i) => ({
            id: i.id,
            order: i.order,
            active: i.active,
            href: i.href,
          })),
        }),
      });
    } catch {
      setStatusMessage({ type: "warning", text: "Item visibility could not be updated" });
    }
  };

  // Update item href link
  const handleUpdateItemHref = async (id: string, href: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, href } : i));
    setItems(updated);

    try {
      await fetch("/api/admin/logo-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: updated.map((i) => ({
            id: i.id,
            order: i.order,
            active: i.active,
            href: i.href,
          })),
        }),
      });
    } catch {
      setStatusMessage({ type: "warning", text: "Item link could not be updated" });
    }
  };

  // Save Reel Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/logo-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          speed: settings.speed,
          height: Number(settings.height),
          greyscale: settings.greyscale,
          linkEnabled: settings.linkEnabled,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update settings");

      setStatusMessage({
        type: "success",
        text: "Logo reel settings updated and applied to public pages.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving reel settings";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Custom Logo
  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setCustomWarning(null);
    setCustomPreview(URL.createObjectURL(file));
  };

  const handleUploadCustomLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFile) {
      setStatusMessage({ type: "error", text: "Please select a PNG logo file" });
      return;
    }
    if (!customLabel.trim()) {
      setStatusMessage({ type: "error", text: "A label is required for accessibility" });
      return;
    }

    setUploadingCustom(true);
    setCustomWarning(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("logo", customFile);
    formData.append("label", customLabel.trim());
    if (customHref.trim()) {
      formData.append("href", customHref.trim());
    }

    try {
      const res = await fetch("/api/admin/logo-reel", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Custom logo upload failed");

      if (json.warning) {
        setCustomWarning(json.warning);
      }

      setItems((prev) => [...prev, json.item]);
      setIsAddModalOpen(false);
      setCustomFile(null);
      setCustomPreview(null);
      setCustomLabel("");
      setCustomHref("");

      setStatusMessage({
        type: json.warning ? "warning" : "success",
        text: json.warning
          ? json.warning
          : "Custom logo verified, trimmed and added to reel.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload encountered an error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploadingCustom(false);
      if (customFileInputRef.current) customFileInputRef.current.value = "";
    }
  };

  // Delete Custom Logo
  const handleDeleteCustomItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/logo-reel/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to remove item");
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      setStatusMessage({
        type: "success",
        text: "Custom logo removed from reel and erased from storage.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting logo item";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  // Compute active preview logos with loop rules
  const activeValidItems = items.filter(
    (i) => i.active && i.logoUrl && !i.missingLogo
  );
  let previewItems = [...activeValidItems];
  if (previewItems.length > 0 && previewItems.length < 6) {
    // Repeat set so seamless loop still fills screen
    previewItems = [
      ...previewItems,
      ...previewItems,
      ...previewItems,
    ].slice(0, Math.max(previewItems.length * 2, 6));
  }

  const speedDuration = {
    slow: "36s",
    medium: "22s",
    fast: "14s",
  }[settings.speed];

  return (
    <div className="flex-1 flex flex-col bg-[#070B18]">
      <AdminHeader
        title="Club Logo Reel Administration"
        subtitle="Configure seamless continuous scrolling emblems for Home and Clubs pages"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Navigation & Status Notification */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/clubs"
              className="text-xs font-semibold text-sand/60 hover:text-sand transition-colors"
            >
              Clubs Directory
            </Link>
            <span className="text-sand/30 font-mono">/</span>
            <span className="text-xs font-semibold text-gold">Logo Reel</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/clubs"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand/80 hover:text-gold border border-white/10 text-xs font-semibold transition-colors"
            >
              <span>View Public Reel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Notification */}
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

        {/* ================================================================= */}
        {/* LIVE INTERACTIVE REEL PREVIEW */}
        {/* ================================================================= */}
        <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
                <Film className="w-4 h-4 text-gold" />
                <span>Live Interactive Reel Preview</span>
              </h2>
              <p className="text-xs text-sand/60">
                Continuous linear scroll loop. Hover or focus pauses movement. Still row displays when only one or two items exist.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewPaused(!previewPaused)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {previewPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>Play Loop</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-sand" />
                    <span>Pause Loop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actual Preview Canvas */}
          <div className="relative w-full rounded-2xl bg-[#070B18] border border-white/10 p-6 overflow-hidden min-h-28 flex items-center justify-center">
            {previewItems.length === 0 ? (
              <div className="text-center py-6 text-sand/40 text-xs font-mono">
                Reel is currently hidden on public site because there are no active logos
              </div>
            ) : previewItems.length <= 2 ? (
              /* Still row with no movement */
              <div className="flex items-center justify-center gap-8 py-2">
                {previewItems.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 transition-all ${
                      settings.greyscale
                        ? "grayscale hover:grayscale-0"
                        : "grayscale-0"
                    }`}
                  >
                    <div
                      className="relative shrink-0 flex items-center justify-center"
                      style={{ height: `${settings.height}px`, width: `${settings.height * 1.4}px` }}
                    >
                      <Image
                        src={item.logoUrl}
                        alt={item.label}
                        fill
                        sizes="120px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-sand">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Continuous linear marquee scroll */
              <div className="w-full overflow-hidden select-none">
                <div
                  className="flex w-max items-center gap-8 animate-marquee"
                  style={{
                    animationDuration: speedDuration,
                    animationPlayState: previewPaused ? "paused" : "running",
                  }}
                >
                  {[...previewItems, ...previewItems].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 transition-all ${
                        settings.greyscale
                          ? "grayscale hover:grayscale-0"
                          : "grayscale-0"
                      }`}
                    >
                      <div
                        className="relative shrink-0 flex items-center justify-center"
                        style={{
                          height: `${settings.height}px`,
                          width: `${settings.height * 1.4}px`,
                        }}
                      >
                        <Image
                          src={item.logoUrl}
                          alt={item.label}
                          fill
                          sizes="120px"
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs font-bold text-sand whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SETTINGS PANEL & ADD CUSTOM BUTTON */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Card (8 cols) */}
          <div className="md:col-span-8 bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold" />
                <span>Motion and Appearance Settings</span>
              </h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scroll Speed */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-sand">
                    Scroll Speed
                  </label>
                  <select
                    value={settings.speed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        speed: e.target.value as "slow" | "medium" | "fast",
                      })
                    }
                    className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-sand focus:border-gold focus:outline-hidden cursor-pointer"
                  >
                    <option value="slow">Slow (Recommended, 40px per second)</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                {/* Logo Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-sand">
                    <span>Emblem Height</span>
                    <span className="font-mono text-gold">{settings.height} pixels</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="96"
                    step="4"
                    value={settings.height}
                    onChange={(e) =>
                      setSettings({ ...settings, height: Number(e.target.value) })
                    }
                    className="w-full accent-gold cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-sand/40">
                    <span>40 pixels</span>
                    <span>Default: 64 pixels</span>
                    <span>96 pixels</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#070B18] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.greyscale}
                    onChange={(e) =>
                      setSettings({ ...settings, greyscale: e.target.checked })
                    }
                    className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-sand block">
                      Greyscale until Hover
                    </span>
                    <span className="text-[11px] text-sand/50 block">
                      Desaturates logos until hovered or focused
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#070B18] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.linkEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, linkEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-sand block">
                      Enable Links on Logos
                    </span>
                    <span className="text-[11px] text-sand/50 block">
                      Allows clicking logos to open target club pages
                    </span>
                  </div>
                </label>
              </div>

              {/* Save Settings Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Reel Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Add Custom Item Card (4 cols) */}
          <div className="md:col-span-4 bg-[#0B132B] rounded-2xl border border-white/10 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-sand font-heading">
                Add Non Club Logo
              </h3>
              <p className="text-xs text-sand/60 leading-relaxed">
                Include partner organizations, symposium sponsors, or external technology bodies in the public reel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand border border-white/15 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-gold" />
              <span>Upload Custom Logo</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* REEL ITEMS LIST & ORDERING */}
        {/* ================================================================= */}
        <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-sm font-bold text-sand font-heading">
                Reel Items Sequence ({items.length} items registered)
              </h2>
              <p className="text-xs text-sand/60">
                Clubs without a logo are flagged and excluded from the public display until uploaded.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sand/60">
              <Loader2 className="w-6 h-6 animate-spin text-gold mb-2" />
              <span className="text-xs font-mono">Loading logo reel records</span>
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-2.5">
              {items.map((item, index) => {
                const isClub = item.type === "club";
                const isAssoc = item.type === "association";
                const hasLogo =
                  item.logoUrl &&
                  !item.logoUrl.includes("placeholder") &&
                  item.logoUrl.trim() !== "";

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                      item.missingLogo || !hasLogo
                        ? "bg-amber-500/5 border-amber-500/30"
                        : item.active
                        ? "bg-[#070B18] border-white/10"
                        : "bg-[#070B18]/50 border-white/5 opacity-60"
                    }`}
                  >
                    {/* Left: Drag Handle, Number, Logo Thumbnail, Label */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="text-xs font-mono text-sand/40 w-6 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Logo Thumbnail Box */}
                      <div className="relative w-12 h-12 rounded-xl bg-[#0B132B] border border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        {hasLogo ? (
                          <Image
                            src={item.logoUrl}
                            alt={item.label}
                            width={38}
                            height={38}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-[9px] font-mono text-sand/30">None</span>
                        )}
                      </div>

                      {/* Label & Badges */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-sand truncate">
                            {item.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                              isClub
                                ? "bg-emerald/15 text-emerald border-emerald/30"
                                : isAssoc
                                ? "bg-royal-blue/20 text-sand border-royal-blue/40"
                                : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>

                        {/* Missing Logo Warning Badge */}
                        {item.missingLogo || !hasLogo ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Logo missing. Upload one in Logos</span>
                            </span>
                            {isClub && item.refId && (
                              <Link
                                href={`/admin/clubs/${item.refId}`}
                                className="text-[10px] text-gold underline hover:no-underline font-semibold"
                              >
                                Go to Club Overview
                              </Link>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-sand/40 font-mono block truncate">
                            Target link: {item.href || "No link"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions, Reorder, Active Toggle */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Optional Target Link Input */}
                      <input
                        type="text"
                        defaultValue={item.href || ""}
                        onBlur={(e) => handleUpdateItemHref(item.id, e.target.value)}
                        placeholder="Link destination"
                        className="w-36 bg-[#0B132B] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-sand/70 focus:border-gold focus:outline-hidden hidden md:block"
                      />

                      {/* Move Up / Down */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                          title="Move earlier"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, "down")}
                          disabled={index === items.length - 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                          title="Move later"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleItemActive(item)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.active
                            ? "bg-emerald/15 border-emerald/30 text-emerald hover:bg-emerald/25"
                            : "bg-white/5 border-white/10 text-sand/40 hover:text-sand"
                        }`}
                        title={item.active ? "Visible in reel" : "Hidden from reel"}
                      >
                        {item.active ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete Custom Item Button */}
                      {item.type === "custom" && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/50 hover:text-rose transition-colors"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sand/40 text-xs font-mono">
              No items configured in reel
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: ADD CUSTOM LOGO */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Upload Extra Logo Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadCustomLogo} className="space-y-4">
              {/* Label */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Emblem Label (Used as alt text and for screen readers)
                </label>
                <input
                  type="text"
                  required
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. IEEE Student Branch or Industry Partner"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* Optional Link */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Optional Target Link
                </label>
                <input
                  type="text"
                  value={customHref}
                  onChange={(e) => setCustomHref(e.target.value)}
                  placeholder="e.g. https://partner.org or /student-life"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* File Upload (PNG Only) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-sand">
                  PNG Logo File (Transparent background preferred, 400px+ long side, up to 2 MB)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-[#070B18] border border-white/15 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                    {customPreview ? (
                      <Image
                        src={customPreview}
                        alt="Custom preview"
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-sand/30" />
                    )}
                  </div>

                  <input
                    type="file"
                    ref={customFileInputRef}
                    accept="image/png"
                    onChange={handleCustomFileChange}
                    className="text-xs text-sand/70 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-white/15 file:text-xs file:bg-white/5 file:text-sand cursor-pointer"
                  />
                </div>
              </div>

              {/* Warning box if white background detected */}
              {customWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{customWarning}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingCustom || !customFile}
                  className="px-5 py-2 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploadingCustom ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Upload to Reel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ===================================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Confirm Logo Removal
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Remove this custom logo item from the reel? The uploaded PNG file will be erased immediately from cloud storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCustomItem(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/90 text-xs font-semibold"
              >
                Delete Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
