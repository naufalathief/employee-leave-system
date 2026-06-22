import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    approverId: z.string().min(1, "Approver is required"),
    type: z.enum(["ANNUAL", "SICK", "MATERNITY", "UNPAID"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .min(10, "Reason must be at least 10 characters"),
  })
  .refine(
    (data) => new Date(data.startDate) >= new Date(new Date().toISOString().split("T")[0]),
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    }
  )
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
