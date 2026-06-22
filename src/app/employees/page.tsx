"use client";

import { AppLayout } from "@/components/shared/AppLayout";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { useEmployees } from "@/hooks/use-employees";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthStorageService } from "@/services/auth-storage";
import { type AuthSession } from "@/types";

export default function EmployeesPage() {
  const { employees, searchQuery, setSearchQuery, deleteEmployee } = useEmployees();
  const [session, setSession] = useState<AuthSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    AuthStorageService.getSession().then((s) => {
      setSession(s);
      if (s?.role === "EMPLOYEE") {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  if (session?.role === "EMPLOYEE") return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">Employees</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage your employee directory
            </p>
          </div>
          <Link
            href="/employees/new"
            className={buttonVariants({ className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Link>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <EmployeeTable employees={employees} onDelete={deleteEmployee} />
      </div>
    </AppLayout>
  );
}
