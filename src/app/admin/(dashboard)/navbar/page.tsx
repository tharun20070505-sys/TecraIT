"use client";

import { useState } from "react";
import { Navigation } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavbarTitlesPanel } from "@/components/admin/AdminNavbarTitlesPanel";

export default function AdminNavbarPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        title="Navbar Titles"
        subtitle="Manage public navigation labels, order, and dropdown children"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-sand">
              Public Navigation Titles
            </h1>
            <p className="text-xs text-sand/60">
              Add, rename, reorder, or hide navbar items. Core system items can
              be renamed or hidden but not deleted.
            </p>
          </div>
        </div>

        <AdminNavbarTitlesPanel />
      </div>
    </div>
  );
}
