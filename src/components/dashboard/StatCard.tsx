import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

const VARIANTS = {
  default: {
    accent: "#3b82f6",
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
  },
  success: {
    accent: "#16a34a",
    iconBg: "#f0fdf4",
    iconColor: "#15803d",
  },
  warning: {
    accent: "#d97706",
    iconBg: "#fffbeb",
    iconColor: "#b45309",
  },
  destructive: {
    accent: "#dc2626",
    iconBg: "#fef2f2",
    iconColor: "#b91c1c",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  const v = VARIANTS[variant];

  return (
    <div
      style={{
        background: "white",
        borderTop: "1px solid #e2e8f0",
        borderRight: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        borderLeft: `4px solid ${v.accent}`,
        borderRadius: 12,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {title}
        </p>
        <div
          style={{
            width: 34, height: 34,
            borderRadius: 8,
            background: v.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={v.iconColor} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontFamily: "var(--font-geist-mono, monospace)",
            margin: 0,
          }}
        >
          {value}
        </p>
        {description && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              marginTop: 5,
              margin: "5px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
