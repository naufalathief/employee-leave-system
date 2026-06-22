import { useState, useCallback, useEffect } from "react";
import { LeaveRequest, LeaveStatus, AuthSession } from "@/types";
import { LeaveStorageService } from "@/services/leave-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { toast } from "sonner";

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    AuthStorageService.getSession().then((s) => setSession(s));
  }, []);

  const loadLeaveRequests = useCallback(async () => {
    let data =
      statusFilter === "ALL"
        ? await LeaveStorageService.getAll()
        : await LeaveStorageService.getByStatus(statusFilter as LeaveStatus);

    if (session?.role === "EMPLOYEE" && session?.employeeId) {
      data = data.filter(
        (req) =>
          req.employeeId === session.employeeId ||
          req.approverId === session.employeeId
      );
    }

    setLeaveRequests(data);
  }, [statusFilter, session]);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const approveRequest = async (id: string) => {
    const request = await LeaveStorageService.getById(id);
    if (!request) {
      toast.error("Leave request not found");
      return;
    }

    if (request.type === "ANNUAL") {
      const employee = await EmployeeStorageService.getById(request.employeeId);
      if (employee) {
        const balance = employee.leaveBalance ?? 12;
        const days = calculateDays(request.startDate, request.endDate);
        if (balance >= days) {
          await EmployeeStorageService.update(employee.id, {
            ...employee,
            leaveBalance: balance - days,
          });
        } else {
          toast.error("Insufficient leave balance for approval");
          return;
        }
      }
    }

    const result = await LeaveStorageService.updateStatus(id, "APPROVED");
    if (result) {
      toast.success("Leave request approved");
      loadLeaveRequests();
    } else {
      toast.error("Failed to approve leave request");
    }
  };

  const rejectRequest = async (id: string) => {
    const result = await LeaveStorageService.updateStatus(id, "REJECTED");
    if (result) {
      toast.success("Leave request rejected");
      loadLeaveRequests();
    } else {
      toast.error("Failed to reject leave request");
    }
  };

  return {
    leaveRequests,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    refreshRequests: loadLeaveRequests,
  };
}
