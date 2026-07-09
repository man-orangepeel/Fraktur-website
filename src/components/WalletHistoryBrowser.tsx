"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wallet } from "@/lib/types";
import { findingStatusBadge, severityColorClass } from "@/lib/format";
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

const PAGE_SIZE = 12;

/**
 * The interactive half of the wallet detail page: browse audit rounds,
 * inspect one, and act on it. Laid out as a sidebar list + detail panel
 * (the standard pattern for "browse history, view one" UIs — GitHub's
 * commit list + diff, an email client, a CMS revision log) rather than a
 * single cramped column, since a full page finally has the room for it.
 */
export function WalletHistoryBrowser({ wallet }: { wallet: Wallet }) {
  const { open: openDonation } = useDonation();
  const history = useMemo(
    () => [...(wallet.auditHistory ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [wallet.auditHistory]
  );
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (periodFilter === "all") return history;
    const now = Date.now();
    const thisYear = new Date().getFullYear();
    return history.filter((h) => {
      const d = new Date(h.date);
      if (periodFilter === "year") return d.getFullYear() === thisYear;
      const days = (now - d.getTime()) / 86_400_000;
      if (periodFilter === "30d") return days <= 30;
      if (periodFilter === "90d") return days <= 90;
      return true;
    });
  }, [history, periodFilter]);

  const pageCount = Math.max(Math.ceil(filteredHistory.length / PAGE_SIZE), 1);
  const pagedHistory = filteredHistory.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [periodFilter]);

  if (history.length === 0) {
    return <p className="text-sm text-fraktur-muted">No audit rounds recorded for this wallet yet.</p>;
  }

  const current = history.find((h) => h.date === selectedDate) ?? history[0];
  const findings = wallet.findings.filter((f) => current.findingIds.includes(f.id));

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar — filter + round list + pagination */}
        <div>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setPeriodFilter(f)}
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

          {filteredHistory.length === 0 ? (
            <p className="text-sm text-fraktur-muted">No scans in this period.</p>
          ) : (
            <div className="space-y-1 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
              {pagedHistory.map((h) => {
                const isSelected = h.date === current.date;
                return (
                  <button
                    key={h.date}
                    onClick={() => setSelectedDate(h.date)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                        : "border-transparent bg-fraktur-panel text-fraktur-muted hover:border-fraktur-electric/50"
                    }`}
                  >
                    <span>
                      {h.date} · {h.version}
                    </span>
                    {h.publiclyDisclosed ? (
                      <span className="shrink-0 rounded-full bg-fraktur-electric px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                        Public
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-fraktur-border px-1.5 py-0.5 text-[9px] font-semibold uppercase text-fraktur-muted">
                        🔒 Embargoed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {filteredHistory.length > PAGE_SIZE && (
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

        {/* Detail panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-fraktur-muted">
                {formatDate(current.date)} · {current.version}
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
                {findings.length === 0 ? (
                  <p className="text-sm text-fraktur-muted">No findings recorded for this round.</p>
                ) : (
                  findings.map((f) => {
                    const statusBadge = findingStatusBadge(f.status);
                    return (
                      <div key={f.id} className="rounded-lg bg-fraktur-bg p-3 text-sm">
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
              <div className="rounded-lg bg-fraktur-bg p-4 text-sm text-fraktur-muted">
                This scan is in responsible disclosure — available{" "}
                {current.disclosureDate ? formatDate(current.disclosureDate) : "once a fix ships"}, not before.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closing CTAs — same dual-audience split used on the wallet card,
          given real visual weight now that there's room for it. */}
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
