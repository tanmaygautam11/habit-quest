
import Sidebar from "@/components/dashboard/sidebar";
import GemsDisplay from "@/components/gems-display";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Quest",
  description: "Gamify your habits and achieve your goals!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-100">
          <Sidebar />
          <div className="flex-1 relative">
            <div className="absolute right-8 top-6 z-20">
              <GemsDisplay />
            </div>
            <main className="p-6 md:p-10 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
