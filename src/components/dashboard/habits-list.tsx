"use client";
import React, { useEffect, useState } from "react";


interface Habit {
  _id: string;
  title: string;
  streak: number;
  repeat: { type: string; daysOfWeek?: number[]; countPerWeek?: number };
  completedDates: string[];
}

export default function HabitsList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = () => {
      setLoading(true);
      fetch("/api/habits")
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to fetch habits");
          }
          return res.json();
        })
        .then((data) => {
          setHabits(data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Could not load habits. " + (err.message || ""));
          setLoading(false);
        });
    };
    fetchHabits();
    // Listen for custom event to refresh habits
    const handler = () => fetchHabits();
    window.addEventListener("habit-added", handler);
    return () => window.removeEventListener("habit-added", handler);
  }, []);


  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-rose-600 bg-rose-50 p-3 rounded mb-4">{error}</div>;
  if (!habits.length) return <div className="text-slate-500">No habits yet. Click &quot;Add Habit&quot; to get started!</div>;

  // Helper to check if completed today
  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().slice(0, 10);
    return habit.completedDates.some((d) => d.slice(0, 10) === today);
  };



  const handleMarkComplete = async (habitId: string) => {
    setMarking(habitId);
    await fetch(`/api/habits/${habitId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    // Refresh habits
    setHabits((prev) => prev.map((h) =>
      h._id === habitId
        ? { ...h, completedDates: [...h.completedDates, new Date().toISOString()] }
        : h
    ));
    setMarking(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        const completedToday = isCompletedToday(habit);
        return (
          <div key={habit._id} className="bg-white rounded-xl shadow-sm border border-indigo-100 flex flex-col gap-2 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-indigo-800 truncate">{habit.title}</h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">🔥 {habit.streak}</span>
            </div>
            <div className="flex gap-2 text-xs text-slate-400 mb-2">
              {habit.repeat.type === "daysOfWeek" && habit.repeat.daysOfWeek && habit.repeat.daysOfWeek.length > 0 ? (
                <span>Days: {habit.repeat.daysOfWeek.map(d => ["S","M","T","W","T","F","S"][d]).join(", ")}</span>
              ) : habit.repeat.type === "countPerWeek" ? (
                <span>Any {habit.repeat.countPerWeek} days/week</span>
              ) : null}
            </div>
            <label className="flex items-center gap-2 mt-2 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={completedToday}
                disabled={completedToday || marking === habit._id}
                onChange={() => handleMarkComplete(habit._id)}
                className="accent-emerald-500 w-5 h-5 rounded border border-slate-300"
              />
              <span className={completedToday ? "text-emerald-600 font-medium" : "text-slate-600"}>
                {completedToday ? "Completed today" : marking === habit._id ? "Marking..." : "Mark complete"}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
