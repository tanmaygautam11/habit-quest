import React from "react";
import HabitsList from "@/components/dashboard/HabitsList";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Your Habits</h2>
      <HabitsList />
    </div>
  );
}
