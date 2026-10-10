"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Loader2,
  Upload,
  RefreshCw,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSafeImageUrl } from "@/lib/utils";
import type { FacultyMember } from "@/types";

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    position: "Assistant Professor",
    qualification: "",
    specialisation: "",
    email: "",
    contactNumber: "",
    showEmail: true,
    showContactNumber: true,
    photoUrl: "/images/faculty/avatar-placeholder.png",
    isHod: false,
    bio: "",
    quote: "",
    quota: "",
    quotaLabel: "",
    order: 10,
  });

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faculty");
      if (res.ok) {
        const data = await res.json();
        setFaculty(data.faculty || []);
      }
    } catch (err) {
      console.error("Failed to load faculty", err);
      setMessage({ type: "error", text: "Failed to load faculty directory." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const res = await fetch("/api/admin/faculty");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setFaculty(data.faculty || []);
          }
        }
      } catch (err) {
        console.error("Failed to load faculty", err);
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
      name: "",
      position: "Assistant Professor",
      qualification: "M.E., Ph.D.",
      specialisation: "Computer Networks & Cloud Computing",
      email: "faculty@sriet.ac.in",
      contactNumber: "+91 94432 00000",
      showEmail: true,
      showContactNumber: true,
      photoUrl: "/images/faculty/avatar-placeholder.png",
      isHod: false,
      bio: "Faculty member in the Department of Information Technology at SRIET.",
      quote: "Committed to nurturing technical innovation and engineering leadership.",
      quota: "",
      quotaLabel: "",
      order: faculty.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: FacultyMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      position: member.position,
      qualification: member.qualification,
      specialisation: member.specialisation,
      email: member.email || "",
      contactNumber: member.contactNumber || "",
      showEmail: member.showEmail !== false,
      showContactNumber: member.showContactNumber !== false,
      photoUrl: member.photoUrl || "/images/faculty/avatar-placeholder.png",
      isHod: !!member.isHod,
      bio: member.bio || "",
      quote: member.quote || "",
      quota: member.quota || "",
      quotaLabel: member.quotaLabel || "",
      order: member.order ?? 10,
    });
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setFormData((prev) => ({ ...prev, photoUrl: json.url }));
      setMessage({ type: "success", text: "Photograph uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo";
      setMessage({ type: "error", text: msg });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/admin/faculty/${editingId}` : "/api/admin/faculty";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to save faculty record");
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Faculty profile updated successfully!"
          : "New faculty member registered successfully!",
      });
      setIsModalOpen(false);
      loadFaculty();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving record";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/faculty/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setMessage({ type: "success", text: "Faculty member removed from directory." });
      setDeleteConfirmId(null);
      loadFaculty();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting record";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Filtered List
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDesignation =
      filterDesignation === "all" ||
      (filterDesignation === "hod" && f.isHod) ||
      (filterDesignation === "prof" && f.position.toLowerCase().includes("professor") && !f.position.toLowerCase().includes("assistant")) ||
      (filterDesignation === "asst" && f.position.toLowerCase().includes("assistant"));

    return matchesSearch && matchesDesignation;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Faculty Directory Management"
        subtitle="Manage professors, assistant professors, and technical appointments"
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

        {/* Top Control Bar: Search, Filter, Add */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B132B]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/40" />
              <input
                type="text"
                placeholder="Search faculty by name, qualification, specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/15 rounded-xl text-xs text-sand placeholder:text-sand/40 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60"
              />
            </div>

            {/* Designation Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sand/40 hidden sm:block" />
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
              >
                <option value="all">All Designations</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="prof">Professors & Assoc. Prof</option>
                <option value="asst">Assistant Professors</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadFaculty}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sand/70 hover:text-sand transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-gradient-to-r from-gold to-[#e6b866] hover:from-[#e6b866] hover:to-gold text-midnight font-bold text-xs rounded-xl shadow-md shadow-gold/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          </div>
        </div>

        {/* Faculty Table / Grid */}
        <div className="rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-sand/60">
            <div>
              Showing <span className="text-sand font-bold">{filteredFaculty.length}</span> faculty members
            </div>
            <div className="text-[11px] font-mono text-sand/40">
              Order controls priority on public `/faculty` page
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-sand/50 text-xs">
              <Loader2 className="w-6 h-6 text-gold" />
              <span>Loading faculty directory...</span>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="py-20 text-center text-xs text-sand/50">
              No faculty members match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-sand/40 font-mono uppercase text-[10px] bg-white/[0.02]">
                    <th className="py-3.5 px-4">Profile</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Specialization</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4 text-center">Order</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFaculty.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* Photo + Name + Qualification */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                            <Image
                              src={getSafeImageUrl(member.photoUrl)}
                              alt={member.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-sand flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.isHod && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-gold/20 text-gold border border-gold/30">
                                  HOD
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-sand/50 flex items-center gap-1 mt-0.5">
                              <GraduationCap className="w-3 h-3 text-gold/70" />
                              <span>{member.qualification}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-sand/80">
                          <Briefcase className="w-3.5 h-3.5 text-sand/40" />
                          <span>{member.position}</span>
                        </div>
                      </td>

                      {/* Specialisation */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-sand/70 text-[11px]" title={member.specialisation}>
                          {member.specialisation}
                        </div>
                      </td>

                      {/* Contact Info + Visibility Toggles */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-sand/70">
                            <Mail className="w-3 h-3 text-sand/40" />
                            <span className="truncate max-w-[140px]">{member.email || "Not specified"}</span>
                            {member.showEmail !== false ? (
                              <span title="Visible on public site">
                                <Eye className="w-3 h-3 text-emerald" />
                              </span>
                            ) : (
                              <span title="Hidden from public site">
                                <EyeOff className="w-3 h-3 text-sand/40" />
                              </span>
                            )}
                          </div>
                          {member.contactNumber && (
                            <div className="flex items-center gap-1.5 text-[11px] text-sand/50">
                              <Phone className="w-3 h-3 text-sand/40" />
                              <span>{member.contactNumber}</span>
                              {member.showContactNumber !== false ? (
                                <span title="Visible on public site">
                                  <Eye className="w-3 h-3 text-emerald" />
                                </span>
                              ) : (
                                <span title="Hidden from public site">
                                  <EyeOff className="w-3 h-3 text-sand/40" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Order Priority */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-sand/70 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[11px]">
                          {member.order ?? 10}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-sand/70 hover:text-gold border border-white/10 hover:border-gold/30 transition-colors"
                            title="Edit profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(member.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/70 hover:text-rose border border-white/10 hover:border-rose/30 transition-colors"
                            title="Delete faculty"
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
                <Users className="w-4 h-4 text-gold" />
                <span>{editingId ? "Edit Faculty Member" : "Register New Faculty Member"}</span>
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
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. K. Radhika M.E., Ph.D."
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Associate Professor"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.E. (CSE), Ph.D."
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Specialisation */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Specialisation *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialisation}
                    onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                    placeholder="e.g. Deep Learning & Edge AI"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@sriet.ac.in"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 94432 00000"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">Photograph Asset</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0">
                    <Image
                      src={getSafeImageUrl(formData.photoUrl)}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="/images/faculty/... or https://..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                    />
                  </div>
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-sand cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    {uploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-gold" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>

              {/* Toggles & Meta: Order & isHod */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Display Order Priority</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isHod"
                    checked={formData.isHod}
                    onChange={(e) => setFormData({ ...formData, isHod: e.target.checked })}
                    className="w-4 h-4 rounded text-gold bg-black/40 border-white/20"
                  />
                  <label htmlFor="isHod" className="text-xs text-sand cursor-pointer">
                    Head of Department (HOD)
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="showEmail"
                    checked={formData.showEmail}
                    onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-gold bg-black/40 border-white/20"
                  />
                  <label htmlFor="showEmail" className="text-xs text-sand cursor-pointer">
                    Show Email Publicly
                  </label>
                </div>
              </div>

              {/* Bio & Quote */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">Biography / Academic Profile</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Academic interests, career highlights, research publications..."
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
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <span>{editingId ? "Update Faculty Member" : "Save Faculty Member"}</span>
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
                Confirm Faculty Removal
              </h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Are you sure you want to remove this faculty member from the directory? This action will update the live public website directory.
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
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
