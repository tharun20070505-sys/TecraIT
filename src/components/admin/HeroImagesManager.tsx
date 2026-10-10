"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Save, CheckCircle2, AlertCircle, GripVertical, Monitor, Smartphone } from "lucide-react";
import type { HeroSlide } from "@/types";

interface HeroAdminData {
  slides: HeroSlide[];
  intervalSeconds: number;
  overlayMinimum: number;
}

interface ReadabilityResult {
  titleContrast: number;
  navbarContrast: number;
  pass: boolean;
}

type FocalTarget = "desktop" | "mobile";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_ACTIVE_IMAGES = 8;
const DEFAULT_OVERLAY_MINIMUM = 0.7;

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function contrastAfterOverlay(luminance: number, overlay: number) {
  const composited = luminance * (1 - overlay);
  return 1.05 / (composited + 0.05);
}

function meanLuminance(data: Uint8ClampedArray, width: number, x0: number, y0: number, x1: number, y1: number) {
  let sum = 0;
  let count = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const offset = (y * width + x) * 4;
      const channels = [data[offset] / 255, data[offset + 1] / 255, data[offset + 2] / 255].map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      );
      sum += 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      count += 1;
    }
  }
  return count ? sum / count : 0;
}

export function HeroImagesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [overlayMinimum, setOverlayMinimum] = useState(DEFAULT_OVERLAY_MINIMUM);
  const [selectedId, setSelectedId] = useState("");
  const [focalTarget, setFocalTarget] = useState<FocalTarget>("desktop");
  const [readability, setReadability] = useState<ReadabilityResult | null>(null);
  const [dimensionWarnings, setDimensionWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadActive, setUploadActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const draggedIdRef = useRef<string | null>(null);

  const activeCount = useMemo(() => slides.filter((slide) => slide.active).length, [slides]);
  const selected = slides.find((slide) => slide.id === selectedId) ?? slides[0] ?? null;
  const effectiveOverlay = Math.max(overlayMinimum, ...slides.filter((slide) => slide.active).map((slide) => slide.overlay ?? overlayMinimum));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/hero-slides", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load hero images");
      const result = data as HeroAdminData;
      setSlides(result.slides);
      setIntervalSeconds(result.intervalSeconds);
      setOverlayMinimum(result.overlayMinimum);
      setSelectedId((previous) => result.slides.some((slide) => slide.id === previous)
        ? previous
        : result.slides[0]?.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load hero images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 80;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const titleLuminance = meanLuminance(pixels, canvas.width, 0, 16, 72, 64);
        const navbarLuminance = meanLuminance(pixels, canvas.width, 0, 0, 120, 12);
        const titleContrast = contrastAfterOverlay(titleLuminance, effectiveOverlay);
        const navbarContrast = contrastAfterOverlay(navbarLuminance, effectiveOverlay);
        if (!cancelled) setReadability({
          titleContrast,
          navbarContrast,
          pass: titleContrast >= 4.5 && navbarContrast >= 4.5,
        });
      } catch {
        if (!cancelled) setReadability(null);
      }
    };
    image.onerror = () => { if (!cancelled) setReadability(null); };
    image.src = selected.url;
    return () => { cancelled = true; image.src = ""; };
  }, [selected, effectiveOverlay]);

  const updateSlide = (id: string, update: Partial<HeroSlide>) => {
    setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...update } : slide));
    setSuccess("");
  };

  const inspectFiles = async (files: File[]) => {
    const warnings: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name} is larger than 8 MB`);
      }
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        throw new Error(`${file.name} is not a JPG, PNG, or WebP image`);
      }
      try {
        const bitmap = await createImageBitmap(file);
        const ratio = bitmap.width / bitmap.height;
        if (bitmap.width < 1920) warnings.push(`${file.name}: under 1920 pixels wide`);
        if (ratio < 1.65) warnings.push(`${file.name}: too tall for the recommended 16:9 poster`);
        if (ratio > 1.9) warnings.push(`${file.name}: too wide or narrow for the recommended 16:9 poster`);
        bitmap.close();
      } catch {
        warnings.push(`${file.name}: dimensions could not be read before upload`);
      }
    }
    setDimensionWarnings(warnings);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setError("");
    setSuccess("");
    try {
      await inspectFiles(files);
      if (uploadActive && activeCount + files.length > MAX_ACTIVE_IMAGES) {
        throw new Error(`You can have at most ${MAX_ACTIVE_IMAGES} active hero images. Choose inactive uploads or deactivate an image first.`);
      }
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("active", String(uploadActive));
      const response = await fetch("/api/admin/hero-slides", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      setSuccess(`${data.slides.length} hero image${data.slides.length === 1 ? "" : "s"} uploaded and converted to WebP.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (activeCount > MAX_ACTIVE_IMAGES) {
      setError(`Only ${MAX_ACTIVE_IMAGES} images can be active.`);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/hero-slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intervalSeconds,
          slides: slides.map((slide, index) => ({
            id: slide.id,
            label: slide.label,
            focalDesktop: slide.focalDesktop,
            focalMobile: slide.focalMobile,
            overlay: slide.overlay,
            active: slide.active,
            startAt: slide.startAt ?? null,
            endAt: slide.endAt ?? null,
            order: (index + 1) * 10,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save slideshow settings");
      setSlides(data.slides);
      setSuccess("Hero slideshow settings saved. The public site has been revalidated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save slideshow settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!window.confirm(`Remove ${slide.label || "this hero image"}? The converted image files will also be deleted.`)) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/hero-slides?id=${encodeURIComponent(slide.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove hero image");
      setSuccess("Hero image and generated sizes removed.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove hero image");
    }
  };

  const setFocalFromClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selected) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.round(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))),
    };
    updateSlide(selected.id, focalTarget === "desktop" ? { focalDesktop: point } : { focalMobile: point });
  };

  const moveSlide = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSlides((current) => {
      const from = current.findIndex((slide) => slide.id === fromId);
      const to = current.findIndex((slide) => slide.id === toId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const focal = selected ? (focalTarget === "desktop" ? selected.focalDesktop : selected.focalMobile) : { x: 50, y: 50 };

  return (
    <section className="space-y-6 rounded-[3px] border border-sand/20 bg-midnight p-6 lg:p-8" aria-labelledby="hero-images-heading">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sand/15 pb-4">
        <div>
          <h2 id="hero-images-heading" className="flex items-center gap-2 font-heading text-xl font-bold text-white">
            <ImagePlus className="h-5 w-5 text-gold" aria-hidden="true" />
            Home Page Hero Images
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] text-sand/75">
            Images rotate automatically. The public poster keeps one image still for the selected interval, then crossfades to the next.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-sand/80">
          <span>{activeCount}/{MAX_ACTIVE_IMAGES} active</span>
          {activeCount >= MAX_ACTIVE_IMAGES && <span className="text-gold">Active image limit reached</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[2px] border border-sand/30 bg-deep-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-navy/80">
              <ImagePlus className="h-4 w-4 text-gold" aria-hidden="true" />
              {uploading ? "Processing images" : "Add JPG, PNG, or WebP images"}
              <input
                ref={uploadRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-sand/80">
              <input type="checkbox" checked={uploadActive} onChange={(event) => setUploadActive(event.target.checked)} />
              Activate on upload
            </label>
            <label className="flex items-center gap-2 text-sm text-sand/85">
              Seconds per image
              <input
                type="number"
                min={5}
                max={20}
                step={1}
                value={intervalSeconds}
                onChange={(event) => setIntervalSeconds(Math.max(5, Math.min(20, Number(event.target.value) || 10)))}
                className="w-20 rounded-[2px] border border-sand/25 bg-deep-navy px-2 py-1.5 text-center text-white outline-none focus:border-gold"
              />
            </label>
          </div>

          <div className="rounded-[3px] border border-sand/15 bg-deep-navy/70 p-3 text-xs leading-relaxed text-sand/80">
            JPG, PNG, or WebP; maximum 8 MB each. Recommended: 2400 by 1350, 16:9, at least 1920 pixels wide. Uploads are EXIF-stripped, resized to responsive WebP variants, and given a blur placeholder.
          </div>

          {dimensionWarnings.length > 0 && (
            <div className="space-y-1 rounded-[3px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100" role="status">
              {dimensionWarnings.map((warning) => <p key={warning}>{warning}</p>)}
            </div>
          )}
          {error && <p className="rounded-[3px] border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</p>}
          {success && <p className="rounded-[3px] border border-emerald/30 bg-emerald/10 p-3 text-sm text-emerald-100" role="status">{success}</p>}

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Loading hero image records" role="status">
              <div className="h-36 rounded-[3px] bg-white/5" />
              <div className="h-36 rounded-[3px] bg-white/5" />
            </div>
          ) : slides.length === 0 ? (
            <div className="rounded-[3px] border border-dashed border-sand/25 p-8 text-center text-sm text-sand/70">
              No admin hero images are configured. The website is using the static fallback image.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {slides.map((slide) => (
                <article
                  key={slide.id}
                  draggable
                  onDragStart={() => { draggedIdRef.current = slide.id; }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => { if (draggedIdRef.current) moveSlide(draggedIdRef.current, slide.id); draggedIdRef.current = null; }}
                  onClick={() => setSelectedId(slide.id)}
                  className={`cursor-pointer overflow-hidden rounded-[3px] border ${selected?.id === slide.id ? "border-gold" : "border-sand/20"} bg-[#080d1c]`}
                >
                  <div className="relative aspect-video">
                    <Image src={slide.url} alt="" aria-hidden="true" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute left-2 top-2 rounded bg-black/70 p-1 text-white" aria-hidden="true"><GripVertical className="h-4 w-4" /></div>
                    <span className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] font-bold ${slide.active ? "bg-emerald text-white" : "bg-black/70 text-sand/70"}`}>
                      {slide.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <span className="truncate text-xs font-semibold text-sand">{slide.label || "Untitled hero image"}</span>
                    <span className="shrink-0 text-[10px] text-sand/50">Order {slides.indexOf(slide) + 1}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-bold text-white">Live poster preview</h3>
            <p className="mb-3 text-xs text-sand/65">Click the preview to set the selected desktop or mobile focal point.</p>
            <div
              className="relative aspect-video cursor-crosshair overflow-hidden rounded-[3px] border border-sand/25 bg-[#0c1535]"
              onClick={setFocalFromClick}
              aria-label="Hero image focal-point preview"
            >
              {selected && <Image src={selected.url} alt="" aria-hidden="true" fill sizes="(max-width: 1280px) 100vw, 60vw" className="object-cover" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} />}
              <div className="absolute inset-0 bg-midnight" style={{ opacity: effectiveOverlay }} />
              <div className="absolute inset-x-0 top-0 z-10 flex h-[15%] items-center justify-between border-b border-white/60 bg-black/50 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                <span>SRIET navigation</span><span>Links and contact</span>
              </div>
              <div className="absolute left-[4%] top-[34%] z-10 h-[42%] w-[56%] rounded border border-dashed border-gold/80 bg-black/10 p-3 text-white">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gold">Title safe area</span>
                <p className="mt-2 font-black leading-tight">TECRA</p>
                <p className="text-[10px] font-semibold">Department of Information Technology</p>
              </div>
              {selected && <span className="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFocalTarget("desktop")} className={`inline-flex items-center gap-1.5 rounded-[2px] border px-3 py-1.5 text-xs transition-colors ${focalTarget === "desktop" ? "border-gold text-gold" : "border-sand/20 text-sand/70"}`}>
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" /> Desktop crop
            </button>
            <button type="button" onClick={() => setFocalTarget("mobile")} className={`inline-flex items-center gap-1.5 rounded-[2px] border px-3 py-1.5 text-xs transition-colors ${focalTarget === "mobile" ? "border-gold text-gold" : "border-sand/20 text-sand/70"}`}>
              <Smartphone className="h-3.5 w-3.5" aria-hidden="true" /> Mobile crop
            </button>
          </div>

          {selected && readability && (
            <div className={`flex items-start gap-2 rounded-[3px] border p-3 text-xs ${readability.pass ? "border-emerald/30 bg-emerald/10 text-emerald-100" : "border-amber-500/30 bg-amber-500/10 text-amber-100"}`} role="status">
              {readability.pass ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>
                {readability.pass ? "Readability pass" : "Readability warning"}: title contrast {readability.titleContrast.toFixed(1)}:1, navbar contrast {readability.navbarContrast.toFixed(1)}:1.
                {!readability.pass && " This image is bright; increase its overlay strength."}
              </span>
            </div>
          )}

          {selected && (
            <div className="space-y-3 rounded-[3px] border border-sand/15 bg-deep-navy/50 p-4">
              <label className="block space-y-1 text-xs text-sand/75">
                <span>Internal label (admin only)</span>
                <input value={selected.label} maxLength={100} onChange={(event) => updateSlide(selected.id, { label: event.target.value })} className="w-full rounded-[2px] border border-sand/20 bg-midnight px-2.5 py-2 text-sm text-white" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-sand/75"><span>Desktop focal X / Y</span><div className="flex gap-2"><input aria-label="Desktop focal horizontal percent" type="number" min={0} max={100} value={selected.focalDesktop.x} onChange={(event) => updateSlide(selected.id, { focalDesktop: { ...selected.focalDesktop, x: Number(event.target.value) } })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /><input aria-label="Desktop focal vertical percent" type="number" min={0} max={100} value={selected.focalDesktop.y} onChange={(event) => updateSlide(selected.id, { focalDesktop: { ...selected.focalDesktop, y: Number(event.target.value) } })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /></div></label>
                <label className="space-y-1 text-xs text-sand/75"><span>Mobile focal X / Y</span><div className="flex gap-2"><input aria-label="Mobile focal horizontal percent" type="number" min={0} max={100} value={selected.focalMobile.x} onChange={(event) => updateSlide(selected.id, { focalMobile: { ...selected.focalMobile, x: Number(event.target.value) } })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /><input aria-label="Mobile focal vertical percent" type="number" min={0} max={100} value={selected.focalMobile.y} onChange={(event) => updateSlide(selected.id, { focalMobile: { ...selected.focalMobile, y: Number(event.target.value) } })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /></div></label>
              </div>
              <label className="block space-y-1 text-xs text-sand/75"><span>Overlay strength (minimum {Math.round(overlayMinimum * 100)}%)</span><select value={selected.overlay === null ? "global" : String(selected.overlay)} onChange={(event) => updateSlide(selected.id, { overlay: event.target.value === "global" ? null : Math.max(overlayMinimum, Number(event.target.value)) })} className="w-full rounded-[2px] border border-sand/20 bg-midnight px-2.5 py-2 text-white"><option value="global">Use global minimum</option>{[0.7, 0.75, 0.8, 0.85, 0.9, 0.95].filter((value) => value >= overlayMinimum).map((value) => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}</select></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-sand/75"><span>Season starts</span><input type="datetime-local" value={toLocalDateTime(selected.startAt)} onChange={(event) => updateSlide(selected.id, { startAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /></label>
                <label className="space-y-1 text-xs text-sand/75"><span>Season ends</span><input type="datetime-local" value={toLocalDateTime(selected.endAt)} onChange={(event) => updateSlide(selected.id, { endAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="w-full rounded border border-sand/20 bg-midnight px-2 py-1.5 text-white" /></label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand/10 pt-3">
                <label className="inline-flex items-center gap-2 text-sm text-sand"><input type="checkbox" checked={selected.active} disabled={!selected.active && activeCount >= MAX_ACTIVE_IMAGES} onChange={(event) => updateSlide(selected.id, { active: event.target.checked })} /> Active in slideshow</label>
                <button type="button" onClick={() => void handleDelete(selected)} className="inline-flex items-center gap-1.5 rounded-[2px] border border-red-400/30 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove image</button>
              </div>
            </div>
          )}

          <button type="button" onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-[2px] bg-royal-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-blue/90 disabled:opacity-50">
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Saving" : "Save slideshow settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
