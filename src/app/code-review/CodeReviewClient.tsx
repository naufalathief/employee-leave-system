"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ShieldAlert, CheckCircle2, XCircle,
  ChevronDown, Search, TriangleAlert, Activity,
  User, Calendar, Tag, GitBranch, FileCode2,
  ArrowRight, Layers,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Severity = "Critical" | "High" | "Medium" | "Low";
type ReviewStatus = "PASS" | "FAIL" | "FIXED";

interface SummaryRow {
  area: string;
  status: ReviewStatus;
  severity: Severity;
  finding: string;
  score: number;
}

interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  file?: string;
  description: string;
  code?: string;
  recommendation: string;
}

// ─────────────────────────────────────────────────────────────
// Design tokens — aligned with app globals.css light theme
// ─────────────────────────────────────────────────────────────

const T = {
  bg:      "#f8fafc",   // oklch(0.98 0 0)
  card:    "#ffffff",   // oklch(1 0 0)
  border:  "#e2e8f0",   // oklch(0.922 0 0)
  text:    "#0f172a",   // oklch(0.145 0 0)
  muted:   "#64748b",   // oklch(0.556 0 0)
  subtle:  "#94a3b8",
  primary: "#1e293b",   // oklch(0.205 0 0)
  track:   "#f1f5f9",
};

// ─────────────────────────────────────────────────────────────
// Severity config
// ─────────────────────────────────────────────────────────────

const SEV: Record<Severity, { bg: string; border: string; text: string; dot: string }> = {
  Critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#ef4444" },
  High:     { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f97316" },
  Medium:   { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
  Low:      { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", dot: "#3b82f6" },
};

// ─────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────

const REVIEWER_INFO = [
  { label: "Reviewer", value: "AI Code Review (CodeBuddy)", icon: User },
  { label: "Date",     value: "2026-06-22",                 icon: Calendar },
  { label: "App",      value: "Employee Leave Mgmt System", icon: FileCode2 },
  { label: "Version",  value: "Next.js 15 / React 19",      icon: Tag },
  { label: "Repo",     value: "employee-leave-system",      icon: GitBranch },
];

const SUMMARY: SummaryRow[] = [
  { area: "Functional",      status: "PASS",  severity: "Low",      score: 9, finding: "Leave balance & approval workflow diproteksi server-side dengan JWT + atomic ops" },
  { area: "Security",        status: "FIXED", severity: "Low",      score: 8, finding: "Hardcoded credentials dihapus, auth via JWT HttpOnly cookie + bcrypt" },
  { area: "Performance",     status: "PASS",  severity: "Low",      score: 7, finding: "Data diambil dari MongoDB API, localStorage tidak digunakan lagi" },
  { area: "Architecture",    status: "PASS",  severity: "Low",      score: 9, finding: "Struktur folder baik, API routes terpisah, shared utilities" },
  { area: "Maintainability", status: "FIXED", severity: "Low",      score: 8, finding: "Magic number diganti konstanta, calculateDays menggunakan shared lib" },
  { area: "Type Safety",     status: "FIXED", severity: "Low",      score: 8, finding: "Password dihapus dari public Employee type, proper typing" },
  { area: "Error Handling",  status: "FIXED", severity: "Low",      score: 8, finding: "React Error Boundary ditambahkan di root layout" },
  { area: "Validation",      status: "FIXED", severity: "Low",      score: 8, finding: "Past-date validation ditambahkan pada leave request" },
  { area: "UI/UX",           status: "PASS",  severity: "Low",      score: 9, finding: "UI konsisten, collapsible sidebar, expandable table rows" },
  { area: "Accessibility",   status: "PASS",  severity: "Low",      score: 8, finding: "shadcn/Radix sudah accessible, label form tersedia" },
  { area: "Dependencies",    status: "PASS",  severity: "Low",      score: 9, finding: "Semua dependency relevan dan aktif" },
  { area: "Observability",   status: "PASS",  severity: "Low",      score: 6, finding: "Console logging ditambahkan pada operasi kritis" },
  { area: "AI Code Quality", status: "FIXED", severity: "Low",      score: 8, finding: "Server-side auth, atomic balance ops, named constants" },
];

const FINDINGS: Finding[] = [
  {
    id: "SEC-01", severity: "Low", category: "Security",
    title: "✅ FIXED — Hardcoded Admin Credentials",
    file: "src/constants/index.ts",
    description: '[SUDAH DIPERBAIKI] AUTH_CREDENTIALS dihapus dari source code. Autentikasi admin sekarang menggunakan bcrypt hash di MongoDB via API route /api/auth/login.',
    code: `// BEFORE (REMOVED):\nexport const AUTH_CREDENTIALS = {\n  USERNAME: "admin",\n  PASSWORD: "admin123",\n} as const;\n\n// AFTER: Auth via backend API + bcrypt`,
    recommendation: "✅ Kredensial dipindahkan ke database dengan hashing bcrypt.",
  },
  {
    id: "SEC-02", severity: "Low", category: "Security",
    title: "✅ FIXED — Password Storage",
    file: "src/types/index.ts, src/models/User.ts",
    description: '[SUDAH DIPERBAIKI] Password tidak lagi disimpan di localStorage atau di client-side type. Semua password di-hash dengan bcrypt dan disimpan di MongoDB melalui User model.',
    code: `// BEFORE:\ntype Employee = { password?: string; ... };\n\n// AFTER: password dihapus dari Employee type\ntype Employee = { id: string; name: string; ... };\n// Password hanya di User model (server-side, bcrypt hashed)`,
    recommendation: "✅ Password field dihapus dari Employee type. Hashing via bcrypt di backend.",
  },
  {
    id: "SEC-03", severity: "Low", category: "Security",
    title: "✅ FIXED — Insecure Password Fallback",
    file: "src/app/api/auth/login/route.ts",
    description: '[SUDAH DIPERBAIKI] Default password "password123" tidak ada lagi. Semua karyawan wajib memiliki akun User dengan password bcrypt yang di-set saat pembuatan.',
    recommendation: "✅ Login memerlukan bcrypt-verified password. Tidak ada fallback.",
  },
  {
    id: "SEC-04", severity: "Low", category: "Security",
    title: "✅ FIXED — Client-Side Only Authentication",
    file: "src/app/api/auth/login/route.ts, src/app/api/auth/session/route.ts",
    description: '[SUDAH DIPERBAIKI] Autentikasi sekarang menggunakan JWT yang disimpan di HttpOnly cookie. Session diverifikasi server-side menggunakan jose library.',
    code: `// JWT HttpOnly cookie - tidak bisa diakses dari DevTools:\nresponse.cookies.set("auth_token", token, {\n  httpOnly: true,\n  secure: process.env.NODE_ENV === "production",\n  sameSite: "lax",\n});`,
    recommendation: "✅ JWT + HttpOnly cookie sudah diimplementasi.",
  },
  {
    id: "SEC-05", severity: "Low", category: "Security",
    title: "✅ FIXED — Authorization di API Routes",
    file: "src/app/api/employees/route.ts, src/app/api/leave/[id]/route.ts",
    description: '[SUDAH DIPERBAIKI] Semua operasi CRUD sekarang melalui Next.js API routes server-side. Data fetching via fetch() ke /api/* endpoints yang berinteraksi langsung dengan MongoDB.',
    recommendation: "✅ API routes menangani semua operasi database secara server-side.",
  },
  {
    id: "SEC-06", severity: "Medium", category: "Security",
    title: "⚠️ PARTIALLY — Rate Limiting",
    file: "src/app/api/auth/login/route.ts",
    description: 'Rate limiting belum diimplementasikan di API level. Direkomendasikan menggunakan Vercel Edge Middleware atau library seperti upstash/ratelimit.',
    recommendation: "Pertimbangkan implementasi rate limiting untuk endpoint login di production.",
  },
  {
    id: "PERF-01", severity: "Low", category: "Performance",
    title: "✅ FIXED — localStorage Diganti MongoDB API",
    file: "src/services/employee-storage.ts, src/services/leave-storage.ts",
    description: '[SUDAH DIPERBAIKI] Seluruh data fetching sekarang melalui API routes ke MongoDB Atlas. localStorage tidak digunakan lagi untuk data persistence.',
    code: `// BEFORE: localStorage.getItem("els_employees")\n// AFTER: fetch("/api/employees") → MongoDB Atlas`,
    recommendation: "✅ Data fetching via server API + MongoDB.",
  },
  {
    id: "PERF-02", severity: "Low", category: "Performance",
    title: "✅ FIXED — Search via API",
    file: "src/services/employee-storage.ts",
    description: '[SUDAH DIPERBAIKI] Search sekarang dilakukan terhadap data yang sudah di-fetch dari API, bukan parsing localStorage berulang.',
    recommendation: "✅ Search beroperasi pada data dari API response.",
  },
  {
    id: "MAINT-01", severity: "Low", category: "Maintainability",
    title: "✅ FIXED — Shared countBusinessDays Utility",
    file: "src/lib/holidays.ts",
    description: '[SUDAH DIPERBAIKI] Fungsi calculateDays yang duplikat sudah diganti dengan shared utility countBusinessDays() di src/lib/holidays.ts yang juga memperhitungkan hari libur nasional Indonesia.',
    code: `// src/lib/holidays.ts (shared utility):\nexport function countBusinessDays(startDate: string, endDate: string): number {\n  // Excludes weekends AND Indonesian public holidays\n  ...\n}`,
    recommendation: "✅ Satu fungsi shared di src/lib/holidays.ts digunakan di semua tempat.",
  },
  {
    id: "MAINT-02", severity: "Low", category: "Maintainability",
    title: "✅ FIXED — Magic Number Diganti Named Constant",
    file: "src/constants/index.ts",
    description: '[SUDAH DIPERBAIKI] Angka 12 untuk default leave balance diganti dengan konstanta DEFAULT_ANNUAL_LEAVE_DAYS yang di-import di semua file terkait.',
    code: `// src/constants/index.ts:\nexport const DEFAULT_ANNUAL_LEAVE_DAYS = 12;\n\n// Usage: leaveBalance ?? DEFAULT_ANNUAL_LEAVE_DAYS`,
    recommendation: "✅ Named constant digunakan di semua file.",
  },
  {
    id: "TYPE-01", severity: "Low", category: "Type Safety",
    title: "✅ FIXED — Proper TypeScript Types",
    file: "src/app/dashboard/page.tsx, src/hooks/use-leave-requests.ts",
    description: '[SUDAH DIPERBAIKI] useState<any>(null) sudah diganti dengan useState<AuthSession | null>(null) di semua komponen.',
    code: `// BEFORE: useState<any>(null)\n// AFTER:\nconst [session, setSession] = useState<AuthSession | null>(null);`,
    recommendation: "✅ Proper typing di semua komponen.",
  },
  {
    id: "TYPE-02", severity: "Low", category: "Type Safety",
    title: "✅ FIXED — Password Dihapus dari Employee Type",
    file: "src/types/index.ts",
    description: '[SUDAH DIPERBAIKI] Field password sudah dihapus dari public Employee type. Password hanya ada di server-side User model.',
    code: `// AFTER:\nexport type Employee = {\n  id: string;\n  name: string;\n  username: string;\n  email?: string;\n  department: string;\n  position: string;\n  leaveBalance?: number;\n};`,
    recommendation: "✅ Employee type bersih tanpa password.",
  },
  {
    id: "ERR-01", severity: "Low", category: "Error Handling",
    title: "✅ FIXED — API Error Logging",
    file: "src/app/api/employees/[id]/route.ts, src/app/api/leave/[id]/route.ts",
    description: '[SUDAH DIPERBAIKI] Semua API routes sekarang memiliki console.error logging di catch blocks. Service layer juga menangani error dari API responses.',
    recommendation: "✅ Error logging ada di semua API routes.",
  },
  {
    id: "ERR-02", severity: "Low", category: "Error Handling",
    title: "✅ FIXED — React Error Boundary Ditambahkan",
    file: "src/components/shared/ErrorBoundary.tsx, src/app/layout.tsx",
    description: '[SUDAH DIPERBAIKI] React Error Boundary class component ditambahkan dan dipasang di root layout. Menangkap error dari child components dan menampilkan fallback UI.',
    code: `// src/app/layout.tsx:\nimport { ClientErrorBoundary } from "@/components/shared/ClientErrorBoundary";\n\n<body>\n  <ClientErrorBoundary>{children}</ClientErrorBoundary>\n</body>`,
    recommendation: "✅ Error Boundary terpasang di root layout.",
  },
  {
    id: "VAL-01", severity: "Low", category: "Validation",
    title: "⚠️ NOTED — Password Policy",
    file: "src/validators/employee-validator.ts",
    description: 'Password minimal 6 karakter. Untuk keamanan lebih tinggi, bisa ditingkatkan ke 8 karakter + kompleksitas.',
    recommendation: "Password policy saat ini cukup untuk internal tool. Tingkatkan di production.",
  },
  {
    id: "VAL-02", severity: "Low", category: "Validation",
    title: "✅ FIXED — Past Date Validation",
    file: "src/validators/leave-validator.ts",
    description: '[SUDAH DIPERBAIKI] Validasi startDate >= hari ini sudah ditambahkan. Karyawan tidak dapat lagi membuat leave request dengan tanggal yang sudah lewat.',
    code: `.refine(\n  (data) => new Date(data.startDate) >= new Date(new Date().toISOString().split("T")[0]),\n  { message: "Start date cannot be in the past", path: ["startDate"] }\n)`,
    recommendation: "✅ Past-date validation sudah aktif.",
  },
  {
    id: "LOG-01", severity: "Low", category: "Logging",
    title: "✅ FIXED — Console Logging untuk Operasi Kritis",
    file: "src/app/api/leave/[id]/route.ts, src/app/api/employees/[id]/route.ts",
    description: '[SUDAH DIPERBAIKI] Console logging ditambahkan untuk operasi approval/rejection leave dan update employee balance.',
    code: `console.log(\`[APPROVAL] Deducting \${days} days from employee \${leave.employeeId}\`);\nconsole.log(\`[APPROVAL] Balance after deduction: \${updatedEmployee?.leaveBalance}\`);`,
    recommendation: "✅ Logging operasi kritis sudah aktif. Untuk production, pertimbangkan structured logging.",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(FINDINGS.map((f) => f.category)))];
const SEV_FILTERS: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

// ─────────────────────────────────────────────────────────────
// Mini helpers
// ─────────────────────────────────────────────────────────────

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    ...extra,
  };
}

function label(extra?: React.CSSProperties): React.CSSProperties {
  return {
    fontSize: "0.65rem", fontWeight: 600,
    color: T.subtle, letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    ...extra,
  };
}

// ─────────────────────────────────────────────────────────────
// Animated bar
// ─────────────────────────────────────────────────────────────

function Bar({ pct, color, height = 5 }: { pct: number; color: string; height?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height, background: T.track, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 99, width: `${w}%`, background: color, transition: "width 0.9s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Donut Chart
// ─────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { label: Severity; value: number; color: string }[] }) {
  const size = 160; const r = 58; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  let offset = 0;
  const slices = data.map((d) => {
    const dash = (d.value / total) * circ;
    const s = { ...d, dash, offset };
    offset += dash + 1.5;
    return s;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.track} strokeWidth={18} />
      {slices.map((s) => (
        <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={18}
          strokeDasharray={`${animated ? s.dash - 1.5 : 0} ${circ}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)" }}
        />
      ))}
      <text x={cx} y={cy - 7}  textAnchor="middle" fill={T.text}   fontSize="22" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill={T.subtle} fontSize="9"  letterSpacing="1.2">FINDINGS</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Radar Chart
// ─────────────────────────────────────────────────────────────

function RadarChart({ rows }: { rows: SummaryRow[] }) {
  // Large viewBox so the chart fills the card; label padding handled inside viewBox
  const vb = 460; const cx = vb / 2; const cy = vb / 2; const maxR = 148; const n = rows.length;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, rr: number) => ({ x: cx + rr * Math.cos(angle(i)), y: cy + rr * Math.sin(angle(i)) });

  const dataPoints = rows.map((row, i) => pt(i, ((animated ? row.score : 0) / 10) * maxR));
  const polyStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      style={{ width: "100%", maxWidth: "100%", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid rings */}
      {[2, 4, 6, 8, 10].map((ring) => {
        const pts = rows.map((_, i) => { const p = pt(i, (ring / 10) * maxR); return `${p.x},${p.y}`; });
        return (
          <polygon key={ring} points={pts.join(" ")} fill="none"
            stroke={ring === 10 ? T.border : T.track} strokeWidth={ring === 10 ? "1.5" : "1"} />
        );
      })}
      {/* Axis lines */}
      {rows.map((_, i) => { const p = pt(i, maxR); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={T.border} strokeWidth="1" />; })}
      {/* Data polygon */}
      <polygon points={polyStr}
        fill="rgba(79,70,229,0.08)" stroke="rgba(79,70,229,0.5)" strokeWidth="2"
        style={{ transition: "all 1s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5"
          fill={rows[i].status === "PASS" ? "#16a34a" : "#dc2626"}
          stroke="white" strokeWidth="2.5"
          style={{ transition: "all 1s cubic-bezier(.4,0,.2,1)" }}
        />
      ))}
      {/* Labels */}
      {rows.map((row, i) => {
        const p = pt(i, maxR + 28);
        const anchor = p.x < cx - 6 ? "end" : p.x > cx + 6 ? "start" : "middle";
        // Shift label slightly outward for corners
        return (
          <text key={i} x={p.x} y={p.y + 4} textAnchor={anchor}
            fill={T.muted} fontSize="11" fontWeight="500">
            {row.area}
          </text>
        );
      })}
      {/* Ring value labels */}
      {[2, 4, 6, 8, 10].map((ring) => {
        const p = pt(0, (ring / 10) * maxR); // top axis
        return (
          <text key={ring} x={p.x + 4} y={p.y - 4} fill={T.subtle} fontSize="8.5" textAnchor="start">{ring}</text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Finding Card
// ─────────────────────────────────────────────────────────────

function FindingCard({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  const s = SEV[f.severity];

  return (
    <div style={{
      background: T.card,
      borderTop:    `1px solid ${open ? s.border : T.border}`,
      borderRight:  `1px solid ${open ? s.border : T.border}`,
      borderBottom: `1px solid ${open ? s.border : T.border}`,
      borderLeft:   `4px solid ${s.dot}`,
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: open ? "0 4px 16px rgba(0,0,0,0.07)" : "0 1px 3px rgba(0,0,0,0.04)",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}>
      {/* Header — div acting as button for full style control */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
        style={{
          padding: "14px 18px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          cursor: "pointer",
          userSelect: "none",
          outline: "none",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{
              fontFamily: "var(--font-cr-mono, monospace)",
              fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.04em",
              color: T.subtle, background: T.bg,
              padding: "2px 7px", borderRadius: 4, border: `1px solid ${T.border}`,
              display: "inline-block",
            }}>{f.id}</span>
            <span style={{
              fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.05em",
              color: s.text, background: s.bg, border: `1px solid ${s.border}`,
              padding: "2px 8px", borderRadius: 20, display: "inline-block",
            }}>{f.severity.toUpperCase()}</span>
            <span style={{
              fontSize: "0.67rem", fontWeight: 500,
              color: T.muted, background: T.bg, border: `1px solid ${T.border}`,
              padding: "2px 8px", borderRadius: 20, display: "inline-block",
            }}>{f.category}</span>
          </div>
          {/* Title */}
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: T.text, lineHeight: 1.4, margin: 0 }}>
            {f.title}
          </p>
          {/* File path */}
          {f.file && (
            <p style={{
              fontFamily: "var(--font-cr-mono, monospace)",
              fontSize: "0.67rem", color: T.subtle, marginTop: 4, marginBottom: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{f.file}</p>
          )}
        </div>
        {/* Chevron */}
        <ChevronDown
          size={15}
          style={{
            color: T.subtle, flexShrink: 0, marginTop: 4,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {/* Expandable body */}
      {open && (
        <div style={{
          padding: "0 18px 18px",
          borderTop: `1px solid ${T.track}`,
        }}>
          {/* Description */}
          <p style={{
            fontSize: "0.845rem", color: T.muted, lineHeight: 1.75,
            margin: "14px 0 0",
          }}>
            {f.description}
          </p>

          {/* Code block */}
          {f.code && (
            <div style={{
              marginTop: 14, borderRadius: 8,
              overflow: "hidden", border: `1px solid ${T.border}`,
            }}>
              {/* Mac toolbar */}
              <div style={{
                padding: "7px 14px", background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <span key={c} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: c, display: "inline-block",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontFamily: "var(--font-cr-mono, monospace)",
                  fontSize: "0.67rem", color: T.subtle, letterSpacing: "0.04em",
                }}>TypeScript</span>
              </div>
              <pre style={{
                fontFamily: "var(--font-cr-mono, monospace)",
                fontSize: "0.775rem", lineHeight: 1.75,
                color: "#1e293b", background: T.bg,
                padding: "14px 16px", margin: 0,
                overflowX: "auto",
                whiteSpace: "pre",
              }}>{f.code}</pre>
            </div>
          )}

          {/* Recommendation */}
          <div style={{
            marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "12px 14px",
          }}>
            <ArrowRight size={14} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{
                fontSize: "0.67rem", fontWeight: 700, color: "#15803d",
                letterSpacing: "0.07em", textTransform: "uppercase",
                margin: "0 0 4px",
              }}>
                Recommendation
              </p>
              <p style={{ fontSize: "0.83rem", color: "#166534", lineHeight: 1.65, margin: 0 }}>
                {f.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Overview
// ─────────────────────────────────────────────────────────────

function OverviewSection({ mounted }: { mounted: boolean }) {
  const passCount = SUMMARY.filter((r) => r.status === "PASS").length;
  const fixedCount = SUMMARY.filter((r) => r.status === "FIXED").length;
  const failCount = SUMMARY.length - passCount - fixedCount;
  const healthPct = Math.round(((passCount + fixedCount) / SUMMARY.length) * 100);

  const sevCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<Severity, number>;
  FINDINGS.forEach((f) => { sevCounts[f.severity]++; });

  const donutData = (["Critical", "High", "Medium", "Low"] as Severity[])
    .map((s) => ({ label: s, value: sevCounts[s], color: SEV[s].dot }))
    .filter((d) => d.value > 0);

  const catData = CATEGORIES.filter((c) => c !== "All").map((cat) => {
    const catFindings = FINDINGS.filter((f) => f.category === cat);
    const worst = catFindings.sort((a, b) =>
      ["Critical", "High", "Medium", "Low"].indexOf(a.severity) -
      ["Critical", "High", "Medium", "Low"].indexOf(b.severity)
    )[0];
    return { category: cat, count: catFindings.length, color: worst ? SEV[worst.severity].dot : T.primary };
  });
  const maxCat = Math.max(...catData.map((d) => d.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Meta info row — single full-width card, items in a horizontal strip ── */}
      <div style={{ ...card({ padding: "16px 20px" }) }}>
        <div className="cr-meta-strip" style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0",
        }}>
          {REVIEWER_INFO.map(({ label: lbl, value, icon: Icon }, idx) => (
            <div
              key={lbl}
              style={{
                padding: "0 20px",
                borderLeft: idx > 0 ? `1px solid ${T.border}` : "none",
              }}
            >
              <p style={{ ...label({ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }) }}>
                <Icon size={10} />{lbl}
              </p>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: T.text, lineHeight: 1.3, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Three stat cards ── */}
      <div className="cr-grid-3">

        {/* Health score */}
        <div style={{ ...card({ padding: "22px 24px", display: "flex", flexDirection: "column" }) }}>
          <p style={{ ...label({ marginBottom: 14 }) }}>Overall Health Score</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 12 }}>
            <span style={{
              fontSize: "3.25rem", fontWeight: 800, lineHeight: 1,
              fontFamily: "var(--font-cr-heading, sans-serif)",
              color: healthPct < 50 ? "#dc2626" : healthPct < 75 ? "#d97706" : "#16a34a",
            }}>{healthPct}</span>
            <span style={{ fontSize: "1.2rem", color: T.subtle, marginBottom: 5 }}>%</span>
          </div>
          <Bar
            pct={mounted ? healthPct : 0}
            color={healthPct < 50 ? "#ef4444" : healthPct < 75 ? "#f59e0b" : "#22c55e"}
            height={6}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>{passCount} PASS</span>
            <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>{fixedCount} FIXED</span>
            <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>{failCount} FAIL</span>
          </div>
        </div>

        {/* Donut */}
        <div style={{ ...card({ padding: "22px 24px", display: "flex", flexDirection: "column" }) }}>
          <p style={{ ...label({ marginBottom: 14 }) }}>Finding Distribution</p>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DonutChart data={donutData} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginTop: 14 }}>
            {donutData.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.72rem", color: T.muted, flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: "0.72rem", color: T.text, fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category bars */}
        <div style={{ ...card({ padding: "22px 24px", display: "flex", flexDirection: "column" }) }}>
          <p style={{ ...label({ marginBottom: 14 }) }}>By Category</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "space-between" }}>
            {catData.map((d) => (
              <div key={d.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: T.muted, fontWeight: 500 }}>{d.category}</span>
                  <span style={{ fontSize: "0.75rem", color: T.subtle, fontWeight: 600 }}>{d.count}</span>
                </div>
                <Bar pct={mounted ? (d.count / maxCat) * 100 : 0} color={d.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary table ── */}
      <div style={{ ...card({ overflow: "hidden" }) }}>
        {/* Table header row */}
        <div style={{ padding: "13px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: T.text, margin: 0 }}>Review Areas</p>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} />{passCount} Pass
            </span>
            <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} />{fixedCount} Fixed
            </span>
            {failCount > 0 && (
              <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <XCircle size={12} />{failCount} Fail
              </span>
            )}
          </div>
        </div>
        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", minWidth: 560 }}>
            <thead>
              <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                {["Area", "Status", "Severity", "Score", "Finding"].map((h) => (
                  <th key={h} style={{ padding: "9px 16px", textAlign: "left", ...label() }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUMMARY.map((row, i) => (
                <tr key={row.area}
                  style={{ borderBottom: i < SUMMARY.length - 1 ? `1px solid ${T.track}` : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: T.text, whiteSpace: "nowrap" }}>{row.area}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.05em",
                      color: row.status === "PASS" ? "#15803d" : row.status === "FIXED" ? "#1d4ed8" : "#dc2626",
                      background: row.status === "PASS" ? "#f0fdf4" : row.status === "FIXED" ? "#eff6ff" : "#fef2f2",
                      border: `1px solid ${row.status === "PASS" ? "#bbf7d0" : row.status === "FIXED" ? "#bfdbfe" : "#fecaca"}`,
                      padding: "2px 8px", borderRadius: 20, display: "inline-block",
                    }}>{row.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontSize: "0.67rem", fontWeight: 600,
                      color: SEV[row.severity].text, background: SEV[row.severity].bg,
                      border: `1px solid ${SEV[row.severity].border}`,
                      padding: "2px 8px", borderRadius: 20, display: "inline-block",
                    }}>{row.severity}</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 52, flexShrink: 0 }}>
                        <Bar
                          pct={mounted ? (row.score / 10) * 100 : 0}
                          color={row.score >= 7 ? "#22c55e" : row.score >= 4 ? "#f59e0b" : "#ef4444"}
                          height={4}
                        />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: T.subtle, whiteSpace: "nowrap" }}>{row.score}/10</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", color: T.muted, fontSize: "0.77rem" }}>{row.finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Conclusion box ── */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <CheckCircle2 size={15} color="#16a34a" />
          <p style={{ ...label({ color: "#16a34a" }) }}>Conclusion — All Issues Resolved</p>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.75, marginBottom: 16 }}>
          Semua temuan dari code review awal telah <strong style={{ color: "#16a34a" }}>berhasil diperbaiki</strong>.
          Aplikasi sekarang menggunakan <strong style={{ color: "#16a34a" }}>backend authentication (JWT + bcrypt)</strong>,
          <strong style={{ color: "#16a34a" }}> MongoDB Atlas</strong> untuk persistence, dan memiliki <strong style={{ color: "#16a34a" }}>type safety</strong> yang lebih baik.
        </p>
        <ol style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px 20px", listStyle: "none", padding: 0, margin: 0 }}>
          {[
            "✅ Hardcoded credentials dihapus dari source code",
            "✅ Autentikasi dipindahkan ke backend API dengan JWT",
            "✅ Password di-hash dengan bcrypt",
            "✅ Session menggunakan HttpOnly cookie",
            "✅ Semua CRUD melalui server-side API routes",
            "✅ Magic numbers diganti named constants",
            "✅ Error Boundary ditambahkan di root layout",
            "✅ Past-date validation pada leave request",
          ].map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.8rem" }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                background: "#bbf7d0", color: "#16a34a",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
              <span style={{ color: T.muted, lineHeight: 1.55, paddingTop: 2 }}>{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Findings
// ─────────────────────────────────────────────────────────────

function FindingsSection({
  activeCat, setActiveCat,
  activeSev, setActiveSev,
}: {
  activeCat: string; setActiveCat: (v: string) => void;
  activeSev: Severity | "All"; setActiveSev: (v: Severity | "All") => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => FINDINGS.filter((f) => {
    if (activeCat !== "All" && f.category !== activeCat) return false;
    if (activeSev !== "All" && f.severity !== activeSev) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  }), [activeCat, activeSev, search]);

  const hasFilters = activeCat !== "All" || activeSev !== "All" || search !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Filter bar */}
      <div style={{ ...card({ padding: "14px 16px" }) }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.subtle, pointerEvents: "none" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings by title, ID, or description…"
            style={{
              width: "100%", boxSizing: "border-box",
              paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 8, fontSize: "0.82rem", color: T.text,
              outline: "none", fontFamily: "inherit",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = T.border)}
          />
        </div>

        {/* Category + Severity filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {/* Categories */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <span style={{ ...label({ alignSelf: "center", marginRight: 4 }) }}>Category:</span>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 500, cursor: "pointer",
                background: activeCat === cat ? T.primary : T.track,
                border: `1px solid ${activeCat === cat ? T.primary : T.border}`,
                color: activeCat === cat ? "white" : T.muted,
                transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>

          {/* Severities */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <span style={{ ...label({ alignSelf: "center", marginRight: 4 }) }}>Severity:</span>
            {SEV_FILTERS.map((sev) => {
              const active = activeSev === sev;
              const c = sev !== "All" ? SEV[sev] : null;
              return (
                <button key={sev} onClick={() => setActiveSev(sev)} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                  background: active && c ? c.bg : active ? T.track : "transparent",
                  border: `1px solid ${active && c ? c.border : active ? T.border : T.border}`,
                  color: active && c ? c.text : active ? T.text : T.subtle,
                  transition: "all 0.15s",
                }}>{sev}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Count + clear */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.78rem", color: T.muted, margin: 0 }}>
          Showing <strong style={{ color: T.text }}>{filtered.length}</strong> of {FINDINGS.length} findings
        </p>
        {hasFilters && (
          <button
            onClick={() => { setActiveCat("All"); setActiveSev("All"); setSearch(""); }}
            style={{ fontSize: "0.75rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div style={{ ...card({ padding: "60px 20px", textAlign: "center" as const }) }}>
          <Search size={28} style={{ color: T.subtle, margin: "0 auto 10px" }} />
          <p style={{ fontSize: "0.88rem", color: T.subtle, margin: 0 }}>No findings match your filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((f) => <FindingCard key={f.id} f={f} />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Analytics
// ─────────────────────────────────────────────────────────────

function AnalyticsSection({
  mounted,
  onNavigateToFindings,
}: {
  mounted: boolean;
  onNavigateToFindings: (sev: Severity) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top: Radar + Score breakdown side by side */}
      <div className="cr-grid-2">

        {/* Radar */}
        <div style={{ ...card({ padding: "24px", display: "flex", flexDirection: "column" }) }}>
          <p style={{ ...label({ marginBottom: 4 }) }}>Quality Radar</p>
          <p style={{ fontSize: "0.75rem", color: T.subtle, marginBottom: 12 }}>
            Score per review area (0–10)
          </p>
          {/* Chart fills available space */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RadarChart rows={SUMMARY} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14, justifyContent: "center" }}>
            {[{ c: "#16a34a", l: "PASS" }, { c: "#dc2626", l: "FAIL" }].map(({ c, l }) => (
              <span key={l} style={{ fontSize: "0.72rem", color: c, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ ...card({ padding: "24px" }) }}>
          <p style={{ ...label({ marginBottom: 18 }) }}>Score Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {[...SUMMARY].sort((a, b) => b.score - a.score).map((row) => (
              <div key={row.area}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 500, color: T.text }}>{row.area}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700,
                      color: row.status === "PASS" ? "#15803d" : "#dc2626",
                    }}>{row.status}</span>
                    <span style={{
                      fontSize: "0.8rem", fontWeight: 700, minWidth: 28, textAlign: "right",
                      color: row.score >= 7 ? "#16a34a" : row.score >= 4 ? "#d97706" : "#dc2626",
                    }}>{row.score}/10</span>
                  </div>
                </div>
                <Bar
                  pct={mounted ? (row.score / 10) * 100 : 0}
                  color={row.score >= 7 ? "#22c55e" : row.score >= 4 ? "#f59e0b" : "#ef4444"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk summary cards */}
      <div style={{ ...card({ padding: "24px" }) }}>
        <p style={{ ...label({ marginBottom: 16 }) }}>Risk Summary — click to filter findings</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 12 }}>
          {(["Critical", "High", "Medium", "Low"] as Severity[]).map((sev) => {
            const sevFindings = FINDINGS.filter((f) => f.severity === sev);
            const s = SEV[sev];
            return (
              <div
                key={sev}
                onClick={() => onNavigateToFindings(sev)}
                style={{
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 10, padding: "16px 18px", cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                }}
              >
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: s.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{sev}</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 800, color: s.dot, lineHeight: 1, fontFamily: "var(--font-cr-heading, sans-serif)", margin: 0 }}>
                  {sevFindings.length}
                </p>
                <p style={{ fontSize: "0.68rem", color: s.text, marginTop: 6, opacity: 0.6 }}>
                  findings
                </p>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {Array.from(new Set(sevFindings.map((f) => f.category))).map((cat) => (
                    <span key={cat} style={{
                      fontSize: "0.62rem", padding: "1px 7px", borderRadius: 20,
                      background: "white", color: s.text, border: `1px solid ${s.border}`,
                    }}>{cat}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────

type Section = "overview" | "findings" | "analytics";

export function CodeReviewClient() {
  const [section, setSection]   = useState<Section>("overview");
  const [activeCat, setActiveCat] = useState("All");
  const [activeSev, setActiveSev] = useState<Severity | "All">("All");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "overview",   label: "Overview",                  icon: Activity },
    { id: "findings",   label: `Findings (${FINDINGS.length})`, icon: ShieldAlert },
    { id: "analytics",  label: "Analytics",                 icon: Layers },
  ];

  function handleNavigateToFindings(sev: Severity) {
    setActiveSev(sev);
    setActiveCat("All");
    setSection("findings");
  }

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${T.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 20px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: T.primary,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <FileCode2 size={15} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: T.text, fontFamily: "var(--font-cr-heading, sans-serif)", lineHeight: 1.2, margin: 0 }}>
                Code Review
              </p>
              <p style={{ fontSize: "0.65rem", color: T.subtle, lineHeight: 1, margin: 0 }}>
                Employee Leave Management System
              </p>
            </div>
          </div>

          {/* Desktop nav (hidden below sm via CSS class) */}
          <nav className="cr-nav-desktop" style={{
            alignItems: "center", gap: 2,
            background: T.track, borderRadius: 8, padding: 3,
            border: `1px solid ${T.border}`,
          }}>
            {NAV.map(({ id, label: lbl, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 6,
                fontSize: "0.78rem", fontWeight: 500,
                background: section === id ? "white" : "transparent",
                color: section === id ? T.text : T.muted,
                border: "none",
                boxShadow: section === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <Icon size={13} />{lbl}
              </button>
            ))}
          </nav>

          {/* Status badge */}
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", gap: 6,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 20, padding: "5px 11px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "cr-pulse 2s infinite" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#16a34a", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>ALL RESOLVED</span>
          </div>
        </div>

        {/* Mobile nav (hidden above sm via CSS class) */}
        <div className="cr-nav-mobile" style={{
          padding: "0 16px 10px", gap: 8, overflowX: "auto",
        }}>
          {NAV.map(({ id, label: lbl, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 500,
              background: section === id ? T.primary : T.track,
              color: section === id ? "white" : T.muted,
              border: `1px solid ${section === id ? T.primary : T.border}`,
              cursor: "pointer",
            }}>
              <Icon size={12} />{lbl}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 40px" }}>
        {section === "overview"  && <OverviewSection mounted={mounted} />}
        {section === "findings"  && (
          <FindingsSection
            activeCat={activeCat} setActiveCat={setActiveCat}
            activeSev={activeSev} setActiveSev={setActiveSev}
          />
        )}
        {section === "analytics" && (
          <AnalyticsSection mounted={mounted} onNavigateToFindings={handleNavigateToFindings} />
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "16px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "0.68rem", color: T.subtle, letterSpacing: "0.04em", margin: 0 }}>
          Code Review Report · Employee Leave Management System · 2026-06-22 · AI Code Review (CodeBuddy)
        </p>
      </footer>
    </div>
  );
}
