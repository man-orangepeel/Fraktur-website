"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Wallet } from "@/lib/types";
import { companiesHref, countBySeverity, highestSeverity, scanLabelFor, severityHex, walletSlug } from "@/lib/format";
import { useDonation } from "./DonationContext";
import { AuditFlowDiagram } from "./AuditFlowDiagram";
import { SeverityBadge } from "./SeverityBadge";

type SortKey = "risk" | "recent";

const RISK_ORDER = ["Critical", "High", "Medium", "Low", "None"];

// Floor so the top bar's risk color is never invisible on a wallet whose
// audit has barely started (e.g. 1/9 files deep-read so far).
const MIN_BAR_PCT = 8;

// Single info trigger for the whole "Fractures" row — replaces the old
// per-badge tooltip (same disclosure-policy paragraph was repeating on
// every colored pill, which was the actual complaint). Hover-intent close:
// leaving the trigger OR the panel starts a short timer instead of closing
// instantly, so crossing the small gap between them doesn't dismiss it.
export function DisclosureInfo({ walletName }: { walletName: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="How we disclose findings"
        className="flex h-4 w-4 items-center justify-center rounded-full text-fraktur-muted hover:text-fraktur-electric focus:outline-none focus:ring-2 focus:ring-fraktur-electric"
      >
        ⓘ
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-fraktur-electric/40 bg-fraktur-panel p-3 text-xs font-normal normal-case leading-relaxed text-fraktur-muted shadow-xl"
        >
          <p>
            Full technical detail on any finding is shared with the{" "}
            <span className="text-fraktur-text">{walletName}</span> team immediately, free of charge. Public
            write-up follows once they ship a fix, or after a 90-day window — never before.
          </p>
          <a href="/legal" className="mt-2 inline-block font-medium text-fraktur-electric hover:underline">
            How we disclose →
          </a>
        </div>
      )}
    </span>
  );
}

export function WalletList({ wallets }: { wallets: Wallet[] }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const { open } = useDonation();

  const filtered = useMemo(() => {
    let list = wallets.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));
    if (riskFilter !== "All") list = list.filter((w) => highestSeverity(w.findings) === riskFilter);

    return [...list].sort((a, b) => {
      if (sortKey === "risk") return RISK_ORDER.indexOf(highestSeverity(a.findings)) - RISK_ORDER.indexOf(highestSeverity(b.findings));
      return new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime();
    });
  }, [wallets, query, riskFilter, sortKey]);

  const maxFilesScanned = useMemo(() => Math.max(...wallets.map((w) => w.filesScanned), 1), [wallets]);

  return (
    // No border/background band (2026-07-11) — sits on the page's own
    // background; the wallet cards inside already do the visual work.
    <section id="wallets">
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold text-fraktur-text">Audited Wallets</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a wallet…"
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text placeholder:text-fraktur-muted focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric"
          />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric"
          >
            <option value="All">All risk levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="None">None (clean)</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric"
          >
            <option value="recent">Sort: last review</option>
            <option value="risk">Sort: risk</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-fraktur-border bg-fraktur-panel px-4 py-6 text-center text-sm text-fraktur-muted">
          No wallet matches &ldquo;{query}&rdquo;{riskFilter !== "All" ? ` at ${riskFilter} risk` : ""}. Try a
          different search or risk filter.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {filtered.map((wallet) => {
          const counts = countBySeverity(wallet.findings);
          const { label: scanLabel, colorClass: scanColorClass } = scanLabelFor(wallet.lastReviewDate);
          const isCompleted = wallet.status === "Completed";
          const historyHref = `/wallets/${walletSlug(wallet.name)}`;

          // Top bar: color is always the highest severity found so far — a
          // real finding is never hidden because the audit isn't finished.
          // Width is what communicates completeness: full when Completed,
          // proportional to deep-read progress (filesAudited/filesSelected)
          // when In progress, with a visible floor so it never reads as
          // "nothing happening yet" on a wallet 1 file into review.
          const barColor = severityHex(highestSeverity(wallet.findings));
          const barPct = isCompleted
            ? 100
            : wallet.filesSelected > 0
              ? Math.min(100, Math.max((wallet.filesAudited / wallet.filesSelected) * 100, MIN_BAR_PCT))
              : 100;

          return (
            <article
              key={wallet.id}
              className="relative overflow-hidden rounded-xl border-b border-l border-r bg-fraktur-panel"
              style={{ borderColor: barColor }}
            >
              {/* 0. Top bar — risk color + completeness, at a glance, before
                  any text needs reading. The other 3 sides pick up the same
                  color (full strength, thin, not proportional like the bar)
                  so the whole card reads as one delimited object instead of
                  a colored line floating over a generic gray frame. */}
              <div className="h-1.5 w-full bg-fraktur-border" role="img" aria-label={`${isCompleted ? "Completed" : "In progress"} audit, highest severity: ${highestSeverity(wallet.findings)}`}>
                <div className="h-full rounded-r-full" style={{ width: `${barPct}%`, backgroundColor: barColor }} />
              </div>

              <div className="p-5">
                {/* 1. Header — icon + name, links to this wallet's audit
                    history (not the repo — see the "Repository ↗" link on
                    that page instead). */}
                <Link href={historyHref} className="mb-3 flex items-center gap-3 hover:opacity-80">
                  {wallet.iconInitials && (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: wallet.iconColor || "#8a94a3" }}
                      aria-hidden
                    >
                      {wallet.iconInitials}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-fraktur-text">{wallet.name}</h3>
                </Link>

                {/* 2. Fractures — the primary signal, right under the name.
                    No longer clickable: this is a summary, not a control —
                    the header and footer already cover navigation to the
                    same history page. */}
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fraktur-muted">
                    <span>Fractures</span>
                    <DisclosureInfo walletName={wallet.name} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(["Critical", "High", "Medium", "Low"] as const).map((sev) =>
                      counts[sev] > 0 ? <SeverityBadge key={sev} severity={sev} count={counts[sev]} /> : null
                    )}
                    {wallet.findings.length === 0 && (
                      <span className="rounded-full bg-severity-none px-2 py-0.5 font-medium text-white">0 findings</span>
                    )}
                  </div>
                </div>

                {/* 3. Status — off-white text (2026-07-10: was
                    severity-colored, which read as "too much color" once the
                    top bar + border already carry the risk signal). Right
                    under Fractures, before the scan date (2026-07-10 reorder
                    — completeness reads as more important than the date). */}
                <p className="mb-1.5 text-xs font-medium text-fraktur-text">
                  {isCompleted ? "✓" : "●"} {wallet.status} — {wallet.filesAudited}/{wallet.filesSelected} files
                </p>

                {/* 4. Scan date — plain colored text (not a pill, a date
                    isn't a verdict), 3-tier freshness. Not a link (2026-07-10):
                    the header and footer already cover navigation to history,
                    this line is read-only detail. */}
                <p className={`mb-3 text-left text-xs ${scanColorClass}`}>{scanLabel}</p>

                {/* 5. Audit flow diagram — graphic detail, last before the CTAs. */}
                <div className="mb-4 rounded-lg bg-fraktur-bg p-3">
                  <AuditFlowDiagram
                    filesScanned={wallet.filesScanned}
                    filesSelected={wallet.filesSelected}
                    maxFilesScanned={maxFilesScanned}
                    findings={wallet.findings}
                  />
                </div>

                {/* Footer — "Details" on the left, existing CTAs kept on the right. */}
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={historyHref}
                    className="text-xs font-semibold text-fraktur-text hover:text-fraktur-electric hover:underline"
                  >
                    Details →
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => open({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name })}
                      className="text-xs text-fraktur-orange hover:underline"
                    >
                      Help us go deeper, faster →
                    </button>
                    <Link href={companiesHref(wallet)} className="text-xs text-fraktur-electric hover:underline">
                      For Companies →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
    </section>
  );
}
