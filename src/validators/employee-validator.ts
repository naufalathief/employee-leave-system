import { z } from "zod";

// Base fields shared by create & edit
const baseFields = {
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  leaveBalance: z.number().min(0, "Leave balance cannot be negative").max(12, "Maximum annual leave balance is 12"), // DEFAULT_ANNUAL_LEAVE_DAYS
};

// Create: password is required
export const employeeSchema = z.object({
  ...baseFields,
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

// Edit: password is optional (empty = keep existing)
export const employeeEditSchema = z.object({
  ...baseFields,
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type EmployeeEditFormData = z.infer<typeof employeeEditSchema>;
