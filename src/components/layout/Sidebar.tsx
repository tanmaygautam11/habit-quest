"use client"
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/ui/icons/habitquest.png";
import AddHabit from "@/components/dashboard/AddHabit";
import { FaChartBar, FaList, FaUser } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Habits", icon: <FaList /> },
  { href: "/quests", label: "Quests", icon: <FaChartBar /> },
  { href: "/character", label: "Character", icon: <FaUser /> },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <FaChartBar /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [userCardOpen, setUserCardOpen] = useState(false);
  const { data: session } = useSession();

  // Custom event to notify habits list to refresh
  const handleHabitAdded = () => {
    window.dispatchEvent(new Event("habit-added"));
  };

  return (
    <>
      <aside className="w-64 bg-white/90 border-r border-indigo-200 shadow-lg flex flex-col h-screen p-6 relative">
        {/* Top section for app title (and later user info/logout) */}
        <div className="flex items-center mb-5">
        <Image
          src={Logo}
          alt="HabitQuest Logo"
          width={48}
          height={48}
          className="rounded-md"
        />
        <span
          className="text-2xl font-bold text-slate-700"
          style={{ fontFamily: "Markazi Text, serif" }}
        >
          HabitQuest
        </span>
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
        {/* User info and click card at the bottom */}
        <div className="mt-auto pt-8">
          {session?.user && (
            <div className="relative flex items-center gap-3 cursor-pointer select-none" onClick={() => setUserCardOpen((v) => !v)}>
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full border border-indigo-200 shadow"
              />
              <span className="font-medium text-slate-700 truncate max-w-[120px]">{session.user.name}</span>
              {/* Click card */}
              {userCardOpen && (
                <div className="fixed left-72 bottom-12 z-50 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[240px] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={session.user.image || "/default-avatar.png"}
                      alt={session.user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full border border-indigo-200"
                    />
                    <div>
                      <div className="font-semibold text-indigo-800">{session.user.name}</div>
                      <div className="text-xs text-slate-500">{session.user.email}</div>
                    </div>
                  </div>
                  <button
                    className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg transition-colors"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
      <AddHabit open={modalOpen} onClose={() => setModalOpen(false)} onHabitAdded={handleHabitAdded} />
      {/* Close user card on outside click */}
      {userCardOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserCardOpen(false)} />
      )}
    </>
  );
}