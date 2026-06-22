"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "@/validators/employee-validator";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEPARTMENTS, POSITIONS } from "@/constants";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EmployeeFormProps {
  initialData?: EmployeeFormData;
  onSubmit: (data: EmployeeFormData) => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export function EmployeeForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      department: "",
      position: "",
      leaveBalance: 12,
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {mode === "create" ? "Add New Employee" : "Edit Employee"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Fill in the details to add a new employee"
              : "Update the employee information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter employee name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 chars)"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                defaultValue={initialData?.department}
                onValueChange={(value) => { if (value) setValue("department", value as string, { shouldValidate: true }); }}
              >
                <SelectTrigger
                  id="department"
                  className={errors.department ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                defaultValue={initialData?.position}
                onValueChange={(value) => { if (value) setValue("position", value as string, { shouldValidate: true }); }}
              >
                <SelectTrigger
                  id="position"
                  className={errors.position ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-destructive">{errors.position.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaveBalance">Annual Leave Balance</Label>
              <Input
                id="leaveBalance"
                type="number"
                min="0"
                placeholder="12"
                {...register("leaveBalance", { valueAsNumber: true })}
                className={errors.leaveBalance ? "border-destructive" : ""}
              />
              {errors.leaveBalance && (
                <p className="text-sm text-destructive">{errors.leaveBalance.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Create Employee" : "Update Employee"}
                  </div>
                )}
              </Button>
              <Link
                href="/employees"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
