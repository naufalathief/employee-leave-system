import { LeaveRequest, LeaveStatus } from "@/types";

export const LeaveStorageService = {
  async getAll(): Promise<LeaveRequest[]> {
    try {
      const res = await fetch("/api/leave");
      if (!res.ok) return [];
      const data = await res.json();
      return data.leaves ?? [];
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<LeaveRequest | undefined> {
    // Fetch all and find — there's no single-GET route needed yet
    const all = await this.getAll();
    return all.find((r) => r.id === id);
  },

  async create(leaveData: Omit<LeaveRequest, "id" | "status">): Promise<LeaveRequest> {
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create leave request");
    }
    const data = await res.json();
    return data.leave;
  },

  async updateStatus(id: string, status: LeaveStatus): Promise<LeaveRequest | null> {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.leave ?? null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/leave/${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getByStatus(status: LeaveStatus): Promise<LeaveRequest[]> {
    const all = await this.getAll();
    return all.filter((r) => r.status === status);
  },

  async getByEmployeeId(employeeId: string): Promise<LeaveRequest[]> {
    try {
      const res = await fetch(`/api/leave?employeeId=${employeeId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.leaves ?? [];
    } catch {
      return [];
    }
  },

  async getStats() {
    const all = await this.getAll();
    return {
      pending: all.filter((r) => r.status === "PENDING").length,
      approved: all.filter((r) => r.status === "APPROVED").length,
      rejected: all.filter((r) => r.status === "REJECTED").length,
    };
  },
};
