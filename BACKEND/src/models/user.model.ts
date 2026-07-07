import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/user.utils.ts";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
  }
});

userSchema.pre("save", hashPassword);
userSchema.methods.comparePassword = comparePassword;

const User = mongoose.model("User", userSchema);
export default User;
