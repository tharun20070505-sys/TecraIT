"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Trash2,
  Clock,
  Phone,
  User,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  MailCheck,
  Archive,
  CornerUpLeft,
  Calendar,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read" | "archived">("all");

  // Selection & Modal
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
      setFeedback({ type: "error", text: "Failed to load inquiries." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const res = await fetch("/api/admin/messages");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMessages(data.messages || []);
          }
        }
      } catch (err) {
        console.error("Failed to load messages", err);
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

  const handleToggleRead = async (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(true);

    try {
      const newReadStatus = !msg.isRead;
      const res = await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newReadStatus }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: newReadStatus } : m))
        );
        if (selectedMessage?._id === msg._id) {
          setSelectedMessage((prev) => (prev ? { ...prev, isRead: newReadStatus } : null));
        }
        setFeedback({
          type: "success",
          text: newReadStatus ? "Marked as read." : "Marked as unread.",
        });
      }
    } catch (err) {
      console.error("Error updating read status", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleArchive = async (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(true);

    try {
      const newArchivedStatus = !msg.isArchived;
      const res = await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: newArchivedStatus }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, isArchived: newArchivedStatus } : m
          )
        );
        if (selectedMessage?._id === msg._id) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, isArchived: newArchivedStatus } : null
          );
        }
        setFeedback({
          type: "success",
          text: newArchivedStatus ? "Inquiry archived." : "Restored from archive.",
        });
      }
    } catch (err) {
      console.error("Error updating archive status", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
        setDeleteConfirmId(null);
        setFeedback({ type: "success", text: "Inquiry permanently deleted." });
      }
    } catch (err) {
      console.error("Error deleting inquiry", err);
      setFeedback({ type: "error", text: "Failed to delete inquiry." });
    } finally {
      setActionLoading(false);
    }
  };

  const openMessageModal = (msg: MessageItem) => {
    setSelectedMessage(msg);
    // If opening an unread message, automatically mark as read
    if (!msg.isRead) {
      handleToggleRead(msg);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    const isArchived = !!m.isArchived;

    if (filterTab === "unread") return matchesSearch && !m.isRead && !isArchived;
    if (filterTab === "read") return matchesSearch && m.isRead && !isArchived;
    if (filterTab === "archived") return matchesSearch && isArchived;
    return matchesSearch && !isArchived; // default "all" shows active
  });

  const unreadCount = messages.filter((m) => !m.isRead && !m.isArchived).length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => {}}
        title="Inquiries & Messages Inbox"
        subtitle="Manage correspondence from prospective students, academics, and industry partners"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Flash Notifications */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              feedback.type === "success"
                ? "bg-emerald/10 border-emerald/30 text-emerald"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-sand/50 hover:text-sand"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Control Bar: Search & Status Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B132B]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === "all"
                  ? "bg-gold text-midnight shadow-md shadow-gold/20"
                  : "bg-white/5 text-sand/70 hover:text-sand hover:bg-white/10"
              }`}
            >
              All Inquiries
            </button>
            <button
              onClick={() => setFilterTab("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterTab === "unread"
                  ? "bg-gold text-midnight shadow-md shadow-gold/20"
                  : "bg-white/5 text-sand/70 hover:text-sand hover:bg-white/10"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab("read")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === "read"
                  ? "bg-gold text-midnight shadow-md shadow-gold/20"
                  : "bg-white/5 text-sand/70 hover:text-sand hover:bg-white/10"
              }`}
            >
              Read
            </button>
            <button
              onClick={() => setFilterTab("archived")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === "archived"
                  ? "bg-gold text-midnight shadow-md shadow-gold/20"
                  : "bg-white/5 text-sand/70 hover:text-sand hover:bg-white/10"
              }`}
            >
              Archived
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sand/40" />
              <input
                type="text"
                placeholder="Search by sender, email, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-black/30 border border-white/15 rounded-xl text-xs text-sand placeholder:text-sand/40 outline-none focus:border-gold/60"
              />
            </div>
            <button
              onClick={loadMessages}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sand/70 hover:text-sand transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="rounded-2xl bg-[#0B132B]/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-sand/60">
            <div>
              Showing <span className="text-sand font-bold">{filteredMessages.length}</span> messages
            </div>
            <div className="text-[11px] font-mono text-sand/40">
              Directly connected to `/api/contact`
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-sand/50 text-xs">
              <Loader2 className="w-6 h-6 text-gold" />
              <span>Loading inquiries...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-20 text-center text-xs text-sand/50">
              No messages found in this view.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-sand/40 font-mono uppercase text-[10px] bg-white/[0.02]">
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Sender</th>
                    <th className="py-3.5 px-4">Subject & Snippet</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMessages.map((msg) => (
                    <tr
                      key={msg._id}
                      onClick={() => openMessageModal(msg)}
                      className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                        !msg.isRead ? "bg-white/[0.02] font-medium" : ""
                      }`}
                    >
                      {/* Read / Unread Status Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {!msg.isRead ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose/20 text-rose border border-rose/30 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                            NEW
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-sand/50 text-[10px] font-mono">
                            Read
                          </span>
                        )}
                      </td>

                      {/* Sender Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sand flex items-center gap-1.5">
                          <span>{msg.name}</span>
                        </div>
                        <div className="text-[11px] text-sand/50 font-mono mt-0.5">
                          {msg.email}
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-sand text-xs font-semibold truncate">
                          {msg.subject}
                        </div>
                        <div className="text-sand/60 text-[11px] truncate mt-0.5">
                          {msg.message}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-gold text-[10px] font-mono border border-gold/20">
                          {msg.category || "General"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-sand/50 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sand/40" />
                          <span>
                            {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 text-sand/70 hover:text-gold border border-white/10 hover:border-gold/30 transition-colors"
                            title="Reply via Email"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={(e) => handleToggleArchive(msg, e)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sand/70 hover:text-sand border border-white/10 transition-colors"
                            title={msg.isArchived ? "Unarchive" : "Archive"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(msg._id);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose/20 text-sand/70 hover:text-rose border border-white/10 hover:border-rose/30 transition-colors"
                            title="Delete inquiry"
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0B132B] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-md bg-gold/20 text-gold text-[10px] font-mono border border-gold/30">
                  {selectedMessage.category || "General Inquiry"}
                </span>
                <h3 className="text-base font-heading font-bold text-sand mt-1">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-sand/50 hover:text-sand hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-sand/50 text-[10px] font-mono uppercase">Sender Name</div>
                <div className="font-semibold text-sand flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{selectedMessage.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sand/50 text-[10px] font-mono uppercase">Email Contact</div>
                <div className="font-mono text-sand/90 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="hover:underline text-cyan"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              {selectedMessage.phone && (
                <div className="space-y-1">
                  <div className="text-sand/50 text-[10px] font-mono uppercase">Phone Number</div>
                  <div className="font-mono text-sand/80 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sand/50 text-[10px] font-mono uppercase">Received Stamp</div>
                <div className="font-mono text-sand/70 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>
                    {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-sand/60 uppercase font-mono tracking-wider">
                Inquiry Message Content
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-sand/90 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRead(selectedMessage)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-sand/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MailCheck className="w-3.5 h-3.5 text-gold" />
                  <span>{selectedMessage.isRead ? "Mark as Unread" : "Mark as Read"}</span>
                </button>

                <button
                  onClick={() => handleToggleArchive(selectedMessage)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-sand/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-sand/60" />
                  <span>{selectedMessage.isArchived ? "Unarchive" : "Archive"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirmId(selectedMessage._id);
                    setSelectedMessage(null);
                  }}
                  className="p-2 rounded-xl text-rose hover:bg-rose/10 border border-rose/30 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}&body=%0A%0A--- Original Inquiry from ${encodeURIComponent(
                    selectedMessage.name
                  )} ---%0A${encodeURIComponent(selectedMessage.message)}`}
                  className="px-4 py-2 bg-gradient-to-r from-gold to-[#e6b866] hover:from-[#e6b866] hover:to-gold text-midnight font-bold text-xs rounded-xl shadow-md shadow-gold/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>Send Direct Email Reply</span>
                </a>
              </div>
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
                Confirm Inquiry Deletion
              </h3>
            </div>
            <p className="text-xs text-sand/70 leading-relaxed">
              Are you sure you want to permanently delete this contact inquiry? This cannot be undone.
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
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose hover:bg-rose/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5" /> : null}
                <span>Delete Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
