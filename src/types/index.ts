export type Employee = {
  id: string;
  name: string;
  username: string;
  email?: string;
  password: string;
  department: string;
  position: string;
  leaveBalance?: number;
};

export type LeaveStatus = "PENDING" | "CHECKED" | "APPROVED" | "REJECTED";
export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "UNPAID";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  approverId: string;
  checkedById?: string;
  finalApproverId?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
};

export type AuthSession = {
  username: string;
  role: "ADMIN" | "EMPLOYEE";
  employeeId?: string;
  isLoggedIn: boolean;
  loginAt: string;
};

export type DashboardStats = {
  totalEmployees: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  leaveBalance?: number;
};
