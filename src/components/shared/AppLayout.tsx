"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <main
          className={`transition-all duration-300 ease-in-out ${
            collapsed ? "md:pl-[68px]" : "md:pl-64"
          }`}
        >
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
