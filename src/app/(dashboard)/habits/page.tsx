"use client";
import React, { useState } from "react";
import HabitsList from "@/components/dashboard/HabitsList";
import AddHabit from "@/components/dashboard/AddHabit";
import { FaPlus } from "react-icons/fa";

export default function HabitsPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">Your Habits</h2>
        <button
          aria-label="Add Habit"
          className="ml-2 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          onClick={() => setAddOpen(true)}
        >
          <FaPlus />
        </button>
      </div>
      <AddHabit open={addOpen} onClose={() => setAddOpen(false)} onHabitAdded={() => window.dispatchEvent(new Event("habit-added"))} />
      <HabitsList />
    </div>
  );
}
