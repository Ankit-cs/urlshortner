import bcrypt from "bcrypt";
import { Document } from "mongoose";

export const hashPassword = async function (this: Document & { password?: string }, next: any) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
};

export const comparePassword = async function (this: { password?: string }, password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};
