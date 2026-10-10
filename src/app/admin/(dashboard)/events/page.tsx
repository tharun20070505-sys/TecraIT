"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Loader2,
  Upload,
  RefreshCw,
  Tag,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSafeImageUrl } from "@/lib/utils";
import type { EventItem } from "@/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScope, setFilterScope] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:30 AM - 04:30 PM IST",
    venue: "TECRA High Performance Lab, SRIET",
    description: "",
    fullContent: "",
    posterUrl: "/images/events/placeholder-event.png",
    isUpcoming: true,
    scope: "Department" as EventItem["scope"],
    category: "Workshop" as EventItem["category"],
    registrationUrl: "https://forms.gle/tecra-registration",
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load events", err);
      setMessage({ type: "error", text: "Failed to load events announcements." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setEvents(data.events || []);
          }
        }
      } catch (err) {
        console.error("Failed to load events", err);
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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:30 AM - 04:30 PM IST",
      venue: "TECRA High Performance Computing Center, SRIET",
      description: "Comprehensive hands-on technical workshop organized by TECRA Department of IT.",
      fullContent: "Participants will engage in deep-dive architectural discussions and building real-world software modules.",
      posterUrl: "/images/events/placeholder-event.png",
      isUpcoming: true,
      scope: "Department",
      category: "Workshop",
      registrationUrl: "https://forms.gle/tecra-registration",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      slug: event.slug,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      fullContent: event.fullContent || event.description,
      posterUrl: event.posterUrl || "/images/events/placeholder-event.png",
      isUpcoming: event.isUpcoming,
      scope: event.scope,
      category: event.category,
      registrationUrl: event.registrationUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingId ? prev.slug : slug,
    }));
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setFormData((prev) => ({ ...prev, posterUrl: json.url }));
      setMessage({ type: "success", text: "Poster uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload poster";
      setMessage({ type: "error", text: msg });
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to save event notice");
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Event announcement updated successfully!"
          : "New event notice published successfully!",
      });
      setIsModalOpen(false);
      loadEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving event";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setMessage({ type: "success", text: "Event announcement removed." });
      setDeleteConfirmId(null);
      loadEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting event";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScope =
      filterScope === "all" || ev.scope === filterScope;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "upcoming" && ev.isUpcoming) ||
      (filterStatus === "completed" && !ev.isUpcoming);

    return matchesSearch && matchesScope && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Events & Announcements Management"
        subtitle="Publish workshops, national symposiums, hackathons, and guest lectures"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Flash Notifications */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              message.type === "success"
                ? "bg-emerald/10 border-emerald/30 text-emerald"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-sand/50 hover:text-sand"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Control Bar: Search, Filters, Add Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B132B]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/40" />
              <input
                type="text"
                placeholder="Search events by title, venue, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/15 rounded-xl text-xs text-sand placeholder:text-sand/40 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60"
              />
            </div>

            {/* Scope Filter */}
            <div className="flex items-center gap-2">
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
              >
                <option value="all">All Scopes</option>
                <option value="Department">Department Level</option>
                <option value="College">College Level</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming Only</option>
                <option value="completed">Completed / Archive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadEvents}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sand/70 hover:text-sand transition-colors"
              title="Refresh events"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-gradient-to-r from-gold to-[#e6b866] hover:from-[#e6b866] hover:to-gold text-midnight font-bold text-xs rounded-xl shadow-md shadow-gold/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Event Notice</span>
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-sand/60">
            <div>
              Showing <span className="text-sand font-bold">{filteredEvents.length}</span> events & notices
            </div>
            <div className="text-[11px] font-mono text-sand/40">
              Synced with `/events` and `/events/[slug]`
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-sand/50 text-xs">
              <Loader2 className="w-6 h-6 text-gold" />
              <span>Loading event announcements...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-20 text-center text-xs text-sand/50">
              No events found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-sand/40 font-mono uppercase text-[10px] bg-white/[0.02]">
                    <th className="py-3.5 px-4">Event Details</th>
                    <th className="py-3.5 px-4">Schedule & Venue</th>
                    <th className="py-3.5 px-4">Scope & Category</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-sand flex items-center gap-2">
                          <span>{ev.title}</span>
                        </div>
                        <div className="text-[11px] text-sand/50 font-mono mt-0.5">
                          /events/{ev.slug}
                        </div>
                        <div className="text-xs text-sand/60 truncate mt-1 max-w-xs">
                          {ev.description}
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sand font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          <span>{ev.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sand/50 text-[11px] mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{ev.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sand/60 text-[11px] mt-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-sand/40 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                      </td>

                      {/* Scope & Category Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              ev.scope === "Department"
                                ? "bg-gold/15 text-gold border-gold/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {ev.scope}
                          </span>
                          <span className="text-[10px] text-sand/60 font-mono flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {ev.category}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {ev.isUpcoming ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald/15 text-emerald text-[10px] font-bold border border-emerald/30 font-mono inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                            UPCOMING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-sand/50 text-[10px] font-mono">
                            COMPLETED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/events/${ev.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand border border-white/10 transition-colors"
                            title="View public page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openEditModal(ev)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-sand/70 hover:text-gold border border-white/10 hover:border-gold/30 transition-colors"
                            title="Edit event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(ev.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/70 hover:text-rose border border-white/10 hover:border-rose/30 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0B132B] border border-white/15 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-sand flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                <span>{editingId ? "Edit Event Notice" : "Publish New Event Notice"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-sand/50 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. TECRA HackSprint 2026: GenAI & Edge Systems"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">URL Identifier (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="tecra-hacksprint-2026"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 font-mono"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Time Schedule *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:30 AM - 04:30 PM IST"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Venue / Auditorium *</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="TECRA AI Labs, SRIET Campus"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Scope */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Event Scope *</label>
                  <select
                    value={formData.scope}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scope: e.target.value as EventItem["scope"],
                      })
                    }
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
                  >
                    <option value="Department">Department Level</option>
                    <option value="College">College / Institutional</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as EventItem["category"],
                      })
                    }
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Industrial Visit">Industrial Visit</option>
                    <option value="Technical Competition">Technical Competition</option>
                  </select>
                </div>
              </div>

              {/* Poster Upload */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">Event Poster Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0">
                    <Image
                      src={getSafeImageUrl(formData.posterUrl, "/images/events/placeholder-event.png")}
                      alt="Poster"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      placeholder="/images/events/... or https://..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                    />
                  </div>
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-sand cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    {uploadingPoster ? (
                      <Loader2 className="w-3.5 h-3.5" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-gold" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      className="hidden"
                      disabled={uploadingPoster}
                    />
                  </label>
                </div>
              </div>

              {/* Registration Link & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Registration Link (URL)</label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://forms.gle/..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isUpcoming"
                    checked={formData.isUpcoming}
                    onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })}
                    className="w-4 h-4 rounded text-gold bg-black/40 border-white/20"
                  />
                  <label htmlFor="isUpcoming" className="text-xs text-sand cursor-pointer">
                    Mark as Active / Upcoming Event
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">Short Summary (Description) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key highlights and purpose of the event..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">Full Content / Agenda / Rules</label>
                <textarea
                  rows={3}
                  value={formData.fullContent}
                  onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
                  placeholder="Detailed schedule, speakers, eligibility criteria, prize pool..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-midnight bg-gold hover:bg-[#e6b866] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5" />
                      <span>Saving Notice...</span>
                    </>
                  ) : (
                    <span>{editingId ? "Update Event Notice" : "Publish Event Notice"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0B132B] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose">
              <div className="p-2.5 rounded-xl bg-rose/10 border border-rose/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-sand">
                Confirm Event Removal
              </h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Are you sure you want to remove this event announcement? This will remove the event listing and its detail route.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose hover:bg-rose/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5" /> : null}
                <span>Delete Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
