"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count for sidebar badge
  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const res = await fetch("/api/admin/messages");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (err) {
        console.warn("Could not load unread count", err);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#070B18] text-sand flex flex-col antialiased">
      {/* Fixed Desktop & Drawer Mobile Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}
