"use client";

import { useRouter, usePathname } from "next/navigation";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  FileCode2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AuthSession } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [employeePosition, setEmployeePosition] = useState("");

  useEffect(() => {
    async function loadSession() {
      const s = await AuthStorageService.getSession();
      setSession(s);
      if (s?.role === "EMPLOYEE" && s.employeeId) {
        const emp = await EmployeeStorageService.getById(s.employeeId);
        if (emp) setEmployeePosition(emp.position);
      }
    }
    loadSession();
  }, []);

  const handleLogout = async () => {
    await AuthStorageService.logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/leave/my") return pathname === "/leave/my" || pathname === "/leave/new";
    if (href === "/leave") return pathname === "/leave" && !pathname.startsWith("/leave/my");
    return pathname.startsWith(href);
  };

  const isApprover = ["Manager", "Director", "Senior Staff"].includes(employeePosition);

  const getNavItems = () => {
    const base = [
      {
        href: "/dashboard",
        label: session?.role === "EMPLOYEE" ? "My Dashboard" : "Dashboard",
        icon: LayoutDashboard,
      },
    ];
    if (session?.role === "ADMIN") {
      base.push({ href: "/employees", label: "Employees", icon: Users });
      base.push({ href: "/leave", label: "All Leave Requests", icon: CalendarDays });
    } else if (session?.role === "EMPLOYEE") {
      if (isApprover) {
        // All approvers see Leave Approvals
        base.push({
          href: "/leave",
          label: "Leave Approvals",
          icon: CalendarDays,
        });
        // Only Senior Staff gets Leave Requests (own requests)
        // Manager/Director only approve, no own leave requests
        if (["Senior Staff", "Junior Staff", "Intern"].includes(employeePosition)) {
          base.push({
            href: employeePosition === "Senior Staff" ? "/leave/my" : "/leave",
            label: "Leave Requests",
            icon: FileCode2,
          });
        }
      } else {
        // Junior Staff / Intern: only Leave Requests
        base.push({
          href: "/leave",
          label: "Leave Requests",
          icon: CalendarDays,
        });
      }
    }
    return base;
  };

  const navItems = getNavItems();

  const initials = session?.username
    ? session.username.slice(0, 2).toUpperCase()
    : "??";

  const NavLink = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    onClick?: () => void;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onClick}
        className={[
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          active
            ? "bg-[#1e293b] text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        {/* Brand */}
        <div className="flex h-16 items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center shrink-0">
              <FileCode2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-700 tracking-tight text-[#0f172a] leading-tight font-bold">
                Leave System
              </p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide">
                Management Portal
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-600 text-slate-400 uppercase tracking-widest font-semibold">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0f172a] truncate leading-tight">
                {session?.username ?? "—"}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide uppercase">
                {session?.role ?? "—"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center">
            <FileCode2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#0f172a]">Leave System</span>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="text-slate-600" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-white border-r border-slate-200">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            {/* Brand in sheet */}
            <div className="flex h-16 items-center px-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
                  <FileCode2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-[#0f172a] leading-tight">Leave System</p>
                  <p className="text-[10px] text-slate-400 leading-tight tracking-wide">Management Portal</p>
                </div>
              </div>
            </div>

            {/* Nav in sheet */}
            <nav className="px-3 py-4 space-y-0.5">
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Navigation
              </p>
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} onClick={() => setSheetOpen(false)} />
              ))}
            </nav>

            {/* User in sheet */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] truncate leading-tight">
                    {session?.username ?? "—"}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight tracking-wide uppercase">
                    {session?.role ?? "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSheetOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
