import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { CodeReviewClient } from "./CodeReviewClient";

export const metadata: Metadata = {
  title: "Code Review Report — Employee Leave Management System",
  description:
    "Comprehensive code review report for the Employee Leave Management System.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-cr-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-cr-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-cr-mono",
  display: "swap",
  weight: ["400", "500"],
});

export default function CodeReviewPage() {
  return (
    <div
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} cr-root`}
    >
      <style>{`
        .cr-root {
          font-family: var(--font-cr-sans), 'Inter', system-ui, sans-serif;
          font-size: 15px;
          line-height: 1.65;
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: "rlig" 1, "calt" 1;
        }
        .cr-root [data-cr-heading],
        .cr-root h1, .cr-root h2, .cr-root h3 {
          font-family: var(--font-cr-heading), 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: -0.025em;
          line-height: 1.25;
        }
        .cr-root [data-cr-mono],
        .cr-root pre,
        .cr-root code {
          font-family: var(--font-cr-mono), 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.78rem;
          font-feature-settings: "liga" 1, "calt" 1;
        }
        .cr-root button,
        .cr-root input {
          font-family: inherit;
        }
        /* Remove browser default button appearance inside code-review */
        .cr-root button {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          border: none;
          outline: none;
          margin: 0;
          padding: 0;
        }
        /* Custom focus ring for accessible div-buttons */
        .cr-root [role="button"]:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: -2px;
          border-radius: 8px;
        }
        /* Hover tint on finding card header */
        .cr-root [role="button"]:hover {
          background: #f8fafc;
        }
        /* Nav responsive helpers — avoid Tailwind responsive class conflicts */
        .cr-nav-desktop { display: none; }
        .cr-nav-mobile  { display: flex; }
        @media (min-width: 640px) {
          .cr-nav-desktop { display: flex; }
          .cr-nav-mobile  { display: none; }
        }

        /* Grid layout helpers */
        .cr-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cr-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .cr-grid-3 { grid-template-columns: 1fr 1fr; }
          .cr-meta-strip { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .cr-grid-3 { grid-template-columns: 1fr; }
          .cr-grid-2 { grid-template-columns: 1fr; }
          .cr-meta-strip { grid-template-columns: 1fr 1fr !important; }
        }

        @keyframes cr-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
      <CodeReviewClient />
    </div>
  );
}
