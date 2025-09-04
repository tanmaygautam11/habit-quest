import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/database";
import User from "@/models/user";
import Habit from "@/models/habit";

// Example daily missions (no streaks)
const getDailyMissions = async (user: typeof User.prototype) => {
  const habits = await Habit.find({ user: user._id });
  return [
    {
      id: "habit-1",
      type: "habit",
      title: `Complete ${habits[0]?.title || "any habit"}`,
      completed: habits[0] ? habits[0].completedDates.some((d) => new Date(d).toDateString() === new Date().toDateString()) : false,
      reward: { xp: 20, gems: 5 },
      collected: user.collectedMissions?.includes("habit-1") || false,
    },
    {
      id: "any-2",
      type: "multi",
      title: "Complete any 2 habits today",
      completed: habits.filter(h => h.completedDates.some((d) => new Date(d).toDateString() === new Date().toDateString())).length >= 2,
      reward: { xp: 30, gems: 8 },
      collected: user.collectedMissions?.includes("any-2") || false,
    },
  ];
};

// Example weekly missions (streaks, etc.)
const getWeeklyMissions = async (user: typeof User.prototype) => {
  const habits = await Habit.find({ user: user._id });
  // For each habit, show streak progress toward 3, 5, 7 days, etc.
  return habits.map((h, idx) => {
    const streakGoal = 3; // Example: 3-day streak
    const streakDone = h.streak >= streakGoal;
    return {
      id: `streak-${h._id}`,
      type: "streak",
      title: `Maintain a ${streakGoal}-day streak on ${h.title}`,
      streak: h.streak,
      streakGoal,
      completed: streakDone,
      reward: { xp: 40, gems: 10 },
      collected: user.collectedMissions?.includes(`streak-${h._id}`) || false,
    };
  });
};

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const daily = await getDailyMissions(user);
  const weekly = await getWeeklyMissions(user);
  return NextResponse.json({ daily, weekly });
}

// POST: Collect a mission reward
export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const { missionId } = await req.json();
  const daily = await getDailyMissions(user);
  const weekly = await getWeeklyMissions(user);
  const allMissions = [...daily, ...weekly];
  const mission = allMissions.find(m => m.id === missionId);
  if (!mission || !mission.completed || mission.collected) {
    return NextResponse.json({ message: "Mission not available to collect" }, { status: 400 });
  }
  // Add XP and gems to user
  user.xp += mission.reward.xp;
  user.gems += mission.reward.gems;
  // Level up logic
  const XP_PER_LEVEL = 100;
  while (user.xp >= user.level * XP_PER_LEVEL) {
    user.xp -= user.level * XP_PER_LEVEL;
    user.level += 1;
  }
  // Track collected missions (reset daily in real app)
  if (!user.collectedMissions) user.collectedMissions = [];
  user.collectedMissions.push(missionId);
  await user.save();
  return NextResponse.json({ xp: user.xp, level: user.level, gems: user.gems });
}