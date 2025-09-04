import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IHabit extends Document {
  user: Types.ObjectId;
  title: string;
  repeat: {
    type: "daysOfWeek" | "countPerWeek";
    daysOfWeek?: number[]; // 0 (Sun) - 6 (Sat)
    countPerWeek?: number;
  };
  streak: number;
  completedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}


const HabitSchema: Schema<IHabit> = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  repeat: {
    type: { type: String, enum: ["daysOfWeek", "countPerWeek"], required: true },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    countPerWeek: { type: Number, min: 1, max: 7 },
  },
  streak: { type: Number, default: 0 },
  completedDates: [Date],
}, { timestamps: true });

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);
export default Habit;