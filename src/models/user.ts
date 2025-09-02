import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  id: string;
  username?: string;
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
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;