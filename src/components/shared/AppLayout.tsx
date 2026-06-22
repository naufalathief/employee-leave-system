"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="md:pl-64">
          <div className="pt-14 md:pt-0">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </AuthGuard>
  );
}
