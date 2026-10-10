"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlignLeft,
  Layers,
  Phone,
  FileText,
} from "lucide-react";
import { siteSettings } from "@/data/site";
import { defaultNavItems } from "@/data/navItems";
import type { DbNavItem } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function typeBadge(type: DbNavItem["type"], autoSource?: string | null) {
  if (type === "auto")
    return (
      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25">
        Auto ({autoSource ?? "clubs"})
      </span>
    );
  if (type === "dropdown")
    return (
      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
        Dropdown
      </span>
    );
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
      Page
    </span>
  );
}

// ─── Child editor row ─────────────────────────────────────────────────────────

interface ChildRowProps {
  child: DbNavItem["children"][number];
  index: number;
  onUpdate: (idx: number, field: "label" | "href", value: string) => void;
  onToggle: (idx: number) => void;
  onRemove: (idx: number) => void;
  isSystem: boolean;
}

function ChildRow({ child, index, onUpdate, onToggle, onRemove, isSystem }: ChildRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5 pl-2 pr-1">
      <GripVertical className="w-3.5 h-3.5 text-sand/30 shrink-0 cursor-grab" aria-hidden="true" />
      <input
        type="text"
        value={child.label}
        onChange={(e) => onUpdate(index, "label", e.target.value)}
        placeholder="Label"
        aria-label={`Child ${index + 1} label`}
        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2 py-1 text-[12px] text-sand focus:outline-none focus:border-gold/50 transition-colors"
      />
      <input
        type="text"
        value={child.href}
        onChange={(e) => onUpdate(index, "href", e.target.value)}
        placeholder="/path"
        aria-label={`Child ${index + 1} href`}
        className="w-36 bg-white/5 border border-white/10 rounded px-2 py-1 text-[12px] font-mono text-sand/80 focus:outline-none focus:border-gold/50 transition-colors"
      />
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-label={child.visible ? "Hide item" : "Show item"}
        className="p-1 text-sand/50 hover:text-sand transition-colors"
      >
        {child.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
      {!isSystem && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove child"
          className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  item: DbNavItem;
  onSave: (updated: DbNavItem) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function EditModal({ item, onSave, onClose, saving }: EditModalProps) {
  const [label, setLabel] = useState(item.label);
  const [href, setHref] = useState(item.href);
  const [type, setType] = useState<DbNavItem["type"]>(item.type);
  const [children, setChildren] = useState<DbNavItem["children"]>(
    item.children.map((c) => ({ ...c }))
  );
  const [error, setError] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const updateChild = (idx: number, field: "label" | "href", value: string) => {
    setChildren((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };
  const toggleChild = (idx: number) => {
    setChildren((prev) => prev.map((c, i) => (i === idx ? { ...c, visible: !c.visible } : c)));
  };
  const removeChild = (idx: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== idx));
  };
  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      { label: "", href: "/", order: prev.length + 1, visible: true },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) { setError("Label is required."); return; }
    if (!href.trim() || !href.startsWith("/")) { setError("Href must start with /"); return; }
    setError("");
    await onSave({ ...item, label: label.trim(), href: href.trim(), type, children });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit nav item: ${item.label}`}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-heading font-bold text-sand flex items-center gap-2">
            <Pencil className="w-4 h-4 text-gold" />
            <span>Edit Navigation Title</span>
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-sand/60 hover:text-sand transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="edit-label">
              Display Label *
            </label>
            <input
              ref={firstRef}
              id="edit-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-[14px] text-sand focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="e.g. About Department"
            />
          </div>

          {/* Href */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="edit-href">
              Internal Route *
            </label>
            <input
              id="edit-href"
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-[14px] font-mono text-sand/90 focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="/about"
            />
          </div>

          {/* Type */}
          {!item.isSystem && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="edit-type">
                Type
              </label>
              <select
                id="edit-type"
                value={type}
                onChange={(e) => setType(e.target.value as DbNavItem["type"])}
                className="w-full bg-[#0B132B] border border-white/15 rounded-lg px-3 py-2.5 text-[14px] text-sand focus:outline-none focus:border-gold/50 transition-colors"
              >
                <option value="page">Page (no dropdown)</option>
                <option value="dropdown">Dropdown (manual children)</option>
              </select>
            </div>
          )}

          {/* Children editor (dropdown types only, not auto) */}
          {(type === "dropdown") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-sand/60 tracking-wider">
                  Dropdown Children ({children.length})
                </span>
                <button
                  type="button"
                  onClick={addChild}
                  className="flex items-center gap-1 text-[11px] text-gold hover:text-[#e6b866] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add item</span>
                </button>
              </div>
              <div className="border border-white/10 rounded-lg divide-y divide-white/5">
                {children.length === 0 && (
                  <p className="px-3 py-3 text-[12px] text-sand/40 italic">No children yet. Add one above.</p>
                )}
                {children.map((child, idx) => (
                  <ChildRow
                    key={idx}
                    child={child}
                    index={idx}
                    onUpdate={updateChild}
                    onToggle={toggleChild}
                    onRemove={removeChild}
                    isSystem={item.isSystem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Auto note */}
          {type === "auto" && (
            <p className="text-[12px] text-sand/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
              This dropdown is automatically populated from the Clubs database.
              You can rename the label but cannot edit children manually here.
            </p>
          )}

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] text-sand/70 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-midnight bg-gold hover:bg-[#e6b866] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add new item modal ───────────────────────────────────────────────────────

interface AddModalProps {
  currentCount: number;
  onSave: (item: Omit<DbNavItem, "id" | "isSystem">) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function AddModal({ currentCount, onSave, onClose, saving }: AddModalProps) {
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("/");
  const [type, setType] = useState<"page" | "dropdown">("page");
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) { setError("Label is required."); return; }
    if (!href.trim() || !href.startsWith("/")) { setError("Href must start with /"); return; }
    setError("");
    await onSave({ label: label.trim(), href: href.trim(), type, autoSource: null, children: [], order: currentCount + 1, visible: true });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Add nav title" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-heading font-bold text-sand flex items-center gap-2">
            <Plus className="w-4 h-4 text-gold" />
            <span>Add Navbar Title</span>
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-sand/60 hover:text-sand transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="add-label">Label *</label>
            <input ref={ref} id="add-label" type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-[14px] text-sand focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="e.g. Research" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="add-href">Route *</label>
            <input id="add-href" type="text" value={href} onChange={(e) => setHref(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-[14px] font-mono text-sand/90 focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="/research" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-sand/60 tracking-wider" htmlFor="add-type">Type</label>
            <select id="add-type" value={type} onChange={(e) => setType(e.target.value as "page" | "dropdown")}
              className="w-full bg-[#0B132B] border border-white/15 rounded-lg px-3 py-2.5 text-[14px] text-sand focus:outline-none focus:border-gold/50 transition-colors">
              <option value="page">Page (no dropdown)</option>
              <option value="dropdown">Dropdown (manual children)</option>
            </select>
          </div>
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-sand/70 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-[13px] font-bold text-midnight bg-gold hover:bg-[#e6b866] disabled:opacity-60 flex items-center gap-2 transition-colors">
              {saving ? <Loader2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Title</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function AdminNavbarTitlesPanel() {
  const [items, setItems] = useState<DbNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editItem, setEditItem] = useState<DbNavItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const showStatus = (type: "ok" | "err", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // ── load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/nav-items")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setItems(data?.items?.length ? data.items : defaultNavItems);
      })
      .catch(() => setItems(defaultNavItems))
      .finally(() => setLoading(false));
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────

  const toggleExpand = (id: string) =>
    setExpandedRows((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
  };

  const toggleVisible = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i));
    setItems(updated);
    try {
      await fetch(`/api/admin/nav-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
    } catch {/* silent */}
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/nav-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (data.items?.length) setItems(data.items);
      showStatus("ok", "Navbar titles saved successfully. Changes are live.");
    } catch {
      showStatus("err", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (updated: DbNavItem) => {
    setSaving(true);
    try {
      const isObjectId = /^[a-f0-9]{24}$/.test(updated.id);
      const res = isObjectId
        ? await fetch(`/api/admin/nav-items/${updated.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: updated.label,
              href: updated.href,
              type: updated.type,
              children: updated.children,
            }),
          })
        : await fetch("/api/admin/nav-items", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: items.map((i) => (i.id === updated.id ? updated : i)) }),
          });
      if (!res.ok) throw new Error("Update failed");
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      showStatus("ok", `"${updated.label}" updated.`);
      setEditItem(null);
    } catch {
      showStatus("err", "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSave = async (newItem: Omit<DbNavItem, "id" | "isSystem">) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/nav-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
      showStatus("ok", `"${newItem.label}" added to navbar.`);
      setShowAdd(false);
    } catch {
      showStatus("err", "Failed to add title.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.isSystem) { showStatus("err", "System items cannot be deleted. Hide them instead."); return; }
    if (!confirm(`Delete "${item.label}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/nav-items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      showStatus("ok", `"${item.label}" deleted.`);
    } catch {
      showStatus("err", "Delete failed.");
    }
  };

  const visibleCount = items.filter((i) => i.visible).length;
  const phone = siteSettings.officePhone?.trim() || "";
  const isPhoneValid = phone && !phone.toLowerCase().includes("content");
  const brochureUrl = siteSettings.brochurePdfUrl?.trim() || "";
  const highlightText = siteSettings.highlightPillText?.trim() || "";

  return (
    <>
      {editItem && (
        <EditModal item={editItem} onSave={handleEditSave} onClose={() => setEditItem(null)} saving={saving} />
      )}
      {showAdd && (
        <AddModal currentCount={items.length} onSave={handleAddSave} onClose={() => setShowAdd(false)} saving={saving} />
      )}

      <div className="rounded-2xl bg-[#0B132B]/85 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
        {/* Panel header */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Navbar Titles</span>
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-sand">
              Public Navigation Titles
            </h3>
            <p className="text-xs text-sand/60 mt-0.5">
              {loading ? "Loading…" : `${visibleCount} of ${items.length} titles visible · drag rows to reorder`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Status indicator */}
            {statusMsg && (
              <span className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border ${
                statusMsg.type === "ok"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}>
                {statusMsg.text}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sand/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-gold" />
              <span>Add title</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-midnight bg-gold hover:bg-[#e6b866] disabled:opacity-60 transition-all flex items-center gap-1.5 shadow-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save order</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold text-sand/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </a>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gold" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Header row with exact Left, Center, and Right alignments */}
            <div className="hidden sm:grid grid-cols-[32px_1fr_140px_100px_90px_100px] gap-3 px-6 py-2.5 text-[10px] font-mono uppercase text-sand/40 tracking-wider bg-white/[0.02] border-b border-white/5">
              <span className="text-left" />
              <span className="text-left">Title / Route (Left)</span>
              <span className="text-center">Type (Center)</span>
              <span className="text-center">Status (Center)</span>
              <span className="text-center">Order (Center)</span>
              <span className="text-right">Actions (Right)</span>
            </div>

            {items.map((item, idx) => {
              const expanded = expandedRows.has(item.id);
              const hasChildren = item.children.length > 0 || item.type === "auto";

              return (
                <div key={item.id} className={`${!item.visible ? "opacity-50" : ""}`}>
                  {/* Main row */}
                  <div className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[32px_1fr_140px_100px_90px_100px] gap-3 px-6 py-3.5 items-center hover:bg-white/[0.02] transition-colors group">
                    {/* 1. Drag handle (Left) */}
                    <div className="flex items-center justify-start">
                      <GripVertical className="w-4 h-4 text-sand/25 cursor-grab shrink-0" aria-hidden="true" />
                    </div>

                    {/* 2. Title + route (Left-aligned) */}
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-sand truncate">{item.label}</span>
                        {item.isSystem && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-sand/40 border border-white/10 shrink-0">
                            System
                          </span>
                        )}
                        <span className="sm:hidden">{typeBadge(item.type, item.autoSource)}</span>
                      </div>
                      <div className="text-[11px] font-mono text-sand/40 mt-0.5 truncate">{item.href}</div>
                      {/* Mobile-only sub-info */}
                      <div className="sm:hidden flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-sand/50">{item.visible ? "Visible" : "Hidden"}</span>
                        <span className="text-[11px] text-sand/30">·</span>
                        <span className="text-[11px] text-sand/50">Order {item.order}</span>
                      </div>
                    </div>

                    {/* 3. Type badge (Center-aligned) */}
                    <div className="hidden sm:flex items-center justify-center">
                      {typeBadge(item.type, item.autoSource)}
                    </div>

                    {/* 4. Visibility toggle (Center-aligned) */}
                    <div className="hidden sm:flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => toggleVisible(item.id)}
                        aria-label={item.visible ? "Hide from navbar" : "Show in navbar"}
                        className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          item.visible
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
                            : "bg-white/5 text-sand/40 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.visible ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* 5. Order arrows (Center-aligned) */}
                    <div className="hidden sm:flex items-center justify-center gap-1">
                      <span className="text-xs font-mono text-sand/50 mr-1">{item.order}</span>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move up"
                        className="p-1 text-sand/40 hover:text-sand disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        aria-label="Move down"
                        className="p-1 text-sand/40 hover:text-sand disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 6. Action buttons (Right-aligned) */}
                    <div className="flex items-center justify-end gap-1.5 text-right">
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          aria-expanded={expanded}
                          aria-label={expanded ? "Collapse children" : "Expand children"}
                          className="p-1.5 text-sand/40 hover:text-sand transition-colors"
                        >
                          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditItem(item)}
                        aria-label={`Edit ${item.label}`}
                        className="p-1.5 text-sand/40 hover:text-gold transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!item.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete ${item.label}`}
                          className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded children */}
                  {expanded && item.children.length > 0 && (
                    <div className="bg-white/[0.015] border-t border-white/5 px-10 py-2 space-y-0.5">
                      {item.children
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((child, ci) => (
                          <div key={ci} className="flex items-center gap-3 py-1.5 text-[12px]">
                            <span className={`font-semibold ${child.visible ? "text-sand/80" : "text-sand/30"}`}>{child.label}</span>
                            <span className="font-mono text-sand/30">{child.href}</span>
                            {!child.visible && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-sand/30 border border-white/10">
                                Hidden
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  {expanded && item.type === "auto" && (
                    <div className="bg-white/[0.015] border-t border-white/5 px-10 py-2">
                      <p className="text-[12px] text-sand/50 italic">
                        Children populated automatically from the Clubs module.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Utility Buttons & Reel Words linked cards ──────────────────── */}
        <div className="px-6 sm:px-8 py-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Utility buttons card */}
          <Link
            href="/admin/settings"
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/[0.08] transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <Phone className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-heading font-bold text-sand group-hover:text-gold transition-colors flex items-center gap-1.5">
                <span>Utility Buttons</span>
                <ExternalLink className="w-3 h-3 text-sand/30 group-hover:text-gold" />
              </div>
              <div className="text-[11px] text-sand/50 mt-0.5 space-y-0.5">
                {isPhoneValid ? (
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /><span className="truncate">{phone}</span></div>
                ) : (
                  <span className="italic">No phone set</span>
                )}
                {brochureUrl ? (
                  <div className="flex items-center gap-1.5"><FileText className="w-3 h-3 shrink-0" /><span className="truncate">Brochure uploaded</span></div>
                ) : (
                  <span className="italic">No brochure set</span>
                )}
                {highlightText && (
                  <div className="text-gold/70 truncate">{highlightText}</div>
                )}
              </div>
            </div>
          </Link>

          {/* Reel words card */}
          <Link
            href="/admin/settings"
            className="group flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/[0.08] transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
              <AlignLeft className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-heading font-bold text-sand group-hover:text-gold transition-colors flex items-center gap-1.5">
                <span>Reel Words</span>
                <ExternalLink className="w-3 h-3 text-sand/30 group-hover:text-gold" />
              </div>
              <div className="text-[11px] text-sand/50 mt-0.5">
                {(siteSettings.brandReel?.filter((r) => r.active) ?? []).length} active word
                {(siteSettings.brandReel?.filter((r) => r.active) ?? []).length !== 1 ? "s" : ""} in the reel strip
              </div>
              <div className="text-[10px] text-sand/30 mt-1">Edit in Site Settings</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
