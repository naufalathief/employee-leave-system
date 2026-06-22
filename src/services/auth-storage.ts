import { AuthSession } from "@/types";

export const AuthStorageService = {
  async login(usernameOrEmail: string, password: string): Promise<{ session: AuthSession | null; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) return { session: null, error: data.error ?? "Login failed" };
      return { session: data.session ?? null };
    } catch {
      return { session: null, error: "Network error. Please try again." };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  },

  async getSession(): Promise<AuthSession | null> {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      const data = await res.json();
      return data.session ?? null;
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session?.isLoggedIn === true;
  },
};
