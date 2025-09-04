import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/database";
import { Types } from "mongoose";
import Habit from "@/models/habit";
import User from "@/models/user";

// GET: Get all habits for the logged-in user
export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email }).populate("habits");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user.habits);
}

// POST: Add a new habit for the logged-in user
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
  const { title, repeat } = await req.json();
  if (!title || !repeat || !repeat.type) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }
  const habit = await Habit.create({
    user: user._id,
    title,
    repeat,
    streak: 0,
    completedDates: [],
    xp: 0,
    level: 1,
  });
  user.habits.push(habit._id as Types.ObjectId);
  await user.save();
  return NextResponse.json(habit, { status: 201 });
}
