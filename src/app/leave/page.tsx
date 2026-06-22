"use client";

import { AppLayout } from "@/components/shared/AppLayout";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CHECKED", label: "Checked" },
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
    currentEmployee,
    session,
  } = useLeaveRequests();

  const isAdmin = session?.role === "ADMIN";
  const isApprover = currentEmployee
    ? ["Manager", "Director", "Senior Staff"].includes(currentEmployee.position)
    : false;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">
              {isAdmin ? "All Leave Requests" : isApprover ? "Leave Approvals" : "Leave Requests"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? "Manage and review all employee leave requests"
                : isApprover
                  ? "Review and approve employee leave requests"
                  : "Submit and track your leave requests"}
            </p>
          </div>
          {/* Show New Request button only for non-approver employees and admin */}
          {(isAdmin || !isApprover) && (
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
          currentEmployee={currentEmployee}
        />
      </div>
    </AppLayout>
  );
}
