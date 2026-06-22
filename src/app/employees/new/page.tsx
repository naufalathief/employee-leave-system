"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/AppLayout";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { EmployeeStorageService } from "@/services/employee-storage";
import { type EmployeeFormData } from "@/validators/employee-validator";
import { toast } from "sonner";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await EmployeeStorageService.create(data);
      toast.success("Employee created successfully");
      router.push("/employees");
    } catch {
      toast.error("Failed to create employee");
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <EmployeeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
      />
    </AppLayout>
  );
}
