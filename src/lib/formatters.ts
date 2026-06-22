export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const statusColors: Record<string, string> = {
  PENDING: "border-amber-200 text-amber-700 bg-amber-50 font-medium",
  CHECKED: "border-blue-200 text-blue-700 bg-blue-50 font-medium",
  APPROVED: "border-emerald-200 text-emerald-700 bg-emerald-50 font-medium",
  REJECTED: "border-rose-200 text-rose-700 bg-rose-50 font-medium",
};
