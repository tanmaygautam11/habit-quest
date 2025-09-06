// Calculate streak: number of consecutive scheduled days (from repeatDays) up to and including today, where user checked in, stopping at first missed scheduled day
export function calculateStreak(completedDates: (string | Date)[], repeatDays: number[], todayDate?: Date): number {
  if (!repeatDays || repeatDays.length === 0) repeatDays = [0,1,2,3,4,5,6];
  // Build a set of completed date strings (YYYY-MM-DD)
  const completedSet = new Set(
    completedDates.map((d) => {
      const date = typeof d === 'string' ? new Date(d) : d;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  );
  let streak = 0;
  const dateObj = todayDate ? new Date(todayDate) : new Date();
  // If today is a scheduled day and not checked in, skip today and start from yesterday
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  if (repeatDays.includes(dateObj.getDay()) && !completedSet.has(todayStr)) {
    // Move to yesterday
    dateObj.setDate(dateObj.getDate() - 1);
  }
  let lookback = 0;
  while (lookback < 365) {
    const y = dateObj.getFullYear();
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const d = dateObj.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    if (repeatDays.includes(dateObj.getDay())) {
      if (completedSet.has(dateStr)) {
        streak++;
      } else {
        break; // streak ends at first missed scheduled day
      }
    } else {
      // Not a scheduled day: if user checked in, count as streak, else just skip
      if (completedSet.has(dateStr)) {
        streak++;
      }
      // else do nothing, just skip
    }
    // Go to previous day
    dateObj.setDate(dateObj.getDate() - 1);
    lookback++;
  }
  return streak;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
