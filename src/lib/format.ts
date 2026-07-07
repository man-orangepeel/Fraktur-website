import type { Severity } from "./types";

export function severityColorClass(severity: Severity | "None"): string {
  switch (severity) {
    case "Critical":
      return "bg-risk-critical text-white";
    case "High":
      return "bg-risk-high text-white";
    case "Medium-High":
      return "bg-risk-mediumHigh text-black";
    case "Medium":
      return "bg-risk-medium text-black";
    case "Low":
      return "bg-risk-low text-white";
    default:
      return "bg-fraktur-border text-fraktur-muted";
  }
}

export function formatSats(sats: number): string {
  return `${sats.toLocaleString("en-US")} sats`;
}

export function reductionPct(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round((1 - after / before) * 100);
}

export function countBySeverity(findings: { severity: Severity }[]) {
  const counts: Record<Severity, number> = {
    Critical: 0,
    High: 0,
    "Medium-High": 0,
    Medium: 0,
    Low: 0,
  };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}
