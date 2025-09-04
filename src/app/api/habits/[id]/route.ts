import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/database";
import Habit from "@/models/habit";
import User from "@/models/user";

// PATCH: Update a habit
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const { id } = params;
  const update = await req.json();
  const habit = await Habit.findOneAndUpdate({ _id: id, user: user._id }, update, { new: true });
  if (!habit) {
    return NextResponse.json({ message: "Habit not found" }, { status: 404 });
  }
  return NextResponse.json(habit);
}

// DELETE: Delete a habit
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const { id } = params;
  const habit = await Habit.findOneAndDelete({ _id: id, user: user._id });
  if (!habit) {
    return NextResponse.json({ message: "Habit not found" }, { status: 404 });
  }
  // Remove habit from user's habits array
  user.habits = user.habits.filter((h: { toString: () => string; }) => h.toString() !== id);
  await user.save();
  return NextResponse.json({ message: "Habit deleted" });
}

// POST: Mark a habit as complete for a date (today by default)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  const { id } = params;
  const { date } = await req.json();
  const today = date ? new Date(date) : new Date();
  const habit = await Habit.findOne({ _id: id, user: user._id });
  if (!habit) {
    return NextResponse.json({ message: "Habit not found" }, { status: 404 });
  }
  // Only add if not already completed for this date
  const dateStr = today.toISOString().slice(0, 10);
  const alreadyCompleted = habit.completedDates.some((d: Date) => d.toISOString().slice(0, 10) === dateStr);
  if (!alreadyCompleted) {
    habit.completedDates.push(today);
    habit.streak += 1;
    await habit.save();

    // RPG logic: add XP to user, level up if needed
    const XP_PER_HABIT = 10;
    const XP_PER_LEVEL = 100;
    user.xp += XP_PER_HABIT;
    while (user.xp >= user.level * XP_PER_LEVEL) {
      user.xp -= user.level * XP_PER_LEVEL;
      user.level += 1;
    }
    await user.save();
  }
  return NextResponse.json(habit);
}
