"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Users,
  ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  MoveUp,
  MoveDown,
  ArrowRightLeft,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Target,
  ExternalLink,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface ClubData {
  id: string;
  slug: string;
  name: string;
  type: "technical" | "non-technical";
  logoUrl: string;
  shortDescription: string;
  about: string;
  vision?: string;
  mission?: string;
}

interface ImageItem {
  id: string;
  url: string;
  blurDataUrl?: string;
  alt: string;
  caption?: string;
  focalPoint: { x: number; y: number };
  order: number;
  active: boolean;
}

interface MemberItem {
  id: string;
  name: string;
  role: string;
  batch?: string;
  photo?: string;
  order: number;
  active: boolean;
}

interface OtherClub {
  slug: string;
  name: string;
}

const PREDEFINED_ROLES = [
  "Staff Advisor",
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Coordinator",
  "Member",
  "Custom Role",
];

export default function AdminClubDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [club, setClub] = useState<ClubData | null>(null);
  const [otherClubs, setOtherClubs] = useState<OtherClub[]>([]);
  const [activeTab, setActiveTab] = useState<"images" | "members" | "overview">("images");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // ---------------- IMAGES STATE ----------------
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: number }>({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [deleteConfirmImageId, setDeleteConfirmImageId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // ---------------- MEMBERS STATE ----------------
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    id: "",
    name: "",
    role: "Member",
    customRole: "",
    batch: "2023 to 2027",
    photo: "",
    order: 0,
    active: true,
  });
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [deleteConfirmMemberId, setDeleteConfirmMemberId] = useState<string | null>(null);
  const [moveMemberModal, setMoveMemberModal] = useState<{
    memberId: string;
    memberName: string;
    targetClubSlug: string;
  } | null>(null);

  // ---------------- CSV IMPORT STATE ----------------
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [csvParsedRows, setCsvParsedRows] = useState<
    Array<{
      name: string;
      role: string;
      batch?: string;
      photo?: string;
      isDuplicate?: boolean;
    }>
  >([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);

  // ---------------- LOGO UPLOAD STATE ----------------
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoWarning, setLogoWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const memberPhotoInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [clubRes, imagesRes, membersRes] = await Promise.all([
          fetch(`/api/admin/clubs/${slug}`),
          fetch(`/api/admin/clubs/${slug}/images`),
          fetch(`/api/admin/clubs/${slug}/members`),
        ]);

        if (!clubRes.ok) throw new Error("Club not found");

        const clubData = await clubRes.json();
        if (isMounted) {
          setClub(clubData.club);
          setOtherClubs(clubData.otherClubs || []);
        }

        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          if (isMounted) setImages(imagesData.images || []);
        }

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          if (isMounted) setMembers(membersData.members || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load club details";
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
  }, [slug]);

  // =========================================================================
  // IMAGES TAB HANDLERS
  // =========================================================================

  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 30) {
      setStatusMessage({
        type: "error",
        text: `At most 30 images permitted per club. You currently have ${images.length}.`,
      });
      return;
    }

    setIsUploadingImages(true);
    setStatusMessage(null);

    const initialProgress: { [key: string]: number } = {};
    for (let i = 0; i < files.length; i++) {
      initialProgress[files[i].name] = 10;
    }
    setUploadProgress(initialProgress);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // Progress simulation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          if (updated[key] < 90) updated[key] += 20;
        }
        return updated;
      });
    }, 150);

    try {
      const res = await fetch(`/api/admin/clubs/${slug}/images`, {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Image upload failed");
      }

      // Complete progress
      const finalProgress: { [key: string]: number } = {};
      for (let i = 0; i < files.length; i++) {
        finalProgress[files[i].name] = 100;
      }
      setUploadProgress(finalProgress);

      setStatusMessage({
        type: "success",
        text: `Successfully uploaded ${json.createdCount} image${json.createdCount === 1 ? "" : "s"}.`,
      });

      // Reload images
      const refreshRes = await fetch(`/api/admin/clubs/${slug}/images`);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setImages(data.images || []);
      }
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Image upload encountered an error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsUploadingImages(false);
      setTimeout(() => setUploadProgress({}), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateImageDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    if (!editingImage.alt || editingImage.alt.trim() === "") {
      setStatusMessage({ type: "error", text: "Alt text is required for accessibility." });
      return;
    }

    try {
      const res = await fetch(`/api/admin/clubs/${slug}/images/${editingImage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: editingImage.alt,
          caption: editingImage.caption || "",
          focalPoint: editingImage.focalPoint,
          active: editingImage.active,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update image details");

      setImages((prev) =>
        prev.map((item) => (item.id === editingImage.id ? json.image : item))
      );
      setEditingImage(null);
      setStatusMessage({ type: "success", text: "Image properties updated successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating image";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleReplaceImageFile = async (imageId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/clubs/${slug}/images/${imageId}`, {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to replace image");

      setImages((prev) =>
        prev.map((item) => (item.id === imageId ? json.image : item))
      );
      if (editingImage?.id === imageId) {
        setEditingImage(json.image);
      }
      setStatusMessage({ type: "success", text: "Image replaced successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error replacing image";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/clubs/${slug}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setSelectedImageIds((prev) => prev.filter((id) => id !== imageId));
      setDeleteConfirmImageId(null);
      if (editingImage?.id === imageId) setEditingImage(null);
      setStatusMessage({ type: "success", text: "Image removed permanently from storage." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting image";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleBulkAction = async (action: "delete" | "hide" | "show") => {
    if (selectedImageIds.length === 0) return;

    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/clubs/${slug}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "bulk_delete",
            ids: selectedImageIds,
          }),
        });
        if (!res.ok) throw new Error("Bulk delete failed");
        setImages((prev) => prev.filter((img) => !selectedImageIds.includes(img.id)));
        setSelectedImageIds([]);
        setBulkDeleteConfirm(false);
        setStatusMessage({
          type: "success",
          text: "Selected images deleted and removed from storage.",
        });
      } else {
        const activeState = action === "show";
        const res = await fetch(`/api/admin/clubs/${slug}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "bulk_toggle_active",
            ids: selectedImageIds,
            active: activeState,
          }),
        });
        if (!res.ok) throw new Error("Bulk toggle failed");
        setImages((prev) =>
          prev.map((img) =>
            selectedImageIds.includes(img.id) ? { ...img, active: activeState } : img
          )
        );
        setSelectedImageIds([]);
        setStatusMessage({
          type: "success",
          text: `Selected images marked as ${activeState ? "active" : "hidden"}.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk action failed";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleMoveImageOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.splice(targetIndex, 0, moved);

    const reorderedList = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    setImages(reorderedList);

    try {
      await fetch(`/api/admin/clubs/${slug}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: reorderedList.map((item) => item.id),
        }),
      });
    } catch {
      setStatusMessage({ type: "warning", text: "Order could not be saved to server." });
    }
  };

  // Focal point interactive picker
  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editingImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setEditingImage({
      ...editingImage,
      focalPoint: {
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      },
    });
  };

  // =========================================================================
  // MEMBERS TAB HANDLERS
  // =========================================================================

  const openAddMemberModal = () => {
    setMemberFormData({
      id: "",
      name: "",
      role: "Member",
      customRole: "",
      batch: "2023 to 2027",
      photo: "",
      order: members.length + 1,
      active: true,
    });
    setMemberPhotoFile(null);
    setMemberPhotoPreview(null);
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: MemberItem) => {
    const isStandardRole = PREDEFINED_ROLES.slice(0, -1).includes(member.role);
    setMemberFormData({
      id: member.id,
      name: member.name,
      role: isStandardRole ? member.role : "Custom Role",
      customRole: isStandardRole ? "" : member.role,
      batch: member.batch || "",
      photo: member.photo || "",
      order: member.order,
      active: member.active,
    });
    setMemberPhotoFile(null);
    setMemberPhotoPreview(member.photo || null);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (addAnother = false) => {
    if (!memberFormData.name.trim()) {
      setStatusMessage({ type: "error", text: "Member name is required." });
      return;
    }

    const effectiveRole =
      memberFormData.role === "Custom Role"
        ? memberFormData.customRole.trim()
        : memberFormData.role;

    if (!effectiveRole) {
      setStatusMessage({ type: "error", text: "Please enter or select a valid role." });
      return;
    }

    // Check duplicate warning
    const isDuplicate = members.some(
      (m) =>
        m.id !== memberFormData.id &&
        m.name.toLowerCase().trim() === memberFormData.name.toLowerCase().trim() &&
        m.role.toLowerCase().trim() === effectiveRole.toLowerCase().trim()
    );

    if (isDuplicate) {
      const confirmDup = window.confirm(
        `Warning: A member named "${memberFormData.name}" with role "${effectiveRole}" already exists in this club. Do you still wish to proceed?`
      );
      if (!confirmDup) return;
    }

    setMemberSaving(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("name", memberFormData.name.trim());
    formData.append("role", effectiveRole);
    formData.append("batch", memberFormData.batch || "");
    formData.append("order", String(memberFormData.order || members.length + 1));
    formData.append("active", String(memberFormData.active));
    if (memberPhotoFile) {
      formData.append("photo", memberPhotoFile);
    }

    try {
      const isEditing = Boolean(memberFormData.id);
      const url = isEditing
        ? `/api/admin/clubs/${slug}/members/${memberFormData.id}`
        : `/api/admin/clubs/${slug}/members`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save member");

      if (isEditing) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberFormData.id ? json.member : m))
        );
        setIsMemberModalOpen(false);
        setStatusMessage({ type: "success", text: "Member updated successfully." });
      } else {
        setMembers((prev) => [...prev, json.member]);
        setStatusMessage({ type: "success", text: "New member added to roster." });
        if (addAnother) {
          // Keep form open with reset name and incremented order
          setMemberFormData((prev) => ({
            ...prev,
            id: "",
            name: "",
            order: members.length + 2,
          }));
          setMemberPhotoFile(null);
          setMemberPhotoPreview(null);
        } else {
          setIsMemberModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving member";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setMemberSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/clubs/${slug}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setDeleteConfirmMemberId(null);
      setStatusMessage({ type: "success", text: "Member removed from club roster." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting member";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleMoveMemberOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const [moved] = newMembers.splice(index, 1);
    newMembers.splice(targetIndex, 0, moved);

    const reorderedList = newMembers.map((m, i) => ({ ...m, order: i + 1 }));
    setMembers(reorderedList);

    try {
      await fetch(`/api/admin/clubs/${slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: reorderedList.map((item) => item.id),
        }),
      });
    } catch {
      setStatusMessage({ type: "warning", text: "Order could not be saved to server." });
    }
  };

  const handleMoveToAnotherClub = async () => {
    if (!moveMemberModal || !moveMemberModal.targetClubSlug) return;

    try {
      const res = await fetch(`/api/admin/clubs/${slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_club",
          memberId: moveMemberModal.memberId,
          targetClubSlug: moveMemberModal.targetClubSlug,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to move member");

      setMembers((prev) => prev.filter((m) => m.id !== moveMemberModal.memberId));
      setMoveMemberModal(null);
      setStatusMessage({
        type: "success",
        text: `Member successfully reassigned to ${moveMemberModal.targetClubSlug}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error moving member";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  // CSV Bulk Import Parsing
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) {
      setCsvParsedRows([]);
      setCsvErrors([]);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const roleIdx = headers.indexOf("role");
    const batchIdx = headers.indexOf("batch");
    const photoIdx = headers.indexOf("photo");

    const errors: string[] = [];
    if (nameIdx === -1 || roleIdx === -1) {
      errors.push("CSV header must contain 'name' and 'role' columns.");
    }

    const rows: Array<{
      name: string;
      role: string;
      batch?: string;
      photo?: string;
      isDuplicate?: boolean;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",").map((c) => c.trim());
      const name = cols[nameIdx] || "";
      const role = cols[roleIdx] || "";
      const batch = batchIdx !== -1 ? cols[batchIdx] : undefined;
      const photo = photoIdx !== -1 ? cols[photoIdx] : undefined;

      if (!name) {
        errors.push(`Row ${i + 1}: Member name is empty.`);
      }
      if (!role) {
        errors.push(`Row ${i + 1}: Member role is empty.`);
      }

      const isDup = members.some(
        (m) =>
          m.name.toLowerCase().trim() === name.toLowerCase().trim() &&
          m.role.toLowerCase().trim() === role.toLowerCase().trim()
      );

      if (name && role) {
        rows.push({ name, role, batch, photo, isDuplicate: isDup });
      }
    }

    setCsvParsedRows(rows);
    setCsvErrors(errors);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || "";
      setCsvContent(content);
      parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleSaveCsvBatch = async () => {
    if (csvParsedRows.length === 0 || csvErrors.length > 0) return;

    setCsvImporting(true);
    try {
      const res = await fetch(`/api/admin/clubs/${slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "csv_import",
          rows: csvParsedRows,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "CSV Import failed");

      setStatusMessage({
        type: "success",
        text: `Successfully imported ${json.createdCount} member records.`,
      });
      setIsCsvModalOpen(false);
      setCsvContent("");
      setCsvParsedRows([]);
      setCsvErrors([]);

      // Reload members
      const membersRes = await fetch(`/api/admin/clubs/${slug}/members`);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "CSV Import failed";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setCsvImporting(false);
    }
  };

  // =========================================================================
  // LOGO UPLOAD & OVERVIEW TAB
  // =========================================================================

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoWarning(null);

    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;

    setLogoUploading(true);
    setLogoWarning(null);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const res = await fetch(`/api/admin/clubs/${slug}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload logo");
      }

      setClub((prev) => (prev ? { ...prev, logoUrl: json.logoUrl } : null));
      setLogoFile(null);
      setLogoPreview(null);

      if (json.warning) {
        setLogoWarning(json.warning);
        setStatusMessage({ type: "warning", text: json.warning });
      } else {
        setStatusMessage({
          type: "success",
          text: "Club emblem uploaded, verified, and synchronized with Logo Reel.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Logo upload failed";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070B18] text-sand p-8">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-3" />
        <p className="text-xs font-mono">Loading club administration console</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070B18] text-sand p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose" />
        <h2 className="text-base font-bold">Club not found in records</h2>
        <Link
          href="/admin/clubs"
          className="px-4 py-2 rounded-xl bg-gold/20 text-gold text-xs font-semibold"
        >
          Return to Clubs Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#070B18]">
      <AdminHeader
        title={`${club.name} Management`}
        subtitle="Configure gallery image reel, student coordinators, and official emblem"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/clubs"
            className="inline-flex items-center gap-1.5 text-xs text-sand/60 hover:text-sand font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Clubs</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/clubs/${club.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand/80 hover:text-gold border border-white/10 text-xs font-semibold transition-colors"
            >
              <span>View Public Club Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Message Notification */}
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

        {/* Club Meta Card with Tabs */}
        <div className="bg-[#0B132B] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-[#070B18] border border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                {club.logoUrl ? (
                  <Image
                    src={club.logoUrl}
                    alt={`${club.name} emblem`}
                    width={52}
                    height={52}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-sand/40 font-mono">No Emblem</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold font-heading text-sand">
                    {club.name}
                  </h1>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      club.type === "technical"
                        ? "bg-emerald/20 text-emerald border-emerald/40"
                        : "bg-teal-500/20 text-teal-300 border-teal-500/40"
                    }`}
                  >
                    {club.type === "technical" ? "Technical Society" : "Creative Guild"}
                  </span>
                </div>
                <p className="text-xs text-sand/60 mt-1 max-w-2xl line-clamp-1">
                  {club.shortDescription}
                </p>
              </div>
            </div>

            {/* Quick Reel Status */}
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-sand/70">
                {images.filter((i) => i.active).length} Active Reel Photos
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-sand/70">
                {members.filter((m) => m.active).length} Roster Members
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 pt-2">
            <button
              onClick={() => setActiveTab("images")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "images"
                  ? "border-gold text-gold bg-white/5"
                  : "border-transparent text-sand/60 hover:text-sand hover:bg-white/5"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Images Reel ({images.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "members"
                  ? "border-gold text-gold bg-white/5"
                  : "border-transparent text-sand/60 hover:text-sand hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members Roster ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "overview"
                  ? "border-gold text-gold bg-white/5"
                  : "border-transparent text-sand/60 hover:text-sand hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Official Emblem and Info</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: IMAGES REEL */}
        {/* ================================================================= */}
        {activeTab === "images" && (
          <div className="space-y-6">
            {/* Image Toolbar */}
            <div className="bg-[#0B132B] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-sand font-heading">
                  Continuous Scrolling Image Reel
                </h2>
                <p className="text-xs text-sand/60">
                  Upload up to 30 photos in JPG, PNG or WebP format up to 8 MB each. Recommended 1600 by 1000 pixels.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {selectedImageIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <span className="text-xs font-mono text-sand/80 px-2">
                      {selectedImageIds.length} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction("show")}
                      className="px-2.5 py-1 text-xs rounded-lg bg-emerald/20 text-emerald hover:bg-emerald/30 font-semibold"
                    >
                      Make Active
                    </button>
                    <button
                      onClick={() => handleBulkAction("hide")}
                      className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => setBulkDeleteConfirm(true)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-rose/20 text-rose hover:bg-rose/30 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFilesSelected}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImages || images.length >= 30}
                  className="px-4 py-2.5 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImages ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Upload Photos ({images.length}/30)</span>
                </button>
              </div>
            </div>

            {/* Per-File Progress Bars */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0B132B] border border-gold/30 space-y-3">
                <div className="text-xs font-mono text-gold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing and optimizing images</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-sand/70">
                        <span className="truncate max-w-xs">{fileName}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item, index) => {
                  const isSelected = selectedImageIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-[#0B132B] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                        isSelected
                          ? "border-gold ring-1 ring-gold/50 shadow-md"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Image Preview Box */}
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        <Image
                          src={item.url}
                          alt={item.alt || "Club reel photo"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          className={`object-cover transition-opacity ${
                            item.active ? "opacity-100" : "opacity-40"
                          }`}
                          style={{
                            objectPosition: `${item.focalPoint?.x ?? 50}% ${item.focalPoint?.y ?? 50}%`,
                          }}
                        />

                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedImageIds((prev) => [...prev, item.id]);
                              } else {
                                setSelectedImageIds((prev) =>
                                  prev.filter((id) => id !== item.id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded-sm border-white/30 bg-[#0B132B]/80 text-gold focus:ring-gold cursor-pointer"
                          />
                        </div>

                        {/* Order & Status Badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#070B18]/80 text-sand border border-white/10">
                            No. {index + 1}
                          </span>
                          {!item.active && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/80 text-[#070B18] font-bold">
                              Hidden
                            </span>
                          )}
                        </div>

                        {/* Focal Point Indicator Pin */}
                        <div
                          className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold/90 shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            left: `${item.focalPoint?.x ?? 50}%`,
                            top: `${item.focalPoint?.y ?? 50}%`,
                          }}
                          title={`Focal point: ${item.focalPoint?.x ?? 50}%, ${item.focalPoint?.y ?? 50}%`}
                        />
                      </div>

                      {/* Details / Text */}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-sand line-clamp-1">
                            {item.alt || <span className="text-rose">Missing Alt Text</span>}
                          </p>
                          {item.caption ? (
                            <p className="text-[11px] text-sand/50 line-clamp-1 mt-0.5">
                              {item.caption}
                            </p>
                          ) : (
                            <p className="text-[11px] text-sand/30 italic mt-0.5">
                              No caption added
                            </p>
                          )}
                        </div>

                        {/* Card Controls */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                          {/* Order Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImageOrder(index, "up")}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                              title="Move photo earlier in sequence"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImageOrder(index, "down")}
                              disabled={index === images.length - 1}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                              title="Move photo later in sequence"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Edit & Delete Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingImage(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/70 hover:text-gold transition-colors"
                              title="Edit photo properties"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmImageId(item.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/50 hover:text-rose transition-colors"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-[#0B132B] rounded-2xl border border-white/10 p-8 space-y-3">
                <ImageIcon className="w-12 h-12 text-sand/30 mx-auto" />
                <h3 className="text-sm font-bold text-sand font-heading">
                  No images uploaded for this club reel
                </h3>
                <p className="text-xs text-sand/60 max-w-md mx-auto leading-relaxed">
                  The reel section on the public club page will remain hidden until active images are uploaded here.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gold text-[#070B18] font-semibold text-xs hover:bg-gold/90 transition-colors"
                >
                  Upload First Images
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MEMBERS ROSTER */}
        {/* ================================================================= */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* Members Toolbar */}
            <div className="bg-[#0B132B] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-sand font-heading">
                  Student Leadership and Coordinators
                </h2>
                <p className="text-xs text-sand/60">
                  Staff advisors and office bearers display first on the public page, followed by members grouped by batch.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand/90 border border-white/10 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald" />
                  <span>Bulk Add by CSV</span>
                </button>

                <button
                  type="button"
                  onClick={openAddMemberModal}
                  className="px-4 py-2.5 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            {/* Members Table */}
            {members.length > 0 ? (
              <div className="bg-[#0B132B] rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-sand">
                    <thead className="bg-[#070B18] text-sand/50 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">Order</th>
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Designation Role</th>
                        <th className="py-3 px-4">Academic Batch</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {members.map((member, index) => (
                        <tr
                          key={member.id}
                          className={`hover:bg-white/5 transition-colors ${
                            !member.active ? "opacity-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-mono text-sand/50">
                            {index + 1}
                          </td>

                          {/* Member Name and Photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl bg-[#070B18] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                {member.photo ? (
                                  <Image
                                    src={member.photo}
                                    alt={member.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <Users className="w-4 h-4 text-sand/40" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-sand block">
                                  {member.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-sand/90 font-mono text-[11px]">
                              {member.role}
                            </span>
                          </td>

                          {/* Batch */}
                          <td className="py-3 px-4 text-sand/70 font-mono text-[11px]">
                            {member.batch || "Not specified"}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                member.active
                                  ? "bg-emerald/15 text-emerald border-emerald/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {member.active ? "Active" : "Hidden"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Reorder */}
                              <button
                                type="button"
                                onClick={() => handleMoveMemberOrder(index, "up")}
                                disabled={index === 0}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                                title="Move up in roster"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveMemberOrder(index, "down")}
                                disabled={index === members.length - 1}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand disabled:opacity-30 transition-colors"
                                title="Move down in roster"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Move to another club */}
                              {otherClubs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMoveMemberModal({
                                      memberId: member.id,
                                      memberName: member.name,
                                      targetClubSlug: otherClubs[0]?.slug || "",
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-sand transition-colors"
                                  title="Transfer member to another club"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5 text-royal-blue" />
                                </button>
                              )}

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openEditMemberModal(member)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/60 hover:text-gold transition-colors"
                                title="Edit member profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmMemberId(member.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/50 hover:text-rose transition-colors"
                                title="Remove member"
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
              </div>
            ) : (
              <div className="py-20 text-center bg-[#0B132B] rounded-2xl border border-white/10 p-8 space-y-3">
                <Users className="w-12 h-12 text-sand/30 mx-auto" />
                <h3 className="text-sm font-bold text-sand font-heading">
                  No members added to this club roster
                </h3>
                <p className="text-xs text-sand/60 max-w-md mx-auto leading-relaxed">
                  The members section on the public club page will remain hidden until coordinators are added here.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={openAddMemberModal}
                    className="px-4 py-2 rounded-xl bg-gold text-[#070B18] font-semibold text-xs hover:bg-gold/90 transition-colors"
                  >
                    Add Coordinator
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCsvModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sand font-semibold text-xs hover:bg-white/10 transition-colors"
                  >
                    Import CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: OFFICIAL EMBLEM & OVERVIEW */}
        {/* ================================================================= */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Logo Upload Card (6 cols) */}
            <div className="md:col-span-6 bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-sand font-heading">
                  Official Club Emblem
                </h2>
                <p className="text-xs text-sand/60">
                  Genuine PNG format with transparent background. At least 400 pixels on long side, up to 2 MB.
                </p>
              </div>

              {/* Current / Preview Emblem */}
              <div className="p-6 rounded-2xl bg-[#070B18] border border-white/10 flex flex-col items-center justify-center gap-4">
                <div className="relative w-40 h-40 rounded-2xl bg-midnight/90 border border-gold/30 p-4 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="New emblem preview"
                      fill
                      unoptimized
                      sizes="160px"
                      className="object-contain"
                    />
                  ) : club.logoUrl ? (
                    <Image
                      src={club.logoUrl}
                      alt={`${club.name} emblem`}
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-sand/40 font-mono text-center">
                      No emblem currently uploaded
                    </span>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <span className="text-xs font-mono text-sand/70 block">
                    {club.name} Official Emblem
                  </span>
                  <span className="text-[10px] text-emerald font-mono block">
                    Synchronized with Club Logo Reel
                  </span>
                </div>
              </div>

              {logoWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{logoWarning}</span>
                </div>
              )}

              {/* Upload Controls */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sand border border-white/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select PNG File</span>
                  </button>

                  {logoFile && (
                    <button
                      type="button"
                      onClick={handleUploadLogo}
                      disabled={logoUploading}
                      className="px-5 py-2.5 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {logoUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Save Emblem</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-sand/50 text-center">
                  Transparent margins are trimmed automatically. Never upscaled.
                </p>
              </div>
            </div>

            {/* Club Information Overview Card (6 cols) */}
            <div className="md:col-span-6 bg-[#0B132B] rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-sand font-heading">
                  Club Narrative & Mission
                </h2>
                <p className="text-xs text-sand/60">
                  Core descriptive content displayed on public chapter page.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-sand/40 uppercase text-[10px] block mb-1">
                    Short Description
                  </span>
                  <div className="p-3 rounded-xl bg-[#070B18] border border-white/10 text-sand/80 leading-relaxed">
                    {club.shortDescription}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-sand/40 uppercase text-[10px] block mb-1">
                    About the Organization
                  </span>
                  <div className="p-3 rounded-xl bg-[#070B18] border border-white/10 text-sand/80 leading-relaxed max-h-36 overflow-y-auto">
                    {club.about}
                  </div>
                </div>

                {club.vision && (
                  <div>
                    <span className="font-mono text-sand/40 uppercase text-[10px] block mb-1">
                      Strategic Vision
                    </span>
                    <div className="p-3 rounded-xl bg-[#070B18] border border-white/10 text-sand/80 leading-relaxed">
                      {club.vision}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: EDIT IMAGE DETAILS & FOCAL POINT PICKER */}
      {/* ===================================================================== */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
                <Target className="w-4 h-4 text-gold" />
                <span>Edit Photo Properties & Focal Point</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="p-1 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateImageDetails} className="space-y-4">
              {/* Interactive Focal Point Picker Canvas */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-sand/80">
                  Crop Centre Focal Point (Click directly on the photo to set focal pin)
                </label>
                <div
                  onClick={handleFocalPointClick}
                  className="relative aspect-video w-full rounded-xl overflow-hidden bg-black cursor-crosshair border border-white/20 select-none group"
                >
                  <Image
                    src={editingImage.url}
                    alt={editingImage.alt || "Edit photo"}
                    fill
                    sizes="600px"
                    className="object-contain pointer-events-none"
                  />
                  {/* Pin overlay */}
                  <div
                    className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold flex items-center justify-center shadow-lg transition-all"
                    style={{
                      left: `${editingImage.focalPoint?.x ?? 50}%`,
                      top: `${editingImage.focalPoint?.y ?? 50}%`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#070B18]" />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-sand/50">
                  <span>Horizontal: {editingImage.focalPoint?.x ?? 50}%</span>
                  <span>Vertical: {editingImage.focalPoint?.y ?? 50}%</span>
                </div>
              </div>

              {/* Alt Text (Required) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Alternative Text (Required for accessibility and screen readers)
                </label>
                <input
                  type="text"
                  required
                  value={editingImage.alt}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, alt: e.target.value })
                  }
                  placeholder="Short description of the picture"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* Caption (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Display Caption (Optional hover overlay on reel)
                </label>
                <input
                  type="text"
                  value={editingImage.caption || ""}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, caption: e.target.value })
                  }
                  placeholder="Appears on hover and focus in the reel"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* Replace Image File */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-sand/80">
                  Replace Image File
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImageFile(editingImage.id, file);
                  }}
                  className="w-full text-xs text-sand/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-white/15 file:text-xs file:font-semibold file:bg-white/5 file:text-sand hover:file:bg-white/10 cursor-pointer"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="image-active-toggle"
                  checked={editingImage.active}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, active: e.target.checked })
                  }
                  className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                />
                <label
                  htmlFor="image-active-toggle"
                  className="text-xs font-semibold text-sand cursor-pointer select-none"
                >
                  Active in public image reel
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT MEMBER */}
      {/* ===================================================================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-sand font-heading">
                {memberFormData.id ? "Edit Member Profile" : "Add Club Member"}
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Full Name (Required)
                </label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, name: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-sand">
                    Role in Club
                  </label>
                  <select
                    value={memberFormData.role}
                    onChange={(e) =>
                      setMemberFormData({ ...memberFormData, role: e.target.value })
                    }
                    className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-sand focus:border-gold focus:outline-hidden cursor-pointer"
                  >
                    {PREDEFINED_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {memberFormData.role === "Custom Role" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-sand">
                      Custom Role Title
                    </label>
                    <input
                      type="text"
                      value={memberFormData.customRole}
                      onChange={(e) =>
                        setMemberFormData({
                          ...memberFormData,
                          customRole: e.target.value,
                        })
                      }
                      placeholder="e.g. Lead Designer"
                      className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Batch / Academic Year */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-sand">
                  Batch or Academic Year
                </label>
                <input
                  type="text"
                  value={memberFormData.batch}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, batch: e.target.value })
                  }
                  placeholder="e.g. 2023 to 2027 or Final Year"
                  className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-sand focus:border-gold focus:outline-hidden"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-sand">
                  Member Photo (Square crop, up to 3 MB)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-[#070B18] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {memberPhotoPreview ? (
                      <Image
                        src={memberPhotoPreview}
                        alt="Photo preview"
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-sand/30" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={memberPhotoInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMemberPhotoFile(file);
                        setMemberPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-sand/70 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-white/15 file:text-xs file:bg-white/5 file:text-sand"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="member-active-toggle"
                  checked={memberFormData.active}
                  onChange={(e) =>
                    setMemberFormData({
                      ...memberFormData,
                      active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded-sm border-white/30 bg-[#070B18] text-gold focus:ring-gold cursor-pointer"
                />
                <label
                  htmlFor="member-active-toggle"
                  className="text-xs font-semibold text-sand cursor-pointer select-none"
                >
                  Active and visible on public club page
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {!memberFormData.id && (
                    <button
                      type="button"
                      onClick={() => handleSaveMember(true)}
                      disabled={memberSaving}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sand text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Add Another
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveMember(false)}
                    disabled={memberSaving}
                    className="px-5 py-2 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {memberSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{memberFormData.id ? "Update Member" : "Save Member"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: BULK CSV IMPORT */}
      {/* ===================================================================== */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-sand font-heading flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald" />
                <span>Bulk Import Members by CSV</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <p className="text-xs text-sand/70">
                Upload a CSV file or paste tabular data with columns:{" "}
                <code className="text-gold font-mono">name, role, batch, photo</code>.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={csvFileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => csvFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sand border border-white/10 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose CSV File</span>
                </button>
                <span className="text-[11px] text-sand/40">or paste text directly below</span>
              </div>

              <textarea
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  parseCsvText(e.target.value);
                }}
                rows={5}
                placeholder={"name,role,batch\nAnanya Sharma,President,2023 to 2027\nKarthik Raj,Secretary,2024 to 2028"}
                className="w-full bg-[#070B18] border border-white/15 rounded-xl p-3 text-xs font-mono text-sand focus:border-gold focus:outline-hidden"
              />

              {/* Errors List */}
              {csvErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose/10 border border-rose/30 space-y-1 text-xs text-rose">
                  <span className="font-bold block">Validation Errors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {csvErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {csvParsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sand">
                      Preview ({csvParsedRows.length} members found)
                    </span>
                    {csvParsedRows.some((r) => r.isDuplicate) && (
                      <span className="text-[11px] text-amber-300 font-mono">
                        Contains potential duplicate names
                      </span>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-[11px] text-sand">
                      <thead className="bg-[#070B18] text-sand/40 font-mono uppercase">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Batch</th>
                          <th className="p-2 text-right">Duplicate Warning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {csvParsedRows.map((row, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="p-2 font-semibold">{row.name}</td>
                            <td className="p-2 font-mono">{row.role}</td>
                            <td className="p-2 font-mono text-sand/60">
                              {row.batch || "Not provided"}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {row.isDuplicate ? (
                                <span className="text-amber-400">Existing Record</span>
                              ) : (
                                <span className="text-emerald">New</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCsvBatch}
                disabled={
                  csvImporting || csvParsedRows.length === 0 || csvErrors.length > 0
                }
                className="px-5 py-2 rounded-xl bg-gold text-[#070B18] hover:bg-gold/90 text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
              >
                {csvImporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Import Roster</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: TRANSFER MEMBER TO ANOTHER CLUB */}
      {/* ===================================================================== */}
      {moveMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Transfer Member to Another Club
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Move coordinator <strong className="text-sand">{moveMemberModal.memberName}</strong> from {club.name} into another chapter roster.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-sand">
                Select Destination Club
              </label>
              <select
                value={moveMemberModal.targetClubSlug}
                onChange={(e) =>
                  setMoveMemberModal({
                    ...moveMemberModal,
                    targetClubSlug: e.target.value,
                  })
                }
                className="w-full bg-[#070B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-sand focus:border-gold focus:outline-hidden cursor-pointer"
              >
                {otherClubs.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMoveMemberModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveToAnotherClub}
                className="px-4 py-2 rounded-xl bg-royal-blue text-white hover:bg-royal-blue/90 text-xs font-semibold"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRM SINGLE IMAGE DELETE */}
      {/* ===================================================================== */}
      {deleteConfirmImageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Confirm Photo Removal
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Are you sure you want to permanently delete this photo? The image file will be erased immediately from cloud storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmImageId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteImage(deleteConfirmImageId)}
                className="px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/90 text-xs font-semibold"
              >
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRM BULK IMAGE DELETE */}
      {/* ===================================================================== */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Confirm Bulk Photo Removal
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Permanently delete {selectedImageIds.length} selected photos? All associated files will be removed from cloud storage immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction("delete")}
                className="px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/90 text-xs font-semibold"
              >
                Delete All Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRM MEMBER DELETE */}
      {/* ===================================================================== */}
      {deleteConfirmMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-sand font-heading">
              Confirm Member Removal
            </h3>
            <p className="text-xs text-sand/70 leading-relaxed">
              Remove this member from the club roster? Their uploaded portrait photo will also be cleaned from storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMemberId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-sand/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMember(deleteConfirmMemberId)}
                className="px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/90 text-xs font-semibold"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
