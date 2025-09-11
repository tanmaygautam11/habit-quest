"use client";
import Logo from "@/components/ui/icons/habitquest.png";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  const { data: session, status } = useSession();
  if (status === "loading" || session) return null;
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 shadow-sm bg-background border-b border-border">
      <div className="flex items-center">
        <Image
          src={Logo}
          alt="HabitQuest Logo"
          width={64}
          height={64}
          className="rounded-md"
        />
        <span
          className="text-2xl font-bold text-slate-700"
          style={{ fontFamily: "Markazi Text, serif" }}
        >
          HabitQuest
        </span>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors">
          <Link href="/auth/signin">Log in</Link>
        </Button>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors">
          <Link href="/auth/signup">Sign up</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Header;
