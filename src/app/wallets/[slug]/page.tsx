import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { AuditFlowDiagram } from "@/components/AuditFlowDiagram";
import { WalletHistoryBrowser } from "@/components/WalletHistoryBrowser";
import { getWallets } from "@/lib/data";
import { scanLabelFor, walletSlug } from "@/lib/format";

export const revalidate = 60;

async function findWallet(slug: string) {
  const wallets = await getWallets();
  return { wallets, wallet: wallets.find((w) => walletSlug(w.name) === slug) };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { wallet } = await findWallet(params.slug);
  if (!wallet) return { title: "Wallet not found — FRAKTUR" };
  return {
    title: `${wallet.name} — Audit History | FRAKTUR`,
    description: `Live, on-chain-proven audit history for ${wallet.name}: ${wallet.status.toLowerCase()}, ${wallet.filesAudited}/${wallet.filesSelected} files audited.`,
  };
}

export default async function WalletDetailPage({ params }: { params: { slug: string } }) {
  const { wallets, wallet } = await findWallet(params.slug);
  if (!wallet) notFound();

  const { label: scanLabel, colorClass: scanColorClass } = scanLabelFor(wallet.lastReviewDate);
  const isCompleted = wallet.status === "Completed";
  const maxTestsRun = Math.max(...wallets.map((w) => w.testsRun ?? 0), 1);
  const maxFilesScanned = Math.max(...wallets.map((w) => w.filesScanned), 1);

  return (
    <>
      <Header variant="home" />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/#wallets" className="mb-6 inline-block text-xs text-fraktur-muted hover:text-fraktur-electric">
          ← Back to Wallet Watcher
        </Link>

        {/* Current-state header — full context for someone landing here
            cold from a shared link, not just from the card. */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {wallet.iconInitials && (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: wallet.iconColor || "#8a94a3" }}
                aria-hidden
              >
                {wallet.iconInitials}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-fraktur-text sm:text-3xl">{wallet.name}</h1>
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
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs ${scanColorClass}`}>{scanLabel}</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted ? "bg-severity-none text-white" : "bg-fraktur-electric text-white"
              }`}
            >
              <span>{isCompleted ? "✓" : "●"}</span>
              <span>
                {wallet.status} — {wallet.filesAudited}/{wallet.filesSelected} files
              </span>
            </span>
          </div>
        </div>

        <div className="mb-10 rounded-lg bg-fraktur-panel p-4">
          <AuditFlowDiagram
            testsRun={wallet.testsRun}
            filesScanned={wallet.filesScanned}
            filesSelected={wallet.filesSelected}
            maxTestsRun={maxTestsRun}
            maxFilesScanned={maxFilesScanned}
            findings={wallet.findings}
          />
        </div>

        <h2 className="mb-4 text-lg font-semibold text-fraktur-text">Audit history</h2>
        <WalletHistoryBrowser wallet={wallet} />
      </main>

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
