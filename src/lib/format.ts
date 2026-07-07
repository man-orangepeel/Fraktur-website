import type { Severity, Supporter } from "./types";

export function severityColorClass(severity: Severity | "None"): string {
  switch (severity) {
    case "Critical":
      return "bg-severity-critical text-white";
    case "High":
      return "bg-severity-high text-white";
    case "Medium":
      return "bg-severity-medium text-black";
    case "Low":
      return "bg-severity-low text-black";
    case "None":
    default:
      return "bg-severity-none text-white";
  }
}

export function severityHex(severity: Severity | "None"): string {
  switch (severity) {
    case "Critical":
      return "#c81e6e";
    case "High":
      return "#e2542c";
    case "Medium":
      return "#e88a2f";
    case "Low":
      return "#e8b339";
    case "None":
    default:
      return "#3ba55d";
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
    Medium: 0,
    Low: 0,
  };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}

// Best-effort clickable profile link for a supporter's public handle —
// undefined when the network isn't known well enough to construct one.
export function supporterProfileUrl(s: Supporter): string | undefined {
  const clean = s.handle.replace(/^@/, "");
  if (s.network === "x") return `https://x.com/${clean}`;
  if (s.network === "nostr") return `https://njump.me/${clean}`;
  return undefined;
}
