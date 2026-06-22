import { useState, useCallback, useEffect } from "react";
import { Employee } from "@/types";
import { EmployeeStorageService } from "@/services/employee-storage";
import { toast } from "sonner";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEmployees = useCallback(async () => {
    const data = searchQuery
      ? await EmployeeStorageService.search(searchQuery)
      : await EmployeeStorageService.getAll();
    setEmployees(data);
  }, [searchQuery]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const deleteEmployee = async (id: string) => {
    const success = await EmployeeStorageService.delete(id);
    if (success) {
      toast.success("Employee deleted successfully");
      loadEmployees();
    } else {
      toast.error("Failed to delete employee");
    }
  };

  return {
    employees,
    searchQuery,
    setSearchQuery,
    deleteEmployee,
    refreshEmployees: loadEmployees,
  };
}
