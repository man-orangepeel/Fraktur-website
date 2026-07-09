"use client";

import { useMemo, useState } from "react";
import type { Finding, Severity, Wallet } from "@/lib/types";
import { findingStatusBadge, scanLabelFor, severityColorClass, severityHex } from "@/lib/format";
import { AuditFlowDiagram } from "./AuditFlowDiagram";
import { useDonation } from "./DonationContext";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

type PeriodFilter = "all" | "30d" | "90d" | "year";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: "All",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  year: "This year",
};

const SEVERITY_RANK: Record<Severity, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
const SEVERITY_FILTERS: (Severity | "None")[] = ["Critical", "High", "Medium", "Low", "None"];

const PAGE_SIZE = 12;

function roundHighestSeverity(findings: Finding[]): Severity | "None" {
  let best: Severity | "None" = "None";
  let bestRank = -1;
  for (const f of findings) {
    if (SEVERITY_RANK[f.severity] > bestRank) {
      bestRank = SEVERITY_RANK[f.severity];
      best = f.severity;
    }
  }
  return best;
}

function roundIsComplete(findings: Finding[]): boolean {
  return !findings.some((f) => !f.status || f.status === "Open");
}

/**
 * The whole interactive body of the wallet detail page: a history sidebar
 * (filters + list + pagination) on the left, and the wallet's "card" — the
 * exact same text layout/data as the Home page grid, just standalone —
 * plus the selected round's finding detail on the right. Selecting a round
 * updates both the diagram's severity blocks and the finding list below it.
 */
export function WalletDetailView({
  wallet,
  maxTestsRun,
  maxFilesScanned,
}: {
  wallet: Wallet;
  maxTestsRun: number;
  maxFilesScanned: number;
}) {
  const { open: openDonation } = useDonation();
  const { label: scanLabel, colorClass: scanColorClass } = scanLabelFor(wallet.lastReviewDate);
  const isCompleted = wallet.status === "Completed";

  const history = useMemo(
    () => [...(wallet.auditHistory ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [wallet.auditHistory]
  );

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [severityFilters, setSeverityFilters] = useState<Set<Severity | "None">>(new Set());
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function toggleSeverityFilter(sev: Severity | "None") {
    setSeverityFilters((prev) => {
      const next = new Set(prev);
      if (next.has(sev)) next.delete(sev);
      else next.add(sev);
      return next;
    });
    setPage(0);
  }

  const roundsWithMeta = useMemo(
    () =>
      history.map((h) => {
        const findings = wallet.findings.filter((f) => h.findingIds.includes(f.id));
        return { round: h, findings, highest: roundHighestSeverity(findings), complete: roundIsComplete(findings) };
      }),
    [history, wallet.findings]
  );

  const filtered = useMemo(() => {
    return roundsWithMeta.filter(({ round, highest }) => {
      if (periodFilter !== "all") {
        const d = new Date(round.date);
        if (periodFilter === "year") {
          if (d.getFullYear() !== new Date().getFullYear()) return false;
        } else {
          const days = (Date.now() - d.getTime()) / 86_400_000;
          if (periodFilter === "30d" && days > 30) return false;
          if (periodFilter === "90d" && days > 90) return false;
        }
      }
      if (severityFilters.size > 0 && !severityFilters.has(highest)) return false;
      return true;
    });
  }, [roundsWithMeta, periodFilter, severityFilters]);

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (history.length === 0) {
    return <p className="text-sm text-fraktur-muted">No audit rounds recorded for this wallet yet.</p>;
  }

  const currentEntry = roundsWithMeta.find((r) => r.round.date === selectedDate) ?? roundsWithMeta[0];
  const current = currentEntry.round;
  const currentFindings = [...currentEntry.findings].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
        {/* Column 1 — audit history: filters, list, pagination. */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-fraktur-text">Audit history</h2>

          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fraktur-muted">Age</p>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setPeriodFilter(f);
                  setPage(0);
                }}
                className={`rounded-full border px-3 py-1 font-medium transition ${
                  periodFilter === f
                    ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                    : "border-fraktur-border text-fraktur-muted hover:border-fraktur-electric/50"
                }`}
              >
                {PERIOD_LABELS[f]}
              </button>
            ))}
          </div>

          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fraktur-muted">Vulnerability type</p>
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {SEVERITY_FILTERS.map((sev) => (
              <button
                key={sev}
                onClick={() => toggleSeverityFilter(sev)}
                className={`rounded-full border px-3 py-1 font-medium transition ${
                  severityFilters.has(sev)
                    ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                    : "border-fraktur-border text-fraktur-muted hover:border-fraktur-electric/50"
                }`}
              >
                {sev === "None" ? "Clean" : sev}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-fraktur-muted">No scans match these filters.</p>
          ) : (
            <div className="space-y-1 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
              {paged.map(({ round, highest, complete }) => {
                const isSelected = round.date === current.date;
                return (
                  <button
                    key={round.date}
                    onClick={() => setSelectedDate(round.date)}
                    className={`flex w-full flex-col gap-1.5 rounded-md border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                        : "border-transparent bg-fraktur-panel text-fraktur-muted hover:border-fraktur-electric/50"
                    }`}
                  >
                    <span>
                      {round.date} · {round.version}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                          complete ? "bg-severity-none text-white" : "bg-fraktur-electric text-white"
                        }`}
                      >
                        {complete ? "Complete" : "Partial"}
                      </span>
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: severityHex(highest) }}
                        title={highest === "None" ? "No findings" : `Highest: ${highest}`}
                        aria-label={highest === "None" ? "No findings" : `Highest severity: ${highest}`}
                      />
                      {round.publiclyDisclosed ? (
                        <span className="rounded-full bg-fraktur-electric px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                          Public
                        </span>
                      ) : (
                        <span className="rounded-full bg-fraktur-border px-1.5 py-0.5 text-[9px] font-semibold uppercase text-fraktur-muted">
                          🔒 Embargoed
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-fraktur-muted">
                Page {page + 1} / {pageCount}
              </span>
              <button
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Column 2 — the wallet "card", same text layout/data/alignment as
            the Home page grid, followed by the selected round's detail. */}
        <div>
          {/* max-w-xl caps this at roughly the same width a card has in the
              Home page's 2-up grid, so the diagram's preserveAspectRatio="none"
              ribbons stretch to the same proportions instead of the whole
              (much wider) page column. */}
          <div className="max-w-xl rounded-xl border border-fraktur-electric/25 bg-fraktur-panel p-5">
            <div className="mb-3 flex items-start gap-3">
              {wallet.iconInitials && (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: wallet.iconColor || "#8a94a3" }}
                  aria-hidden
                >
                  {wallet.iconInitials}
                </span>
              )}
              <div>
                <h1 className="text-lg font-semibold text-fraktur-text">{wallet.name}</h1>
                {wallet.repoUrl && (
                  <a
                    href={wallet.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-fraktur-muted hover:text-fraktur-electric"
                  >
                    Repository ↗
                  </a>
                )}
              </div>
            </div>

            <p className={`mb-3 text-left text-xs ${scanColorClass}`}>{scanLabel}</p>

            <div
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted ? "bg-severity-none text-white" : "bg-fraktur-electric text-white"
              }`}
            >
              <span>{isCompleted ? "✓" : "●"}</span>
              <span>
                {wallet.status} — {wallet.filesAudited}/{wallet.filesSelected} files
              </span>
            </div>

            {/* Diagram reflects the SELECTED round's findings, not the
                wallet's all-time list — this is what "updates on click". */}
            <div className="rounded-lg bg-fraktur-bg p-3">
              <AuditFlowDiagram
                testsRun={wallet.testsRun}
                filesScanned={wallet.filesScanned}
                filesSelected={wallet.filesSelected}
                maxTestsRun={maxTestsRun}
                maxFilesScanned={maxFilesScanned}
                findings={currentEntry.findings}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-fraktur-muted">
                Viewing {formatDate(current.date)} · {current.version}
              </p>
              {current.publiclyDisclosed ? (
                <span className="rounded-full bg-fraktur-electric px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  Public
                </span>
              ) : (
                <span className="rounded-full bg-fraktur-border px-2 py-0.5 text-[10px] font-semibold uppercase text-fraktur-muted">
                  🔒 Embargoed
                </span>
              )}
            </div>

            {current.publiclyDisclosed ? (
              <div className="space-y-2">
                {currentFindings.length === 0 ? (
                  <p className="text-sm text-fraktur-muted">No findings recorded for this round.</p>
                ) : (
                  currentFindings.map((f) => {
                    const statusBadge = findingStatusBadge(f.status);
                    return (
                      <div key={f.id} className="rounded-lg border border-fraktur-border bg-fraktur-panel p-3 text-sm">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityColorClass(f.severity)}`}>
                            {f.severity}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          {f.cwe && <span className="text-xs text-fraktur-muted">{f.cwe}</span>}
                        </div>
                        <p className="text-fraktur-text">{f.title}</p>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-fraktur-border bg-fraktur-panel p-4 text-sm text-fraktur-muted">
                This scan is in responsible disclosure — available{" "}
                {current.disclosureDate ? formatDate(current.disclosureDate) : "once a fix ships"}, not before.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closing CTAs — dual-audience split, given real visual weight. */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-fraktur-electric/30 bg-fraktur-panel p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fraktur-muted">For companies</p>
          <p className="mb-4 text-sm text-fraktur-text">
            Want the complete findings report for {wallet.name} — every file, every finding, no waiting on embargoes?
          </p>
          <a
            href={`/contact?tier=report&wallet=${encodeURIComponent(wallet.name)}`}
            className="inline-block rounded-full bg-fraktur-electric px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fraktur-electricDim"
          >
            Get the full report →
          </a>
        </div>
        <div className="rounded-2xl border border-fraktur-orange/30 bg-fraktur-panel p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fraktur-muted">For everyone else</p>
          <p className="mb-4 text-sm text-fraktur-text">
            Like what FRAKTUR does here? Help fund deeper, faster coverage of {wallet.name}.
          </p>
          <button
            onClick={() => openDonation({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name })}
            className="rounded-full bg-fraktur-orange px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-fraktur-orangeDim"
          >
            Help us go deeper, faster →
          </button>
        </div>
      </div>
    </div>
  );
}
