"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wallet } from "@/lib/types";
import { companiesHref, findingStatusBadge, severityColorClass } from "@/lib/format";
import { useDonation } from "./DonationContext";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function AuditHistoryModal({ wallet, onClose }: { wallet: Wallet; onClose: () => void }) {
  const { open: openDonation } = useDonation();
  const history = useMemo(
    () => [...(wallet.auditHistory ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [wallet.auditHistory]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (history.length === 0) return null;
  const current = history[Math.min(index, history.length - 1)];
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

        {/* Clickable round list — each entry shows its public/embargoed
            state up front, no need to click through to find out. */}
        <div className="mb-4 flex flex-wrap gap-2">
          {history.map((h, i) => (
            <button
              key={h.date}
              onClick={() => setIndex(i)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                i === index
                  ? "border-fraktur-electric bg-fraktur-electric/10 text-fraktur-text"
                  : "border-fraktur-border text-fraktur-muted hover:border-fraktur-electric/50"
              }`}
            >
              {h.date}
              {h.publiclyDisclosed ? (
                <span className="rounded-full bg-fraktur-electric px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                  Public
                </span>
              ) : (
                <span className="rounded-full bg-fraktur-border px-1.5 py-0.5 text-[9px] font-semibold uppercase text-fraktur-muted">
                  🔒 Embargoed
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between text-xs text-fraktur-muted">
          <button
            onClick={() => setIndex((i) => Math.min(i + 1, history.length - 1))}
            disabled={index >= history.length - 1}
            className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
          >
            ← Older
          </button>
          <span>
            {formatDate(current.date)} · {current.version}
          </span>
          <button
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index <= 0}
            className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
          >
            Newer →
          </button>
        </div>

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
            Want the complete findings report for this wallet? → Get the full report
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
