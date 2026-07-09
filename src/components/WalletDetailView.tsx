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
type SeverityFilter = "All" | Severity | "None";
type SortKey = "recent" | "risk";

const SEVERITY_RANK: Record<Severity, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
const SEVERITY_RANK_WITH_NONE: Record<Severity | "None", number> = { ...SEVERITY_RANK, None: -1 };

const PAGE_SIZE = 12;
const SELECT_CLASS =
  "rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-xs text-fraktur-text focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric";

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
 * exact same text layout/data/alignment as the Home page grid, just
 * standalone — plus the selected round's finding detail on the right.
 * Selecting a round updates the diagram (that round's own files/tests
 * numbers and severity blocks, not the wallet's current totals) and the
 * finding list below it.
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

  const history = useMemo(() => wallet.auditHistory ?? [], [wallet.auditHistory]);

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const roundsWithMeta = useMemo(
    () =>
      history.map((round) => {
        const findings = wallet.findings.filter((f) => round.findingIds.includes(f.id));
        return { round, findings, highest: roundHighestSeverity(findings), complete: roundIsComplete(findings) };
      }),
    [history, wallet.findings]
  );

  const filteredSorted = useMemo(() => {
    const filtered = roundsWithMeta.filter(({ round, highest }) => {
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
      if (severityFilter !== "All" && highest !== severityFilter) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === "risk") return SEVERITY_RANK_WITH_NONE[b.highest] - SEVERITY_RANK_WITH_NONE[a.highest];
      return new Date(b.round.date).getTime() - new Date(a.round.date).getTime();
    });
  }, [roundsWithMeta, periodFilter, severityFilter, sortKey]);

  const pageCount = Math.max(Math.ceil(filteredSorted.length / PAGE_SIZE), 1);
  const paged = filteredSorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (history.length === 0) {
    return <p className="text-sm text-fraktur-muted">No audit rounds recorded for this wallet yet.</p>;
  }

  // Most recent round selected by default (roundsWithMeta preserves the
  // data's own order — sample/Airtable data lists newest first).
  const currentEntry = roundsWithMeta.find((r) => r.round.date === selectedDate) ?? roundsWithMeta[0];
  const current = currentEntry.round;
  const currentFindings = [...currentEntry.findings].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[300px_36rem] lg:items-start">
        {/* Column 1 — audit history: filters, list, pagination. */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-fraktur-text">Audit history</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value as PeriodFilter);
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              <option value="all">All ages</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="year">This year</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as SeverityFilter);
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              <option value="All">All vulnerability types</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="None">Clean</option>
            </select>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={SELECT_CLASS}>
              <option value="recent">Sort: most recent</option>
              <option value="risk">Sort: risk</option>
            </select>
          </div>

          {filteredSorted.length === 0 ? (
            <p className="text-sm text-fraktur-muted">No scans match these filters.</p>
          ) : (
            <div className="space-y-1 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
              {paged.map(({ round, highest, complete }) => {
                const isSelected = round.date === current.date;
                return (
                  <button
                    key={round.date}
                    onClick={() => setSelectedDate(round.date)}
                    className={`flex w-full items-center gap-2 whitespace-nowrap rounded-md border px-2.5 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                        : "border-transparent bg-fraktur-panel text-fraktur-muted hover:border-fraktur-electric/50"
                    }`}
                  >
                    <span className="shrink-0">{round.date}</span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
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
                    <span
                      className="ml-auto shrink-0 text-sm"
                      title={round.publiclyDisclosed ? "Public" : "Embargoed"}
                      aria-label={round.publiclyDisclosed ? "Public" : "Embargoed"}
                    >
                      {round.publiclyDisclosed ? "🔍" : "🔒"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredSorted.length > PAGE_SIZE && (
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
          <div className="rounded-xl border border-fraktur-electric/25 bg-fraktur-panel p-5">
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

            {/* Diagram reflects the SELECTED round's own numbers (files
                scanned/selected, tests run, severity blocks) — this is what
                "updates on click", not the wallet's current-state totals. */}
            <div className="rounded-lg bg-fraktur-bg p-3">
              <AuditFlowDiagram
                testsRun={current.testsRun}
                filesScanned={current.filesScanned}
                filesSelected={current.filesSelected}
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
