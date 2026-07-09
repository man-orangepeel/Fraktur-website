"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Wallet } from "@/lib/types";
import { companiesHref, countBySeverity, highestSeverity, scanLabelFor, walletSlug } from "@/lib/format";
import { useDonation } from "./DonationContext";
import { AuditFlowDiagram } from "./AuditFlowDiagram";
import { SeverityBadge } from "./SeverityBadge";

type SortKey = "risk" | "recent";

const RISK_ORDER = ["Critical", "High", "Medium", "Low", "None"];

// Single info trigger for the whole "Fractures" row — replaces the old
// per-badge tooltip (same disclosure-policy paragraph was repeating on
// every colored pill, which was the actual complaint). Hover-intent close:
// leaving the trigger OR the panel starts a short timer instead of closing
// instantly, so crossing the small gap between them doesn't dismiss it.
function DisclosureInfo({ walletName }: { walletName: string }) {
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
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = wallets.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));
    if (riskFilter !== "All") list = list.filter((w) => highestSeverity(w.findings) === riskFilter);

    return [...list].sort((a, b) => {
      if (sortKey === "risk") return RISK_ORDER.indexOf(highestSeverity(a.findings)) - RISK_ORDER.indexOf(highestSeverity(b.findings));
      return new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime();
    });
  }, [wallets, query, riskFilter, sortKey]);

  const maxTestsRun = useMemo(() => Math.max(...wallets.map((w) => w.testsRun ?? 0), 1), [wallets]);
  const maxFilesScanned = useMemo(() => Math.max(...wallets.map((w) => w.filesScanned), 1), [wallets]);

  return (
    <section id="wallets" className="border-b border-fraktur-border bg-fraktur-bg">
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

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((wallet) => {
          const counts = countBySeverity(wallet.findings);
          const { label: scanLabel, colorClass: scanColorClass } = scanLabelFor(wallet.lastReviewDate);
          const isCompleted = wallet.status === "Completed";
          const historyHref = `/wallets/${walletSlug(wallet.name)}`;
          const walletHeader = (
            <>
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
            </>
          );
          return (
            <article key={wallet.id} className="rounded-xl border border-fraktur-electric/25 bg-fraktur-panel p-5">
              {/* 1. Header — icon + name, repo link */}
              <div className="mb-3 flex items-start gap-3">
                {wallet.repoUrl ? (
                  <a
                    href={wallet.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    {walletHeader}
                  </a>
                ) : (
                  <div className="flex items-center gap-3">{walletHeader}</div>
                )}
              </div>

              {/* 2. Fact 1 — scan date, plain text (deliberately not a filled
                  pill — this is a date, not a verdict), colored by
                  freshness, linking straight into the audit history page. */}
              <Link href={historyHref} className={`mb-3 block text-left text-xs hover:underline ${scanColorClass}`}>
                {scanLabel}
              </Link>

              {/* 3. Fact 2 — status + file count, one pill. */}
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

              {/* 4. Audit flow diagram — bridges the compact status (fact 2)
                  and the severity detail (fact 3) below. */}
              <div className="mb-3 rounded-lg bg-fraktur-bg p-3">
                <AuditFlowDiagram
                  testsRun={wallet.testsRun}
                  filesScanned={wallet.filesScanned}
                  filesSelected={wallet.filesSelected}
                  maxTestsRun={maxTestsRun}
                  maxFilesScanned={maxFilesScanned}
                  findings={wallet.findings}
                />
              </div>

              {/* Fact 3 — severity badges, unchanged style. */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fraktur-muted">
                  <span>Fractures</span>
                  <DisclosureInfo walletName={wallet.name} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(["Critical", "High", "Medium", "Low"] as const).map((sev) =>
                    counts[sev] > 0 ? (
                      <SeverityBadge
                        key={sev}
                        severity={sev}
                        count={counts[sev]}
                        onClick={() => router.push(historyHref)}
                      />
                    ) : null
                  )}
                  {wallet.findings.length === 0 && (
                    <span className="rounded-full bg-severity-none px-2 py-0.5 font-medium text-white">0 findings</span>
                  )}
                </div>
              </div>

              {/* Footer — click area matches the text, not the full card width. */}
              <div className="flex justify-end">
                <button
                  onClick={() => open({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name })}
                  className="text-xs text-fraktur-orange hover:underline"
                >
                  Help us go deeper, faster →
                </button>
              </div>
              <div className="mt-1 flex justify-end">
                <Link href={companiesHref(wallet)} className="text-xs text-fraktur-electric hover:underline">
                  For Companies →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
    </section>
  );
}
