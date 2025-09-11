"use client";
import React, { useState } from "react";

interface AddHabitProps {
  open: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

const presetHabits = [
  { label: "Drink Water", icon: "💧" },
  { label: "Workout", icon: "🏋️" },
  { label: "Read", icon: "📚" },
  { label: "Meditate", icon: "🧘" },
  { label: "Sleep Early", icon: "🛏️" },
  { label: "Walk", icon: "🚶" },
  { label: "No Sugar", icon: "🍎" },
  { label: "Journaling", icon: "📓" },
  { label: "Study", icon: "📝" },
  { label: "Clean Room", icon: "🧹" },
  { label: "Practice Skill", icon: "🎸" },
  { label: "Plan Day", icon: "🗓️" },
];

export default function AddHabit({ open, onClose, onHabitAdded }: AddHabitProps) {
  const [title, setTitle] = useState("");
  const [repeatType, setRepeatType] = useState<"daysOfWeek" | "countPerWeek">("daysOfWeek");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [countPerWeek, setCountPerWeek] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDayToggle = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const repeat =
      repeatType === "daysOfWeek"
        ? { type: "daysOfWeek", daysOfWeek }
        : { type: "countPerWeek", countPerWeek };
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, repeat }),
    });
    if (res.ok) {
      setTitle("");
      setDaysOfWeek([]);
      setCountPerWeek(3);
      onHabitAdded();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Failed to add habit");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up border border-slate-200">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-600 rounded-full p-2 text-lg">＋</span>
          Add New Habit
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-600 font-semibold mb-2">Quick Add</label>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {presetHabits.map((h) => (
                <button
                  type="button"
                  key={h.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-colors shadow-sm ${title === h.label ? "bg-indigo-100 border-indigo-400 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                  onClick={() => setTitle(h.label)}
                >
                  <span className="text-xl mb-1">{h.icon}</span>
                  {h.label}
                </button>
              ))}
            </div>
            <label className="block text-slate-600 font-semibold mb-2 mt-3">Or Custom</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              placeholder="e.g. Drink Water"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-2">Repeat</label>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input
                  type="radio"
                  checked={repeatType === "daysOfWeek"}
                  onChange={() => setRepeatType("daysOfWeek")}
                />
                Specific days
              </label>
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input
                  type="radio"
                  checked={repeatType === "countPerWeek"}
                  onChange={() => setRepeatType("countPerWeek")}
                />
                Any X days/week
              </label>
            </div>
            {repeatType === "daysOfWeek" ? (
              <div className="flex gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-9 h-9 rounded-full border text-base font-semibold transition-colors ${daysOfWeek.includes(i) ? "bg-indigo-500 text-white border-indigo-500" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                    onClick={() => handleDayToggle(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={countPerWeek}
                  onChange={(e) => setCountPerWeek(Number(e.target.value))}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-base shadow-sm"
                />
                <span className="text-slate-500">days per week</span>
              </div>
            )}
          </div>
          {error && <div className="bg-rose-50 text-rose-600 p-2 rounded text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base py-2 font-semibold rounded-lg shadow transition-colors"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Habit"}
          </button>
        </form>
      </div>
    </div>
  );
}
