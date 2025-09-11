"use client";
import React, { useEffect, useState } from "react";

interface Habit {
  _id: string;
  title: string;
  streak: number;
  repeat: { type: string; daysOfWeek?: number[]; countPerWeek?: number };
  completedDates: (string | Date)[];
}
export default function HabitsList({ collapsed = false }: { collapsed?: boolean }) {
  const [allCollapsed, setAllCollapsed] = useState<boolean>(collapsed);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [monthOffsets, setMonthOffsets] = useState<Record<string, number>>({});

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
    
  const handler = () => fetchHabits();
  window.addEventListener("habit-added", handler);
  return () => window.removeEventListener("habit-added", handler);
  }, []);


  // Helper to get local date string (YYYY-MM-DD)
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isCompletedToday = (habit: Habit) => {
    const today = getLocalDateString(new Date());
    return habit.completedDates.some((d) => {
      const dateStr = typeof d === "string" ? d.slice(0, 10) : getLocalDateString(d);
      return dateStr === today;
    });
  };

  // Toggle check-in for today
  const handleToggleComplete = async (habit: Habit) => {
    setMarking(habit._id);
    const today = getLocalDateString(new Date());
    const completedToday = habit.completedDates.some((d) => {
      const dateStr = typeof d === "string" ? d.slice(0, 10) : getLocalDateString(d);
      return dateStr === today;
    });
    let updatedDates;
    let method, body;
    if (completedToday) {
      // Uncheck: remove today's date
      updatedDates = habit.completedDates.filter((d) => {
        const dateStr = typeof d === "string" ? d.slice(0, 10) : getLocalDateString(d);
        return dateStr !== today;
      });
      method = "PATCH";
      body = JSON.stringify({ completedDates: updatedDates });
      await fetch(`/api/habits/${habit._id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      // Check: add today's date (use POST for check-in logic)
      await fetch(`/api/habits/${habit._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });
    }
    // Refetch updated habit from backend to get correct streak and check-ins
    const res = await fetch(`/api/habits`);
    if (res.ok) {
      const data = await res.json();
      setHabits(data);
    }
    setMarking(null);
  };

  // Auto-jump to the month of the most recent completed date for each habit
  useEffect(() => {
    setMonthOffsets((prev) => {
      const updated: Record<string, number> = { ...prev };
      habits.forEach((habit) => {
        if (!habit.completedDates.length) return;
        // Find the most recent completed date
        const mostRecent = habit.completedDates
          .map((d) => typeof d === 'string' ? new Date(d) : d)
          .sort((a, b) => b.getTime() - a.getTime())[0];
        const now = new Date();
        const offset = (now.getFullYear() - mostRecent.getFullYear()) * 12 + (now.getMonth() - mostRecent.getMonth());
        updated[habit._id] = offset;
      });
      return updated;
    });
  }, [habits]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="text-rose-600 bg-rose-50 p-3 rounded mb-4">{error}</div>;
  }
  if (!habits.length) {
    return <div className="text-slate-500">No habits yet. Click &quot;Add Habit&quot; to get started!</div>;
  }

  return (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        // Calculate total streak and check-ins for the habit (all time)
        const completedDatesSorted = habit.completedDates
          .map((d) => typeof d === 'string' ? new Date(d) : d)
          .sort((a, b) => a.getTime() - b.getTime());
        const completed = completedDatesSorted.length;

  const streak = habit.streak;
  // For the calendar grid, show the current month, but mark check-ins for any completedDates in that month
        let offset = monthOffsets[habit._id];
        if (offset === undefined) {
          offset = 0;
        }
  const showMonth = new Date(new Date().getFullYear(), new Date().getMonth() - offset, 1);
        return (
          <div
            key={habit._id}
            className={`bg-gray-100 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2 p-5 hover:shadow-md transition-shadow ${allCollapsed ? 'h-14 overflow-hidden p-2' : ''}`}
            style={{ minHeight: allCollapsed ? 56 : undefined }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{habit.title}</h3>
              <label className="flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompletedToday(habit)}
                  disabled={marking === habit._id}
                  onChange={() => handleToggleComplete(habit)}
                  className="accent-green-500 w-5 h-5 rounded border border-gray-300"
                />
              </label>
            </div>
            {!allCollapsed && (
              <>
                <div className="flex gap-8 justify-between text-center mb-2">
                  <div>
                    <div className="text-2xl font-bold text-gray-700">{streak}</div>
                    <div className="text-xs text-gray-400">Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-700">{completed}</div>
                    <div className="text-xs text-gray-400">Check-ins</div>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setMonthOffsets((prev) => ({ ...prev, [habit._id]: (prev[habit._id] || 0) + 1 }))}
                      aria-label="Previous month"
                    >
                      &#8592;
                    </button>
                    <div className="text-center font-medium flex-1">
                      {(() => {
                        // offset and now are not needed here
                        return showMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
                      })()}
                    </div>
                    <button
                      className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setMonthOffsets((prev) => ({ ...prev, [habit._id]: Math.max((prev[habit._id] || 0) - 1, 0) }))}
                      aria-label="Next month"
                      disabled={!(monthOffsets[habit._id] === 0 || monthOffsets[habit._id] === undefined)}
                    >
                      &#8594;
                    </button>
                  </div>
                  {/* Custom calendar grid */}
                  <div className="w-full flex flex-col items-center">
                    {(() => {
                      const offset = monthOffsets[habit._id] || 0;
                      const now = new Date();
                      const showMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
                      const year = showMonth.getFullYear();
                      const month = showMonth.getMonth();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
                      const completed = new Set(habit.completedDates.map((d) => (typeof d === "string" ? d.slice(0, 10) : getLocalDateString(d))));
                      const repeatDays = habit.repeat.daysOfWeek || [0,1,2,3,4,5,6];
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const weeks = [];
                      let week = [];
                      for (let i = 0; i < firstDay; i++) week.push(null);
                      for (let d = 1; d <= daysInMonth; d++) {
                        const date = new Date(year, month, d);
                        const dateStr = getLocalDateString(date);
                        let status = 'future';
                        if (completed.has(dateStr)) {
                          status = 'checkin';
                        } else if (repeatDays.includes(date.getDay())) {
                          if (dateStr < todayStr) status = 'miss';
                          else status = 'future';
                        } else {
                          status = 'off';
                        }
                        week.push({ d, status, dateStr });
                        if (week.length === 7) { weeks.push(week); week = []; }
                      }
                      if (week.length) while (week.length < 7) week.push(null);
                      if (week.length) weeks.push(week);
                      return (
                        <table className="w-full text-center select-none" style={{ tableLayout: 'fixed', maxWidth: 340 }}>
                          <thead>
                            <tr className="text-xs text-gray-400">
                              <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weeks.map((week, i) => (
                              <tr key={i}>
                                {week.map((cell, j) => cell ? (
                                  <td key={j}>
                                    <div
                                      title={cell.dateStr}
                                      className="mx-auto flex items-center justify-center rounded-md border border-gray-200"
                                      style={{
                                        width: 32, height: 32, fontSize: 14, fontWeight: 500,
                                        background:
                                          cell.status === 'checkin' ? '#22c55e' :
                                          cell.status === 'miss' ? 'var(--destructive, #EF4444)' :
                                          cell.status === 'off' ? '#e5e7eb' : '#f3f4f6',
                                        color: cell.status === 'checkin' || cell.status === 'miss' ? '#fff' : '#64748b',
                                        opacity: cell.status === 'future' ? 0.5 : 1,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {cell.d}
                                    </div>
                                  </td>
                                ) : <td key={j}></td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs justify-center">
                    <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-400 rounded-sm border border-gray-200 inline-block" /> Check-in</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-4" style={{ background: 'var(--destructive)', borderRadius: 3, border: '1px solid #e5e7eb' }} /> Miss</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 rounded-sm border border-gray-200 inline-block" /> Day off</span>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
      <div className="col-span-full flex justify-end mt-4">
        <button
          className="px-4 py-2 rounded bg-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-400 transition"
          onClick={() => setAllCollapsed((c: boolean) => !c)}
        >
          {allCollapsed ? "Expand All" : "Collapse All"}
        </button>
      </div>
    </div>
  );
}


