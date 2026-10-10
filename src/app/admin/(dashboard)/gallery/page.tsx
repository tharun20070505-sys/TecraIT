"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Check,
  X,
  AlertCircle,
  Loader2,
  Upload,
  RefreshCw,
  Eye,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSafeImageUrl } from "@/lib/utils";
import type { GalleryItem } from "@/types";

const CATEGORIES: ("All" | GalleryItem["category"])[] = [
  "All",
  "Campus",
  "Hackathons",
  "Workshops",
  "Symposium",
  "Events",
  "Clubs",
  "Industrial Visit",
  "Achievements",
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState<GalleryItem | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "/images/gallery/lab-workstation-1.png",
    category: "Campus" as GalleryItem["category"],
    caption: "",
    date: new Date().toISOString().split("T")[0],
    order: 10,
  });

  const loadGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load gallery items", err);
      setMessage({ type: "error", text: "Failed to load gallery media." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const res = await fetch("/api/admin/gallery");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setItems(data.items || []);
          }
        }
      } catch (err) {
        console.error("Failed to load gallery items", err);
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
    setFormData({
      title: "",
      imageUrl: "/images/gallery/lab-workstation-1.png",
      category: "Campus",
      caption: "Students engaged in advanced computing practice at SRIET.",
      date: new Date().toISOString().split("T")[0],
      order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
      setMessage({ type: "success", text: "Image file uploaded successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setMessage({ type: "error", text: msg });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to add photograph");
      }

      setMessage({ type: "success", text: "Photograph archived into gallery!" });
      setIsModalOpen(false);
      loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving photograph";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setMessage({ type: "success", text: "Photograph removed from gallery." });
      setDeleteConfirmId(null);
      loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting image";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      filterCategory === "All" || item.category === filterCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Gallery Media Archival"
        subtitle="Manage and upload laboratory, hackathon, and campus photographs"
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

        {/* Controls: Search, Category Tabs, Upload Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B132B]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/40" />
              <input
                type="text"
                placeholder="Search gallery by title or caption..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/15 rounded-xl text-xs text-sand placeholder:text-sand/40 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sand/40 hidden sm:block" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadGallery}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sand/70 hover:text-sand transition-colors"
              title="Refresh gallery"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-gradient-to-r from-gold to-[#e6b866] hover:from-[#e6b866] hover:to-gold text-midnight font-bold text-xs rounded-xl shadow-md shadow-gold/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photograph</span>
            </button>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-sand/60 px-1">
            <div>
              Showing <span className="text-sand font-bold">{filteredItems.length}</span> photographs
            </div>
            <div className="text-[11px] font-mono text-sand/40">
              Live on `/gallery`
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-sand/50 text-xs">
              <Loader2 className="w-6 h-6 text-gold" />
              <span>Loading media assets...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center text-xs text-sand/50 bg-[#0B132B]/40 rounded-2xl border border-white/5">
              No gallery items found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-lg flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/3 w-full bg-black/40 overflow-hidden">
                    <Image
                      src={getSafeImageUrl(item.imageUrl, "/images/hero/hero-background.jpg")}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-gold border border-gold/30">
                        {item.category}
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-rose text-white/70 hover:text-white backdrop-blur-md transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => setPreviewModalItem(item)}
                      className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Enlarge preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metadata Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-sand line-clamp-1 group-hover:text-gold transition-colors">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-[11px] text-sand/60 line-clamp-2 mt-1">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-sand/40 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold/60" />
                        <span>{item.date}</span>
                      </div>
                      <span>Order #{item.order ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0B132B] border border-white/15 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-sand flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold" />
                <span>Upload & Archive Photograph</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-sand/50 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Image Preview & Upload Option */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1.5">
                  Photograph Source *
                </label>
                <div className="space-y-3">
                  <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-black/50 border border-white/20">
                    <Image
                      src={getSafeImageUrl(formData.imageUrl, "/images/hero/hero-background.jpg")}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="/images/gallery/... or external URL"
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-sand cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                      {uploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-gold" />
                      )}
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">
                    Photograph Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Advanced AI Research Cluster"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">
                    Category Tag *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as GalleryItem["category"],
                      })
                    }
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 cursor-pointer"
                  >
                    <option value="Campus">Campus Infrastructure</option>
                    <option value="Hackathons">Hackathons & Competitions</option>
                    <option value="Workshops">Technical Workshops</option>
                    <option value="Symposium">National Symposium</option>
                    <option value="Events">Flagship Events</option>
                    <option value="Clubs">Club Activities</option>
                    <option value="Industrial Visit">Industrial Visits</option>
                    <option value="Achievements">Student Achievements</option>
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-sand/80 mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Contextual details about this activity or facility..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                />
              </div>

              {/* Date & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Date Recorded</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sand/80 mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-sand outline-none focus:border-gold/60 font-mono"
                  />
                </div>
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
                      <span>Saving Photograph...</span>
                    </>
                  ) : (
                    <span>Archive to Gallery</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewModalItem(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#0B132B] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 w-full bg-black">
              <Image
                src={getSafeImageUrl(previewModalItem.imageUrl, "/images/hero/hero-background.jpg")}
                alt={previewModalItem.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between bg-[#070B18]">
              <div>
                <h4 className="font-bold text-sm text-sand">{previewModalItem.title}</h4>
                <p className="text-xs text-sand/60 mt-0.5">{previewModalItem.caption}</p>
              </div>
              <button
                onClick={() => setPreviewModalItem(null)}
                className="p-2 rounded-xl bg-white/10 text-sand hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                Confirm Photo Deletion
              </h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Are you sure you want to remove this photograph from the department gallery? This will immediately remove it from public exhibition.
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
                <span>Delete Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
