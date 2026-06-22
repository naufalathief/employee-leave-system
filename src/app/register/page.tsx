"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeStorageService } from "@/services/employee-storage";
import { Employee } from "@/types";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    position: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate unique email
      const employees = await EmployeeStorageService.getAll();
      const emailExists = employees.some(
        (emp) => emp.email?.toLowerCase() === formData.email.toLowerCase()
      );

      if (emailExists) {
        toast.error("Email is already registered");
        setIsSubmitting(false);
        return;
      }

      const newEmployee: Omit<Employee, "id"> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        position: formData.position,
      };

      await EmployeeStorageService.create(newEmployee);
      toast.success("Registration successful! You can now log in.");
      router.push("/login");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-2">Sign up as a new employee</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={(val) => { if (val) handleSelectChange("department", String(val)); }} required>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select onValueChange={(val) => { if (val) handleSelectChange("position", String(val)); }} required>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior Staff">Junior Staff</SelectItem>
                <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Director">Director</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200"
              disabled={isSubmitting || !formData.department || !formData.position}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  Registering...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign Up
                </div>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
