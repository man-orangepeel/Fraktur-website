import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { WalletDetailView } from "@/components/WalletDetailView";
import { getWallets } from "@/lib/data";
import { walletSlug } from "@/lib/format";

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

  const maxTestsRun = Math.max(...wallets.map((w) => w.testsRun ?? 0), 1);
  const maxFilesScanned = Math.max(...wallets.map((w) => w.filesScanned), 1);

  return (
    <>
      <Header variant="home" />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/#wallets" className="mb-6 inline-block text-xs text-fraktur-muted hover:text-fraktur-electric">
          ← Back to Wallet Watcher
        </Link>

        <WalletDetailView wallet={wallet} maxTestsRun={maxTestsRun} maxFilesScanned={maxFilesScanned} />
      </main>

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
