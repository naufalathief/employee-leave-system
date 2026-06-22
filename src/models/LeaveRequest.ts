import mongoose, { Document, Schema } from "mongoose";

export type LeaveStatus = "PENDING" | "CHECKED" | "APPROVED" | "REJECTED";
export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "UNPAID";

export interface ILeaveRequest extends Document {
  employeeId: string;
  approverId: string;
  checkedById?: string;
  finalApproverId?: string;
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
    checkedById: { type: String, default: null },
    finalApproverId: { type: String, default: null },
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
      enum: ["PENDING", "CHECKED", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
