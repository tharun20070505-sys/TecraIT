"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import type { NoticeItem } from "@/types";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    startDate: "",
    endDate: "",
    active: true,
    order: 0,
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadNotices = async () => {
      try {
        const res = await fetch("/api/admin/notices");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setNotices(data.notices || []);
        }
      } catch (err) {
        console.error("Failed to load notices", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadNotices();
    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      link: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      active: true,
      order: (notices.length + 1) * 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      link: notice.link || "",
      startDate: notice.startDate || "",
      endDate: notice.endDate || "",
      active: notice.active,
      order: notice.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusMessage({ type: "error", text: "Notice title is required." });
      return;
    }

    try {
      setSaving(true);
      if (editingNotice) {
        const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update notice");
        setStatusMessage({ type: "success", text: "Notice updated successfully." });
      } else {
        const res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create notice");
        setStatusMessage({ type: "success", text: "Notice created successfully." });
      }
      setIsModalOpen(false);
      fetchNotices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete notice");
      setStatusMessage({ type: "success", text: "Notice deleted." });
      setDeleteConfirmId(null);
      fetchNotices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const toggleActive = async (notice: NoticeItem) => {
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !notice.active }),
      });
      if (res.ok) {
        fetchNotices();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Notices & Announcements"
        subtitle="Manage flash notices and announcements displayed in the header reel"
      />

      <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,48px)),1400px)] mx-auto mt-8 space-y-6">
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

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight border border-sand/20 rounded-[3px] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-burgundy-deep/80 border border-burgundy/50 flex items-center justify-center text-gold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Active Notices</h2>
              <p className="text-[13px] text-sand/70">
                Notices appear sequentially in the header word reel after the core brand words.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchNotices}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-sand/80 hover:text-white bg-deep-navy border border-sand/20 rounded-[2px] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold text-white bg-royal-blue hover:bg-royal-blue/90 rounded-[2px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Notice</span>
            </button>
          </div>
        </div>

        {/* Notices Table */}
        <div className="bg-midnight border border-sand/20 rounded-[3px] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sand/60 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-gold" />
              <span>Loading notices...</span>
            </div>
          ) : notices.length === 0 ? (
            <div className="p-12 text-center text-sand/60 space-y-2">
              <p className="font-semibold text-sand">No notices published yet.</p>
              <p className="text-[13px]">
                The header word reel is currently displaying only the core brand identity words.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-sand/15 bg-deep-navy/40 text-sand/70 text-[12px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Title & Link</th>
                    <th className="py-3 px-4">Valid Period</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/10">
                  {notices.map((n) => {
                    const isExpired = n.endDate && n.endDate < today;
                    return (
                      <tr key={n.id} className="hover:bg-deep-navy/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{n.title}</div>
                          {n.link && (
                            <a
                              href={n.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[12px] text-gold hover:underline mt-0.5"
                            >
                              <span>{n.link}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[13px] text-sand/80">
                          {n.startDate || n.endDate ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span>
                                {n.startDate || "Anytime"} &rarr; {n.endDate || "No Expiry"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sand/50">Always Active</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-burgundy-deep/60 text-coral border border-burgundy/60 text-[11px] font-semibold uppercase">
                              <Clock className="w-3 h-3" />
                              Expired
                            </span>
                          ) : n.active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-emerald-deep/60 text-emerald border border-emerald/60 text-[11px] font-semibold uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-sand/10 text-sand/60 border border-sand/20 text-[11px] font-semibold uppercase">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleActive(n)}
                              title={n.active ? "Deactivate" : "Activate"}
                              className="p-1.5 rounded-[2px] text-sand/70 hover:text-white hover:bg-deep-navy border border-sand/20 transition-colors"
                            >
                              {n.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-coral" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(n)}
                              title="Edit"
                              className="p-1.5 rounded-[2px] text-sand/70 hover:text-gold hover:bg-deep-navy border border-sand/20 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {deleteConfirmId === n.id ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(n.id)}
                                className="px-2 py-1 rounded-[2px] bg-burgundy text-white text-[12px] font-bold"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(n.id)}
                                title="Delete"
                                className="p-1.5 rounded-[2px] text-coral hover:bg-burgundy-deep/60 border border-burgundy/40 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-midnight border border-sand/30 rounded-[3px] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-sand/15 pb-4">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingNotice ? "Edit Notice" : "Add New Notice"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sand/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-[14px]">
              <div>
                <label className="block font-semibold text-sand mb-1">
                  Notice Text / Announcement <span className="text-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Registrations open for National Level Technical Symposium"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-sand mb-1">
                  Target Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /events or https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sand mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sand mb-1">End / Expiry Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-deep-navy border border-sand/25 rounded-[2px] text-white outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notice-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-royal-blue rounded-[2px]"
                />
                <label htmlFor="notice-active" className="text-sand cursor-pointer font-medium">
                  Active (show in header reel)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sand/70 hover:text-white rounded-[2px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold rounded-[2px] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingNotice ? "Save Changes" : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
