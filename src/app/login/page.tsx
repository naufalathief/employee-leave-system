"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/validators/login-validator";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Eye, EyeOff, LogIn, CalendarCheck, Shield, Users } from "lucide-react";

// ── Small feature bullet used on the left panel ──
function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div
        style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon size={16} color="rgba(255,255,255,0.85)" />
      </div>
      <div>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "white", marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const result = await AuthStorageService.login(data.username, data.password);
    if (result.session) {
      toast.success("Login successful! Redirecting…");
      router.push("/dashboard");
    } else {
      toast.error(result.error ?? "Invalid username or password");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f8fafc",
      }}
    >
      {/* ── Left Panel (branding) — hidden on mobile ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "44%",
          minHeight: "100vh",
          background: "#1e293b",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle dot-grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "rgba(16,185,129,0.08)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        {/* Brand */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CalendarCheck size={20} color="white" />
            </div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "white", lineHeight: 1.2 }}>Leave System</p>
              <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Management Portal
              </p>
            </div>
          </div>

          <h2 style={{
            fontSize: "2rem", fontWeight: 800,
            color: "white", letterSpacing: "-0.035em",
            lineHeight: 1.2, marginBottom: 16,
          }}>
            Manage leave requests<br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>with clarity.</span>
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 320 }}>
            A unified portal for employees, managers, and admins to handle leave workflows efficiently.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24 }}>
          <Feature icon={Users}         title="Role-Based Access"     desc="Separate views for Admin, Manager, and Employee roles" />
          <Feature icon={CalendarCheck} title="Leave Tracking"        desc="Annual, sick, maternity, and unpaid leave management" />
          <Feature icon={Shield}        title="Approval Workflow"     desc="Multi-level approval with real-time status updates" />
        </div>

        {/* Bottom note */}
        <p style={{ position: "relative", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
          Employee Leave Management System © 2026
        </p>
      </div>

      {/* ── Right Panel (form) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile-only brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#1e293b",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CalendarCheck size={17} color="white" />
            </div>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Leave System</p>
          </div>

          {/* Form card */}
          <div style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.04)",
            padding: "36px 36px 32px",
          }}>
            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: "1.5rem", fontWeight: 800,
                color: "#0f172a", letterSpacing: "-0.03em",
                margin: "0 0 6px",
              }}>
                Welcome back
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  style={{
                    display: "block", marginBottom: 7,
                    fontSize: "0.7rem", fontWeight: 600,
                    color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase",
                  }}
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  {...register("username")}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 14px",
                    border: `1.5px solid ${errors.username ? "#fca5a5" : "#e2e8f0"}`,
                    borderRadius: 9,
                    fontSize: "0.875rem", color: "#0f172a",
                    background: errors.username ? "#fef2f2" : "white",
                    outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#475569";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(71,85,105,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.username ? "#fca5a5" : "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {errors.username && (
                  <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 5 }}>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block", marginBottom: 7,
                    fontSize: "0.7rem", fontWeight: 600,
                    color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "11px 42px 11px 14px",
                      border: `1.5px solid ${errors.password ? "#fca5a5" : "#e2e8f0"}`,
                      borderRadius: 9,
                      fontSize: "0.875rem", color: "#0f172a",
                      background: errors.password ? "#fef2f2" : "white",
                      outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#475569";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(71,85,105,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.password ? "#fca5a5" : "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute", right: 0, top: 0,
                      height: "100%", width: 42,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 5 }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: isSubmitting ? "#475569" : "#1e293b",
                  color: "white", border: "none", borderRadius: 9,
                  fontSize: "0.875rem", fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 1px 3px rgba(15,23,42,0.2)",
                  transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "#0f172a";
                    el.style.boxShadow = "0 4px 16px rgba(15,23,42,0.2)";
                    el.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = isSubmitting ? "#475569" : "#1e293b";
                  el.style.boxShadow = "0 1px 3px rgba(15,23,42,0.2)";
                  el.style.transform = "";
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{
                      width: 15, height: 15,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white", borderRadius: "50%",
                      display: "inline-block",
                      animation: "ls-spin 0.7s linear infinite",
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.7rem", color: "#cbd5e1" }}>
              Employee Leave Management System © 2026
            </p>
          </div>
        </div>
      </div>

      <Toaster richColors position="top-right" />
      <style>{`@keyframes ls-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
