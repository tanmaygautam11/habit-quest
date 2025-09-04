"use client";
import React from "react";

export default function CharacterPage() {
  // Placeholder for character UI
  return (
    <div className="max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Your Character</h2>
      <div className="bg-white rounded-xl shadow p-6 border border-indigo-100 flex flex-col gap-4 items-center">
        {/* Character avatar, stats, XP bar, gems/coins, upgrade options */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-300 to-emerald-200 flex items-center justify-center text-4xl font-bold text-white mb-2">
          🧙
        </div>
        <div className="text-lg font-semibold text-slate-700">Level 1</div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: "30%" }} />
        </div>
        <div className="flex gap-6 text-slate-600">
          <div>XP: 30/100</div>
          <div>Gems: 10</div>
        </div>
        <button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition">Upgrade</button>
      </div>
    </div>
  );
}
