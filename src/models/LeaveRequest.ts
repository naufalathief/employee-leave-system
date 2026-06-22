import mongoose, { Document, Schema } from "mongoose";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "UNPAID";

export interface ILeaveRequest extends Document {
  employeeId: string;
  approverId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: String, required: true },
    approverId: { type: String, required: true },
    type: {
      type: String,
      enum: ["ANNUAL", "SICK", "MATERNITY", "UNPAID"],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
