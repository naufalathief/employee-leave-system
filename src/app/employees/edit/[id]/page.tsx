"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/AppLayout";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { EmployeeStorageService } from "@/services/employee-storage";
import { type EmployeeFormData } from "@/validators/employee-validator";
import { toast } from "sonner";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<EmployeeFormData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    EmployeeStorageService.getById(id).then((employee) => {
      if (employee) {
        setInitialData({
          name: employee.name,
          department: employee.department,
          position: employee.position,
          leaveBalance: employee.leaveBalance ?? 12,
        });
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    const result = await EmployeeStorageService.update(id, data);
    if (result) {
      toast.success("Employee updated successfully");
      router.push("/employees");
    } else {
      toast.error("Failed to update employee");
      setIsSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold">Employee Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The employee you are looking for does not exist.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!initialData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EmployeeForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </AppLayout>
  );
}
