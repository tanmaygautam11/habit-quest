"use client"
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddHabit from "@/components/dashboard/AddHabit";
import { FaChartBar, FaList, FaUser } from "react-icons/fa";

const navItems = [
  { href: "/dashboard", label: "Habits", icon: <FaList /> },
  { href: "/quests", label: "Quests", icon: <FaChartBar /> },
  { href: "/character", label: "Character", icon: <FaUser /> },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <FaChartBar /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  // Custom event to notify habits list to refresh
  const handleHabitAdded = () => {
    window.dispatchEvent(new Event("habit-added"));
  };

  return (
    <>
      <aside className="w-64 bg-white/90 border-r border-indigo-200 shadow-lg flex flex-col min-h-screen p-6">
        {/* Top section for app title (and later user info/logout) */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight">HabitQuest</h1>
          <p className="text-xs text-slate-400 mt-1">Gamify your habits</p>
        </div>
        {/* Navigation links */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-base transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${pathname === item.href ? "bg-indigo-200 text-indigo-900" : "text-slate-700"}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Logout button at the bottom (for future use) */}
        <div className="mt-auto pt-8">
          {/* Placeholder for logout/user info */}
        </div>
      </aside>
      <AddHabit open={modalOpen} onClose={() => setModalOpen(false)} onHabitAdded={handleHabitAdded} />
    </>
  );
}