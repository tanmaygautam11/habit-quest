import mongoose, { Document, Schema } from "mongoose";


import { Types } from "mongoose";


interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  id: string;
  username?: string;
  habits: Types.ObjectId[];
  xp: number;
  level: number;
  gems: number;
  collectedMissions?: string[];
  avatar?: string;
  about?: string;
  achievements?: Achievement[];
}


export interface Achievement {
  key: string;
  title: string;
  description: string;
  date: Date;
  icon: string;
  completed: boolean;
}


const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
  },
  habits: [{ type: Types.ObjectId, ref: "Habit" }],
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  gems: { type: Number, default: 0 },
  collectedMissions: { type: [String], default: [] },
  avatar: { type: String, required: false },
  about: { type: String, required: false, default: "" },
  achievements: {
    type: [
      {
        key: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        icon: { type: String, required: true },
        completed: { type: Boolean, required: true },
      },
    ],
    default: [],
  }
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export { User as default };