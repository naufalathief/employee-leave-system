"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveRequestSchema, type LeaveRequestFormData } from "@/validators/leave-validator";
import { EmployeeStorageService } from "@/services/employee-storage";
import { Employee } from "@/types";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthSession } from "@/types";

interface LeaveFormProps {
  onSubmit: (data: LeaveRequestFormData) => void;
  isSubmitting?: boolean;
}

export function LeaveForm({ onSubmit, isSubmitting = false }: LeaveFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      approverId: "",
      type: "" as LeaveRequestFormData["type"],
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      const [data, parsed] = await Promise.all([
        EmployeeStorageService.getAll(),
        (await import("@/services/auth-storage")).AuthStorageService.getSession(),
      ]);
      setEmployees(data);
      if (parsed) {
        setSession(parsed);
        if (parsed.role === "EMPLOYEE" && parsed.employeeId) {
          setValue("employeeId", parsed.employeeId, { shouldValidate: false });
        }
      }
    }
    loadData();
  }, [setValue]);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    return Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFormSubmit = (data: LeaveRequestFormData) => {
    if (data.type === "ANNUAL") {
      const selectedEmp = employees.find((e) => e.id === data.employeeId);
      const balance = selectedEmp?.leaveBalance ?? 12;
      const daysRequested = calculateDays(data.startDate, data.endDate);
      if (daysRequested > balance) {
        toast.error(
          `Insufficient balance. You have ${balance} days left but requested ${daysRequested} days.`
        );
        return;
      }
    }
    onSubmit(data);
  };

  // Eligible approvers: senior positions, excluding current employee
  const approvers = employees.filter(
    (emp) =>
      ["Senior Staff", "Team Lead", "Manager", "Director"].includes(emp.position) &&
      emp.id !== (session?.role === "EMPLOYEE" ? session?.employeeId : undefined)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/leave"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leave Requests
        </Link>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold tracking-tight text-[#0f172a]">
            New Leave Request
          </CardTitle>
          <CardDescription className="text-slate-500">
            Submit a new leave request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

            {/* Employee — only shown to ADMIN */}
            {session?.role !== "EMPLOYEE" && (
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee
                </Label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger
                        id="employeeId"
                        className={errors.employeeId ? "border-destructive" : "border-slate-200"}
                      >
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No employees found.
                          </div>
                        ) : (
                          employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} — {emp.department}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>
            )}

            {/* Approver */}
            <div className="space-y-2">
              <Label htmlFor="approverId" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Approver
              </Label>
              <Controller
                name="approverId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger
                      id="approverId"
                      className={errors.approverId ? "border-destructive" : "border-slate-200"}
                    >
                      <SelectValue placeholder="Select an approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No eligible approvers found. Please add a Manager or Director first.
                        </div>
                      ) : (
                        approvers.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} — {emp.position}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.approverId && (
                <p className="text-xs text-destructive">{errors.approverId.message}</p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Leave Type
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger
                      id="type"
                      className={errors.type ? "border-destructive" : "border-slate-200"}
                    >
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                      <SelectItem value="SICK">Sick Leave</SelectItem>
                      <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                      <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-destructive" : "border-slate-200"}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "border-destructive" : "border-slate-200"}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for your leave request (min. 10 characters)…"
                rows={4}
                {...register("reason")}
                className={errors.reason ? "border-destructive" : "border-slate-200"}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">{errors.reason.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || employees.length === 0}
                className="bg-[#1e293b] text-white hover:bg-[#0f172a] shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Submitting…
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Submit Request
                  </div>
                )}
              </Button>
              <Link href="/leave" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
