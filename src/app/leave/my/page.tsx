"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/shared/AppLayout";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { LeaveStorageService } from "@/services/leave-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import Link from "next/link";
import { type LeaveRequest, type LeaveStatus, type AuthSession, type Employee } from "@/types";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CHECKED", label: "Checked" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function MyLeavePage() {
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
    if (!session?.employeeId) return;

    let data =
      statusFilter === "ALL"
        ? await LeaveStorageService.getAll()
        : await LeaveStorageService.getByStatus(statusFilter as LeaveStatus);

    // Only show MY OWN leave requests (where I am the requester)
    data = data.filter((req) => req.employeeId === session.employeeId);

    setLeaveRequests(data);
  }, [statusFilter, session]);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  // These are no-ops since this page is for viewing own requests, not approving
  const handleApprove = async () => {};
  const handleReject = async () => {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">
              Leave Requests
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Submit and track your leave requests
            </p>
          </div>
          <Link
            href="/leave/new"
            className={buttonVariants({ className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </div>

        <div className="max-w-[200px]">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <LeaveTable
          leaveRequests={leaveRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          currentEmployee={currentEmployee}
        />
      </div>
    </AppLayout>
  );
}
