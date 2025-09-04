"use client";
import React, { useEffect, useState } from "react";

export default function GemsDisplay() {
  const [gems, setGems] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/user/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setGems(data.gems))
      .catch(() => setGems(null));
  }, []);
  return (
    <div className="flex items-center gap-2 bg-white/90 border border-indigo-200 rounded-full px-4 py-2 shadow text-indigo-700 font-semibold text-lg">
      <span className="text-indigo-500">💎</span>
      <span>{gems !== null ? gems : "-"}</span>
    </div>
  );
}