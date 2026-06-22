import { Employee } from "@/types";

export const EmployeeStorageService = {
  async getAll(): Promise<Employee[]> {
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) return [];
      const data = await res.json();
      return data.employees ?? [];
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<Employee | undefined> {
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.employee ?? undefined;
    } catch {
      return undefined;
    }
  },

  async create(employeeData: Omit<Employee, "id">): Promise<Employee> {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create employee");
    }
    const data = await res.json();
    return data.employee;
  },

  async update(id: string, employeeData: Omit<Employee, "id">): Promise<Employee | null> {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.employee ?? null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },

  async search(query: string): Promise<Employee[]> {
    const employees = await this.getAll();
    if (!query.trim()) return employees;
    const lowerQuery = query.toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  },
};
