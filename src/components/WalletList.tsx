"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Wallet } from "@/lib/types";
import { countBySeverity } from "@/lib/format";
import { useDonation } from "./DonationContext";
import { AuditFlowDiagram } from "./AuditFlowDiagram";
import { SeverityBadge } from "./SeverityBadge";

type SortKey = "risk" | "recent";

const RISK_ORDER = ["Critical", "High", "Medium", "Low", "None"];

export function WalletList({ wallets }: { wallets: Wallet[] }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const { open } = useDonation();

  const filtered = useMemo(() => {
    let list = wallets.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));
    if (riskFilter !== "All") list = list.filter((w) => w.riskBadge === riskFilter);

    return [...list].sort((a, b) => {
      if (sortKey === "risk") return RISK_ORDER.indexOf(a.riskBadge) - RISK_ORDER.indexOf(b.riskBadge);
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

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((wallet) => {
          const counts = countBySeverity(wallet.findings);
          const daysSinceReview = (Date.now() - new Date(wallet.lastReviewDate).getTime()) / 86_400_000;
          const isStale = daysSinceReview > 30;
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

              <dl className="mb-4 grid grid-cols-2 gap-y-1 text-xs text-fraktur-muted">
                <dt>Status</dt>
                <dd className="text-right text-fraktur-text">{wallet.status}</dd>
                <dt>Last review</dt>
                <dd className="text-right text-fraktur-text">
                  {wallet.lastReviewDate}
                  {isStale && (
                    <span
                      className="ml-1 cursor-help text-fraktur-orange"
                      title={`No review in over 30 days (last: ${wallet.lastReviewDate})`}
                    >
                      ⓘ
                    </span>
                  )}
                </dd>
                <dt>Audit tool</dt>
                <dd className="text-right text-fraktur-text">{wallet.auditToolVersion}</dd>
                {wallet.otsHash && (
                  <>
                    <dt>OpenTimestamp</dt>
                    <dd className="text-right">
                      <a href={wallet.otsProofUrl || "#"} target="_blank" rel="noreferrer" className="text-fraktur-electric hover:underline">
                        Verify ↗
                      </a>
                    </dd>
                  </>
                )}
              </dl>

              <div className="mb-3 rounded-lg bg-fraktur-bg p-3">
                <AuditFlowDiagram
                  testsRun={wallet.testsRun}
                  filesScanned={wallet.filesScanned}
                  filesSelected={wallet.filesSelected}
                  filesAudited={wallet.filesAudited}
                  maxTestsRun={maxTestsRun}
                  maxFilesScanned={maxFilesScanned}
                  findings={wallet.findings}
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {(["Critical", "High", "Medium", "Low"] as const).map((sev) =>
                  counts[sev] > 0 ? (
                    <SeverityBadge key={sev} severity={sev} count={counts[sev]} walletName={wallet.name} />
                  ) : null
                )}
                {wallet.findings.length === 0 && (
                  <span className="rounded-full bg-severity-none px-2 py-0.5 font-medium text-white">0 findings</span>
                )}
              </div>

              <button
                onClick={() => open({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name })}
                className="block text-sm font-medium text-fraktur-orange hover:underline"
              >
                Go deeper →
              </button>
              <Link
                href="/companies"
                className="mt-2 block text-xs text-fraktur-muted hover:text-fraktur-electric"
              >
                Is this your wallet? Get continuous coverage of every file, every commit →{" "}
                <span className="font-medium text-fraktur-electric">For Companies</span>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
    </section>
  );
}
