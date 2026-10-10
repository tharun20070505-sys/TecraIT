import type { Metadata } from "next";
import { AdminRouteFade } from "@/components/admin/AdminRouteFade";

export const metadata: Metadata = {
  title: "Admin Portal | TECRA IT SRIET",
  description: "Administrative control center for TECRA Department of Information Technology, SRIET.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070B18] text-sand antialiased">
      <AdminRouteFade>{children}</AdminRouteFade>
    </div>
  );
}
