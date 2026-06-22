import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  username: string;
  email?: string;
  department: string;
  position: string;
  leaveBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    leaveBalance: { type: Number, default: 12 },
  },
  { timestamps: true }
);

export const Employee =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
