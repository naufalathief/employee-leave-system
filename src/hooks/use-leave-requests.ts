import { useState, useCallback, useEffect } from "react";
import { LeaveRequest, LeaveStatus, AuthSession, Employee } from "@/types";
import { LeaveStorageService } from "@/services/leave-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { toast } from "sonner";

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    async function loadSession() {
      const s = await AuthStorageService.getSession();
      setSession(s);
      if (s?.employeeId) {
        const emp = await EmployeeStorageService.getById(s.employeeId);
        if (emp) setCurrentEmployee(emp);
      }
    }
    loadSession();
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

  const approveRequest = async (id: string, forwardToManagerId?: string) => {
    const result = await LeaveStorageService.updateStatus(
      id,
      "APPROVED",
      session?.employeeId,
      forwardToManagerId
    );

    if (result.leave) {
      if (result.leave.status === "CHECKED") {
        toast.success(result.message ?? "Request checked. Forwarded to Manager for final approval.");
      } else {
        toast.success("Leave request approved");
      }
      loadLeaveRequests();
    } else {
      toast.error(result.error ?? "Failed to approve leave request");
    }
  };

  const rejectRequest = async (id: string) => {
    const result = await LeaveStorageService.updateStatus(
      id,
      "REJECTED",
      session?.employeeId
    );

    if (result.leave) {
      toast.success("Leave request rejected");
      loadLeaveRequests();
    } else {
      toast.error(result.error ?? "Failed to reject leave request");
    }
  };

  return {
    leaveRequests,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    refreshRequests: loadLeaveRequests,
    currentEmployee,
    session,
  };
}
