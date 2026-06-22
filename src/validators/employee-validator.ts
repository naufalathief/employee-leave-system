import { z } from "zod";

export const employeeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  leaveBalance: z.number().min(0, "Leave balance cannot be negative"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
