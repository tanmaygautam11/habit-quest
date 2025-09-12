"use client";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import GemsDisplay from "@/components/dashboard/GemsDisplay";

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session) return <div>Please log in to access this page.</div>;
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-100">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="absolute right-8 top-6 z-20">
          <GemsDisplay />
        </div>
        <main className="ml-64 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
