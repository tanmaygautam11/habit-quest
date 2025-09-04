"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Mission {
  id: string;
  title: string;
  completed: boolean;
  collected: boolean;
  reward: { xp: number; gems: number };
  type?: string;
  streak?: number;
  streakGoal?: number;
}

export default function QuestsPage() {
  const [daily, setDaily] = useState<Mission[]>([]);
  const [weekly, setWeekly] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collecting, setCollecting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quests")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setDaily(data.daily || []);
        setWeekly(data.weekly || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCollect = async (id: string, type: string) => {
    setCollecting(id);
    const res = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId: id }),
    });
    if (res.ok) {
      if (type === "streak") {
        setWeekly((prev) => prev.map(m => m.id === id ? { ...m, collected: true } : m));
      } else {
        setDaily((prev) => prev.map(m => m.id === id ? { ...m, collected: true } : m));
      }
    }
    setCollecting(null);
  };

  if (loading) return <div className="text-center text-slate-400 mt-10">Loading missions...</div>;
  if (error) return <div className="text-center text-rose-600 mt-10">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Daily Missions</h2>
      <div className="flex flex-col gap-4 mb-8">
        {daily.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-indigo-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-indigo-800 text-lg">{m.title}</span>
              <span className="text-xs text-slate-400">Reward: <span className="text-emerald-600 font-semibold">+{m.reward.xp} XP</span> <span className="text-indigo-500 font-semibold">+{m.reward.gems} Gems</span></span>
            </div>
            <div className="flex gap-2 items-center">
              {m.collected ? (
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">Collected!</span>
              ) : m.completed ? (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4" onClick={() => handleCollect(m.id, m.type || "daily")} disabled={collecting === m.id}>
                  {collecting === m.id ? "Collecting..." : "Collect"}
                </Button>
              ) : (
                <span className="text-slate-400">Incomplete</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Weekly Goals</h2>
      <div className="flex flex-col gap-4">
        {weekly.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-indigo-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-indigo-800 text-lg">{m.title}</span>
              <span className="text-xs text-slate-400">Reward: <span className="text-emerald-600 font-semibold">+{m.reward.xp} XP</span> <span className="text-indigo-500 font-semibold">+{m.reward.gems} Gems</span></span>
              {typeof m.streak === "number" && typeof m.streakGoal === "number" && (
                <span className="inline-block bg-indigo-50 text-indigo-700 font-semibold rounded-full px-3 py-1 mt-1 text-xs border border-indigo-200">Streak: Day {Math.min(m.streak + 1, m.streakGoal)} / {m.streakGoal}</span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {m.collected ? (
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">Collected!</span>
              ) : m.completed ? (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4" onClick={() => handleCollect(m.id, m.type || "streak")} disabled={collecting === m.id}>
                  {collecting === m.id ? "Collecting..." : "Collect"}
                </Button>
              ) : (
                <span className="text-slate-400">Incomplete</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
