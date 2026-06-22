"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/AppLayout";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveStorageService } from "@/services/leave-storage";
import { type LeaveRequestFormData } from "@/validators/leave-validator";
import { toast } from "sonner";

export default function NewLeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: LeaveRequestFormData) => {
    setIsSubmitting(true);
    try {
      await LeaveStorageService.create(data);
      toast.success("Leave request submitted successfully");
      router.push("/leave");
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
