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
type ReviewStatus = "PASS" | "FAIL";

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
  { label: "Date",     value: "2026-06-11",                 icon: Calendar },
  { label: "App",      value: "Employee Leave Mgmt System", icon: FileCode2 },
  { label: "Version",  value: "Next.js 15 / React 19",      icon: Tag },
  { label: "Repo",     value: "employee-leave-system",      icon: GitBranch },
];

const SUMMARY: SummaryRow[] = [
  { area: "Functional",      status: "FAIL", severity: "High",     score: 5, finding: "Leave balance & approval workflow tidak diproteksi server side" },
  { area: "Security",        status: "FAIL", severity: "Critical", score: 1, finding: "Hardcoded credentials, plaintext password, insecure localStorage session" },
  { area: "Performance",     status: "FAIL", severity: "Medium",   score: 5, finding: "Repeated localStorage access, no debounce pada search input" },
  { area: "Architecture",    status: "PASS", severity: "Low",      score: 8, finding: "Struktur folder baik, namun ada duplikasi logic" },
  { area: "Maintainability", status: "FAIL", severity: "Medium",   score: 5, finding: "Magic number, any type, duplikasi fungsi calculateDays" },
  { area: "Type Safety",     status: "FAIL", severity: "Medium",   score: 4, finding: "Banyak any type, password di public Employee type" },
  { area: "Error Handling",  status: "FAIL", severity: "Medium",   score: 4, finding: "Silent catch block, tidak ada React Error Boundary" },
  { area: "Validation",      status: "FAIL", severity: "Medium",   score: 5, finding: "Password policy lemah, missing past-date validation" },
  { area: "UI/UX",           status: "PASS", severity: "Low",      score: 8, finding: "UI konsisten, feedback toast tersedia" },
  { area: "Accessibility",   status: "PASS", severity: "Low",      score: 8, finding: "shadcn/Radix sudah accessible, label form tersedia" },
  { area: "Dependencies",    status: "PASS", severity: "Low",      score: 9, finding: "Semua dependency relevan dan aktif" },
  { area: "Observability",   status: "FAIL", severity: "Medium",   score: 2, finding: "Tidak ada audit log, security event tidak dicatat" },
  { area: "AI Code Quality", status: "FAIL", severity: "High",     score: 4, finding: "Fake security (client-side auth), duplicate logic" },
];

const FINDINGS: Finding[] = [
  {
    id: "SEC-01", severity: "Critical", category: "Security",
    title: "Hardcoded Admin Credentials",
    file: "src/constants/index.ts",
    description: 'Kredensial admin (username: "admin", password: "admin123") disimpan langsung di source code dan dapat dibaca siapapun yang mengakses repository.',
    code: `export const AUTH_CREDENTIALS = {\n  USERNAME: "admin",\n  PASSWORD: "admin123",\n} as const;`,
    recommendation: "Pindahkan ke environment variable (.env.local) dan validasi di backend API.",
  },
  {
    id: "SEC-02", severity: "Critical", category: "Security",
    title: "Plaintext Password Storage di localStorage",
    file: "src/types/index.ts, src/services/employee-storage.ts",
    description: "Password karyawan disimpan tanpa hashing di localStorage. Siapapun dengan akses DevTools dapat membaca semua password.",
    code: `type Employee = {\n  password?: string; // ❌ plaintext\n  ...\n};`,
    recommendation: "Jangan simpan password di client. Gunakan backend dengan bcrypt untuk hashing.",
  },
  {
    id: "SEC-03", severity: "Critical", category: "Security",
    title: "Insecure Password Fallback",
    file: "src/services/auth-storage.ts",
    description: 'Default password "password123" di-hardcode untuk karyawan yang belum set password, memungkinkan login tidak sah.',
    code: `const employeePassword = employee.password || "password123"; // ❌`,
    recommendation: "Wajibkan password untuk semua karyawan. Hapus default password.",
  },
  {
    id: "SEC-04", severity: "Critical", category: "Security",
    title: "Client-Side Only Authentication",
    file: "src/services/auth-storage.ts",
    description: "Seluruh autentikasi terjadi di browser. Session disimpan di localStorage dan dapat dipalsukan melalui DevTools console.",
    code: `// Attacker bisa melakukan ini di DevTools:\nlocalStorage.setItem('els_auth_session', JSON.stringify({\n  username: 'admin',\n  role: 'ADMIN',\n  isLoggedIn: true,\n}));`,
    recommendation: "Implementasikan backend authentication. Gunakan JWT dengan HttpOnly cookie.",
  },
  {
    id: "SEC-05", severity: "High", category: "Security",
    title: "Tidak Ada Authorization Check di Layer Service",
    file: "src/services/employee-storage.ts, src/services/leave-storage.ts",
    description: "Semua operasi CRUD dapat dipanggil langsung tanpa verifikasi role/ownership. Role check hanya ada di level UI.",
    recommendation: "Tambahkan middleware authorization di setiap service call atau pindahkan ke API route.",
  },
  {
    id: "SEC-06", severity: "High", category: "Security",
    title: "Tidak Ada Rate Limiting / Brute Force Protection",
    file: "src/services/auth-storage.ts",
    description: "Tidak ada pembatasan jumlah percobaan login. Brute force attack tidak terdeteksi dan tidak diblokir.",
    recommendation: "Implementasikan rate limiting di API level (Next.js middleware atau backend).",
  },
  {
    id: "PERF-01", severity: "Medium", category: "Performance",
    title: "Repeated localStorage Access Tanpa Caching",
    file: "src/app/dashboard/page.tsx, src/app/employees/page.tsx, dll",
    description: "Parsing localStorage session dilakukan ulang di 5+ komponen dengan kode yang identik. Tidak ada centralized state.",
    code: `// Berulang di banyak komponen:\nconst authSession = localStorage.getItem("els_auth_session");\nlet currentSession = null;\nif (authSession) {\n  currentSession = JSON.parse(authSession);\n}`,
    recommendation: "Buat custom hook useAuthSession() atau gunakan React Context.",
  },
  {
    id: "PERF-02", severity: "Medium", category: "Performance",
    title: "Search Input Tanpa Debounce",
    file: "src/services/employee-storage.ts",
    description: "Search di-trigger setiap keystroke dan mem-parse seluruh data dari localStorage setiap kali.",
    recommendation: "Tambahkan debounce 300ms pada search input.",
  },
  {
    id: "MAINT-01", severity: "Medium", category: "Maintainability",
    title: "Duplicate Function calculateDays",
    file: "src/hooks/use-leave-requests.ts, src/components/leave/LeaveForm.tsx",
    description: "Fungsi calculateDays yang identik muncul di dua file berbeda, melanggar prinsip DRY.",
    code: `const calculateDays = (start: string, end: string) => {\n  const s = new Date(start);\n  const e = new Date(end);\n  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;\n  const diff = Math.abs(e.getTime() - s.getTime());\n  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;\n};`,
    recommendation: "Pindahkan ke src/lib/date-utils.ts dan import dari kedua tempat.",
  },
  {
    id: "MAINT-02", severity: "Medium", category: "Maintainability",
    title: "Magic Number untuk Default Leave Balance",
    file: "src/services/employee-storage.ts",
    description: 'Angka "12" digunakan langsung tanpa nama konstanta yang menjelaskan artinya.',
    code: `leaveBalance: data.leaveBalance !== undefined ? data.leaveBalance : 12, // ❌`,
    recommendation: "const DEFAULT_ANNUAL_LEAVE_DAYS = 12; lalu gunakan konstanta tersebut.",
  },
  {
    id: "TYPE-01", severity: "Medium", category: "Type Safety",
    title: "Penggunaan `any` Type di Banyak Komponen",
    file: "src/app/dashboard/page.tsx, dll",
    description: "useState<any>(null) digunakan untuk menyimpan session auth di 5+ komponen, menghilangkan manfaat TypeScript.",
    code: `const [session, setSession] = useState<any>(null); // ❌`,
    recommendation: "Gunakan useState<AuthSession | null>(null) dengan type yang benar.",
  },
  {
    id: "TYPE-02", severity: "Medium", category: "Type Safety",
    title: "Password di Public Employee Type",
    file: "src/types/index.ts",
    description: "Field password ada di type Employee yang digunakan di seluruh aplikasi termasuk UI layer.",
    code: `export type Employee = {\n  password?: string; // ❌ jangan di public type\n  ...\n};`,
    recommendation: "Pisahkan menjadi EmployeePublic (tanpa password) dan EmployeeWithCredentials (internal).",
  },
  {
    id: "ERR-01", severity: "Medium", category: "Error Handling",
    title: "Silent Catch Block",
    file: "src/services/employee-storage.ts, src/services/leave-storage.ts",
    description: "Error saat parsing localStorage di-catch dan diabaikan tanpa logging. Data corrupt tidak terdeteksi.",
    code: `} catch {\n  return []; // ❌ error ditelan\n}`,
    recommendation: "Tambahkan console.error atau error tracking service di dalam catch block.",
  },
  {
    id: "ERR-02", severity: "Medium", category: "Error Handling",
    title: "Tidak Ada React Error Boundary",
    file: "src/app/layout.tsx",
    description: "Tidak ada Error Boundary. Satu component error akan crash seluruh aplikasi.",
    recommendation: "Tambahkan <ErrorBoundary> di root layout.",
  },
  {
    id: "VAL-01", severity: "Medium", category: "Validation",
    title: "Validasi Password Lemah",
    file: "src/validators/employee-validator.ts",
    description: "Minimal 6 karakter tanpa persyaratan kompleksitas. Password bersifat opsional.",
    code: `password: z.string().min(6, "...").optional() // ❌ terlalu lemah`,
    recommendation: "Minimal 8 karakter, wajib ada huruf kapital, angka, dan simbol.",
  },
  {
    id: "VAL-02", severity: "Low", category: "Validation",
    title: "Tidak Ada Validasi Past Date pada Leave Request",
    file: "src/validators/leave-validator.ts",
    description: "Karyawan dapat membuat leave request dengan tanggal yang sudah lewat.",
    recommendation: "Tambahkan .refine untuk cek startDate >= today.",
  },
  {
    id: "LOG-01", severity: "Medium", category: "Logging",
    title: "Tidak Ada Audit Log",
    file: "src/services/ (semua service)",
    description: "Tidak ada pencatatan untuk aksi kritis: approve/reject leave, delete employee, login/logout.",
    recommendation: "Buat audit-log.ts service untuk compliance trail.",
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
  const failCount = SUMMARY.length - passCount;
  const healthPct = Math.round((passCount / SUMMARY.length) * 100);

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
            <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <XCircle size={12} />{failCount} Fail
            </span>
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
                      color: row.status === "PASS" ? "#15803d" : "#dc2626",
                      background: row.status === "PASS" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${row.status === "PASS" ? "#bbf7d0" : "#fecaca"}`,
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
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <TriangleAlert size={15} color="#dc2626" />
          <p style={{ ...label({ color: "#dc2626" }) }}>Conclusion — Request Changes</p>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.75, marginBottom: 16 }}>
          Aplikasi memiliki <strong style={{ color: "#15803d" }}>arsitektur yang baik dan UI yang rapi</strong>,
          namun mengandung <strong style={{ color: "#dc2626" }}>4 celah keamanan Critical</strong> yang
          tidak dapat diterima untuk deployment production.
        </p>
        <ol style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px 20px", listStyle: "none", padding: 0, margin: 0 }}>
          {[
            "Hapus hardcoded credentials dari source code",
            "Pindahkan autentikasi ke backend API",
            "Hash password sebelum disimpan",
            "Ganti localStorage session dengan HttpOnly cookie",
            "Tambahkan authorization check di layer service",
            "Perbaiki penggunaan any type",
            "Konsolidasi duplicate code",
            "Tambahkan audit logging untuk aksi kritis",
          ].map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.8rem" }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                background: "#fecaca", color: "#dc2626",
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
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 20, padding: "5px 11px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "cr-pulse 2s infinite" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#dc2626", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>REQUEST CHANGES</span>
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
          Code Review Report · Employee Leave Management System · 2026-06-11 · AI Code Review (CodeBuddy)
        </p>
      </footer>
    </div>
  );
}
