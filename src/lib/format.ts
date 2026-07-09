import type { Finding, FindingStatus, Severity, Supporter, Wallet } from "./types";

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

const SEVERITY_ORDER_DESC: Severity[] = ["Critical", "High", "Medium", "Low"];

// The wallet's actual highest severity across all its findings — matches
// what the visible per-severity badges show (which count Fixed findings
// too), unlike the separately-curated `riskBadge` field.
export function highestSeverity(findings: { severity: Severity }[]): Severity | "None" {
  for (const s of SEVERITY_ORDER_DESC) {
    if (findings.some((f) => f.severity === s)) return s;
  }
  return "None";
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

// --- Freshness — a gradient signal, not a stale/not-stale binary ---------
// A "clean" wallet scanned 3 days ago should read as more trustworthy than
// one scanned 8 months ago, even though both show "0 open findings" today.

export function daysSinceReview(lastReviewDate: string): number {
  return Math.floor((Date.now() - new Date(lastReviewDate).getTime()) / 86_400_000);
}

export function isStale(lastReviewDate: string): boolean {
  return daysSinceReview(lastReviewDate) > 30;
}

export interface FreshnessInfo {
  label: string;
  className: string;
}

function agoLabel(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function freshnessInfo(lastReviewDate: string): FreshnessInfo {
  const days = daysSinceReview(lastReviewDate);
  if (days <= 7) return { label: `Verified ${agoLabel(days)}`, className: "bg-severity-none text-white" };
  if (days <= 30) return { label: `Verified ${agoLabel(days)}`, className: "bg-severity-none/50 text-fraktur-text" };
  if (days <= 90) return { label: `Verified ${agoLabel(days)}`, className: "bg-severity-low/70 text-black" };
  return { label: `Last verified ${agoLabel(days)} — re-scan pending`, className: "bg-fraktur-border text-fraktur-muted" };
}

// Plain-text variant of freshnessInfo (verb "Scanned", not "Verified" — a
// date isn't a verdict) shared by the wallet card and the detail page.
export function scanLabelFor(lastReviewDate: string): { label: string; colorClass: string } {
  const freshness = freshnessInfo(lastReviewDate);
  const label = freshness.label.replace(/^Verified/, "Scanned").replace(/^Last verified/, "Last scanned");
  const days = daysSinceReview(lastReviewDate);
  // Same green/blue language as the status pill (Fact 2) — a recent scan
  // reads as "healthy" (green), an older one as "still valid, just less
  // fresh" (blue), never as a muted/washed-out warning.
  const colorClass = days < 30 ? "text-severity-none" : "text-fraktur-electric";
  return { label, colorClass };
}

// --- Finding status badge (Open vs. team-declared vs. FRAKTUR-verified) --

export function findingStatusBadge(status: FindingStatus | undefined): FreshnessInfo {
  switch (status) {
    case "Verified Fixed":
      return { label: "FRAKTUR-verified fixed", className: "bg-fraktur-electric text-white" };
    case "Declared Fixed":
      return { label: "Team reports fixed — pending re-verification", className: "bg-fraktur-border text-fraktur-muted" };
    default:
      return { label: "Open", className: "bg-severity-high text-white" };
  }
}

// --- Context passed to /companies from a wallet card or the audit-history
// popup — mirrors the `reason` query param Companies already reads (see
// WEBSITE_BRIEF.md §16). `fallback` lets a specific CTA (e.g. "get the full
// report") default to a value of its own instead of omitting the param.
export function urgentReason(wallet: Pick<Wallet, "lastReviewDate" | "findings">, fallback?: string): string | undefined {
  if (isStale(wallet.lastReviewDate)) return "stale";
  if (wallet.findings.some((f: Finding) => f.status === "Declared Fixed")) return "declared-fixed";
  return fallback;
}

export function companiesHref(wallet: Pick<Wallet, "name" | "lastReviewDate" | "findings">, fallback?: string): string {
  const reason = urgentReason(wallet, fallback);
  const params = new URLSearchParams({ wallet: wallet.name });
  if (reason) params.set("reason", reason);
  return `/companies?${params.toString()}`;
}

// --- Wallet detail page slug — derived from the name rather than stored,
// so a real Airtable wallet doesn't need a new field just for this.
export function walletSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}
