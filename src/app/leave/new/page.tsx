"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/AppLayout";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveStorageService } from "@/services/leave-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { type LeaveRequestFormData } from "@/validators/leave-validator";
import { toast } from "sonner";

export default function NewLeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/leave");

  useEffect(() => {
    async function determineRedirect() {
      const session = await AuthStorageService.getSession();
      if (session?.role === "EMPLOYEE" && session?.employeeId) {
        const emp = await EmployeeStorageService.getById(session.employeeId);
        if (emp && ["Manager", "Director", "Senior Staff"].includes(emp.position)) {
          setRedirectPath("/leave/my");
        }
      }
    }
    determineRedirect();
  }, []);

  const handleSubmit = async (data: LeaveRequestFormData) => {
    setIsSubmitting(true);
    try {
      await LeaveStorageService.create(data);
      toast.success("Leave request submitted successfully");
      router.push(redirectPath);
    } catch {
      toast.error("Failed to submit leave request");
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <LeaveForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </AppLayout>
  );
}
