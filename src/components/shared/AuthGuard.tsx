"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStorageService } from "@/services/auth-storage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    AuthStorageService.getSession().then((session) => {
      if (!session?.isLoggedIn) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    });
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
