"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/AppLayout";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
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
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function LeavePage() {
  const {
    leaveRequests,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
  } = useLeaveRequests();

  const [isApproverOnly, setIsApproverOnly] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const session = await AuthStorageService.getSession();
      if (session?.role === "EMPLOYEE" && session?.employeeId) {
        const emp = await EmployeeStorageService.getById(session.employeeId);
        if (emp && ["Manager", "Director"].includes(emp.position)) {
          setIsApproverOnly(true);
        }
      }
    }
    checkRole();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">
              {isApproverOnly ? "Leave Approvals" : "Leave Requests"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isApproverOnly
                ? "Review and approve employee leave requests"
                : "Manage and review employee leave requests"}
            </p>
          </div>
          {!isApproverOnly && (
            <Link
              href="/leave/new"
              className={buttonVariants({ className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
          )}
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
          onApprove={approveRequest}
          onReject={rejectRequest}
        />
      </div>
    </AppLayout>
  );
}
