import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/database";
import { ACHIEVEMENTS } from "@/lib/achievements";
import User, { Achievement } from "@/models/user";

const XP_PER_LEVEL = 100;
const GEMS_PER_UPGRADE = 20;
const AVATARS = ["🧙", "🧑‍🎤", "🧑‍🚀", "🧑‍🌾", "🧑‍💻", "🧑‍🎨", "🧑‍🔬", "🧑‍🚒"];

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
  return NextResponse.json({
    level: user.level,
    xp: user.xp,
    gems: user.gems,
    avatar: user.avatar || AVATARS[0],
    name: user.name,
    about: user.about || "",
    achievements: user.achievements || [],
  });
}

// PATCH: Update avatar, about, or achievements
export async function PATCH(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const body = await req.json();
  if (body.avatar && AVATARS.includes(body.avatar)) {
    user.avatar = body.avatar;
  }
  if (typeof body.about === "string") {
    user.about = body.about;
  }
  if (Array.isArray(body.achievements)) {
    user.achievements = body.achievements;
  }
  await user.save();
  return NextResponse.json({
    level: user.level,
    xp: user.xp,
    gems: user.gems,
    avatar: user.avatar || AVATARS[0],
    name: user.name,
    about: user.about || "",
    achievements: user.achievements || [],
  });
}

// POST: Upgrade (level up with gems)
export async function POST() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  if (user.gems < GEMS_PER_UPGRADE) {
    return NextResponse.json({ message: "Not enough gems" }, { status: 400 });
  }
  user.gems -= GEMS_PER_UPGRADE;
  user.level += 1;
  // Award achievements
  const habits = await import("@/models/habit").then(m => m.default.find({ user: user._id }));
  const now = new Date();
  const earned = new Set((user.achievements || []).map((a: Achievement) => a.key));
  const toCheck = [
    { key: "level-2", cond: user.level >= 2 },
    { key: "level-5", cond: user.level >= 5 },
    { key: "level-10", cond: user.level >= 10 },
    { key: "habits-1", cond: habits.length >= 1 },
    { key: "habits-4", cond: habits.length >= 4 },
    { key: "habits-10", cond: habits.length >= 10 },
    { key: "gems-100", cond: user.gems >= 100 },
    { key: "xp-500", cond: user.xp >= 500 },
    // Streaks: check all user's habits for streaks
    { key: "streak-3", cond: habits.some(h => h.streak >= 3) },
    { key: "streak-7", cond: habits.some(h => h.streak >= 7) },
  ];
  for (const { key, cond } of toCheck) {
    if (cond && !earned.has(key)) {
      const def = ACHIEVEMENTS.find(a => a.key === key);
      if (def) {
        user.achievements = [
          ...(user.achievements || []),
          { ...def, date: now, completed: true },
        ];
      }
    }
  }
  await user.save();
  return NextResponse.json({
    level: user.level,
    xp: user.xp,
    gems: user.gems,
    avatar: user.avatar || AVATARS[0],
    name: user.name,
    about: user.about || "",
    achievements: user.achievements || [],
  });
}