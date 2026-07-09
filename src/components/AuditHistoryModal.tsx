"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wallet } from "@/lib/types";
import { companiesHref, findingStatusBadge, severityColorClass } from "@/lib/format";
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

export function AuditHistoryModal({ wallet, onClose }: { wallet: Wallet; onClose: () => void }) {
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (history.length === 0) return null;
  const current = history.find((h) => h.date === selectedDate) ?? history[0];
  const findings = wallet.findings.filter((f) => current.findingIds.includes(f.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />

      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-fraktur-electric/30 bg-fraktur-panel p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-fraktur-muted">Audit history</p>
            <h3 className="text-lg font-semibold text-fraktur-text">{wallet.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-fraktur-muted hover:text-fraktur-text focus:outline-none focus:ring-2 focus:ring-fraktur-electric"
          >
            ✕
          </button>
        </div>

        {/* Period filter chips */}
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

        {/* Capped-height scrollable list — same pattern as the wallet
            picker in DonationDrawer.tsx, sized for this content. */}
        {filteredHistory.length === 0 ? (
          <p className="mb-4 text-sm text-fraktur-muted">No scans in this period.</p>
        ) : (
          <div className="mb-3 max-h-64 space-y-1 overflow-y-auto pr-1">
            {pagedHistory.map((h) => {
              const isSelected = h.date === current.date;
              return (
                <button
                  key={h.date}
                  onClick={() => setSelectedDate(h.date)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs transition ${
                    isSelected
                      ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                      : "border-transparent bg-fraktur-bg text-fraktur-muted hover:border-fraktur-electric/50"
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

        {/* Prev/Next pagination — same pattern as SupportersGallery.tsx. */}
        {filteredHistory.length > PAGE_SIZE && (
          <div className="mb-4 flex items-center gap-3 text-sm">
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

        <p className="mb-3 text-xs text-fraktur-muted">
          Viewing: {formatDate(current.date)} · {current.version}
        </p>

        {current.publiclyDisclosed ? (
          <div className="mb-5 space-y-2">
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
          <div className="mb-5 rounded-lg bg-fraktur-bg p-4 text-sm text-fraktur-muted">
            This scan is in responsible disclosure — available{" "}
            {current.disclosureDate ? formatDate(current.disclosureDate) : "once a fix ships"}, not before.
          </div>
        )}

        <div className="space-y-2 border-t border-fraktur-border pt-4">
          <a
            href={companiesHref(wallet, "report")}
            className="block text-sm font-medium text-fraktur-electric hover:underline"
          >
            Get the full report →
          </a>
          <button
            onClick={() => {
              onClose();
              openDonation({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name });
            }}
            className="block text-sm font-medium text-fraktur-orange hover:underline"
          >
            Help us go deeper, faster →
          </button>
        </div>
      </div>
    </div>
  );
}
