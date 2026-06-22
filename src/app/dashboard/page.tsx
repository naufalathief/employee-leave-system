"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/shared/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LeaveStorageService } from "@/services/leave-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { type DashboardStats, type AuthSession } from "@/types";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    leaveBalance: 12,
  });

  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    async function loadData() {
      const currentSession = await AuthStorageService.getSession();
      setSession(currentSession);

      const [employees, allLeaves] = await Promise.all([
        EmployeeStorageService.getAll(),
        currentSession?.role === "EMPLOYEE" && currentSession?.employeeId
          ? LeaveStorageService.getByEmployeeId(currentSession.employeeId)
          : LeaveStorageService.getAll(),
      ]);

      let balance = 12;
      if (currentSession?.role === "EMPLOYEE" && currentSession?.employeeId) {
        const emp = employees.find((e) => e.id === currentSession.employeeId);
        if (emp && emp.leaveBalance !== undefined) {
          balance = emp.leaveBalance;
        }
      }

      setStats({
        totalEmployees: employees.length,
        pendingLeaves: allLeaves.filter((l) => l.status === "PENDING").length,
        approvedLeaves: allLeaves.filter((l) => l.status === "APPROVED").length,
        rejectedLeaves: allLeaves.filter((l) => l.status === "REJECTED").length,
        leaveBalance: balance,
      });
    }

    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="pb-6 border-b border-slate-100">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">
            {session?.role === "EMPLOYEE" ? "My Dashboard" : "Dashboard"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {session?.role === "EMPLOYEE"
              ? "Overview of your leave requests"
              : "Overview of employee leave management"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {session?.role !== "EMPLOYEE" && (
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={Users}
              description="Active employees"
              variant="default"
            />
          )}
          {session?.role === "EMPLOYEE" && (
            <StatCard
              title="Annual Leave Balance"
              value={stats.leaveBalance || 0}
              icon={Users}
              description="Remaining quota"
              variant="default"
            />
          )}
          <StatCard
            title="Pending Requests"
            value={stats.pendingLeaves}
            icon={Clock}
            description="Awaiting approval"
            variant="warning"
          />
          <StatCard
            title="Approved Requests"
            value={stats.approvedLeaves}
            icon={CheckCircle2}
            description="Leaves approved"
            variant="success"
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejectedLeaves}
            icon={XCircle}
            description="Leaves rejected"
            variant="destructive"
          />
        </div>
      </div>
    </AppLayout>
  );
}
