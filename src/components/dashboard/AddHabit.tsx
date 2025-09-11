"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm relative animate-fade-in-up border border-slate-200">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">Add Habit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Quick Add</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {presetHabits.map((h) => (
                <button
                  type="button"
                  key={h.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${title === h.label ? "bg-indigo-100 border-indigo-400 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                  onClick={() => setTitle(h.label)}
                >
                  <span className="text-xl mb-1">{h.icon}</span>
                  {h.label}
                </button>
              ))}
            </div>
            <label className="block text-slate-600 font-medium mb-1 mt-2">Or Custom</label>
            <input
              className="w-full border border-slate-200 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              placeholder="e.g. Drink Water"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Repeat</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-slate-500">
                <input
                  type="radio"
                  checked={repeatType === "daysOfWeek"}
                  onChange={() => setRepeatType("daysOfWeek")}
                />
                Specific days
              </label>
              <label className="flex items-center gap-2 text-slate-500">
                <input
                  type="radio"
                  checked={repeatType === "countPerWeek"}
                  onChange={() => setRepeatType("countPerWeek")}
                />
                Any X days/week
              </label>
            </div>
            {repeatType === "daysOfWeek" ? (
              <div className="flex gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-8 h-8 rounded-full border text-base font-semibold transition-colors ${daysOfWeek.includes(i) ? "bg-indigo-500 text-white border-indigo-500" : "bg-slate-50 text-slate-500 border-slate-200"}`}
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
                  className="w-14 border border-slate-200 rounded px-2 py-1 text-base"
                />
                <span className="text-slate-500">days per week</span>
              </div>
            )}
          </div>
          {error && <div className="bg-rose-50 text-rose-600 p-2 rounded text-sm">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base py-2 font-semibold rounded-lg shadow-none transition-colors"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Habit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
