"use client";

import { useMemo, useState } from "react";
import type { Wallet } from "@/lib/types";
import { severityColorClass, countBySeverity } from "@/lib/format";
import { useDonation } from "./DonationContext";
import { AuditFlowDiagram } from "./AuditFlowDiagram";

type SortKey = "status" | "risk" | "recent";

const RISK_ORDER = ["Critical", "High", "Medium-High", "Medium", "Low", "None"];

export function WalletList({ wallets }: { wallets: Wallet[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const { open } = useDonation();

  const filtered = useMemo(() => {
    let list = wallets.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));
    if (statusFilter !== "All") list = list.filter((w) => w.status === statusFilter);

    return [...list].sort((a, b) => {
      if (sortKey === "status") return a.status.localeCompare(b.status);
      if (sortKey === "risk") return RISK_ORDER.indexOf(a.riskBadge) - RISK_ORDER.indexOf(b.riskBadge);
      return new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime();
    });
  }, [wallets, query, statusFilter, sortKey]);

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
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text placeholder:text-fraktur-muted"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text"
          >
            <option>All</option>
            <option>Monitoring</option>
            <option>Audit in progress</option>
            <option>Completed</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-fraktur-text"
          >
            <option value="recent">Sort: last review</option>
            <option value="risk">Sort: risk</option>
            <option value="status">Sort: status</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((wallet) => {
          const counts = countBySeverity(wallet.findings);
          return (
            <article key={wallet.id} className="rounded-xl border border-fraktur-border bg-fraktur-panel p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-fraktur-text">{wallet.name}</h3>
                  {wallet.repoUrl && (
                    <a href={wallet.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-fraktur-muted hover:text-fraktur-orange">
                      Repository ↗
                    </a>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityColorClass(wallet.riskBadge)}`}>
                  {wallet.riskBadge}
                </span>
              </div>

              <dl className="mb-4 grid grid-cols-2 gap-y-1 text-xs text-fraktur-muted">
                <dt>Status</dt>
                <dd className="text-right text-fraktur-text">{wallet.status}</dd>
                <dt>Last review</dt>
                <dd className="text-right text-fraktur-text">{wallet.lastReviewDate}</dd>
                <dt>Audit tool</dt>
                <dd className="text-right text-fraktur-text">{wallet.auditToolVersion}</dd>
                {wallet.otsHash && (
                  <>
                    <dt>OpenTimestamp</dt>
                    <dd className="text-right">
                      <a href={wallet.otsProofUrl || "#"} target="_blank" rel="noreferrer" className="text-fraktur-orange hover:underline">
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
                  riskBadge={wallet.riskBadge}
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {(["Critical", "High", "Medium-High", "Medium", "Low"] as const).map((sev) =>
                  counts[sev] > 0 ? (
                    <span key={sev} className={`rounded-full px-2 py-0.5 font-medium ${severityColorClass(sev)}`}>
                      {counts[sev]} {sev}
                    </span>
                  ) : null
                )}
                {wallet.findings.length === 0 && (
                  <span className="rounded-full bg-risk-low px-2 py-0.5 font-medium text-white">0 findings</span>
                )}
              </div>

              <button
                onClick={() => open({ allocationChoice: "Specific Wallet", walletId: wallet.id, walletName: wallet.name })}
                className="text-sm font-medium text-fraktur-orange hover:underline"
              >
                Suggest this wallet gets deeper coverage →
              </button>
            </article>
          );
        })}
      </div>
    </div>
    </section>
  );
}
