import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WalletList } from "@/components/WalletList";
import { SupportersGallery } from "@/components/SupportersGallery";
import { DonationDrawer } from "@/components/DonationDrawer";
import { getWallets, getSupporters } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [wallets, supporters] = await Promise.all([getWallets(), getSupporters()]);

  return (
    <>
      <Header variant="home" supporters={supporters} />

      {/* Hero — intentionally minimal, no card/band, just sits on the page's
          own background. No pitch content lives here; that's exclusively on
          /companies. See WEBSITE_BRIEF.md §2.1. */}
      <div className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h1 className="text-3xl font-semibold text-fraktur-text sm:text-4xl">
          Bitcoin-native AI, aimed at what actually breaks.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-fraktur-muted">
          Bound to this wallet, this version, this date — proven on-chain, not just claimed.
        </p>
        <p className="mt-6 text-sm text-fraktur-muted">
          <Link href="/companies" className="font-medium text-fraktur-electric hover:underline">
            For Companies →
          </Link>
        </p>
      </div>

      <WalletList wallets={wallets} />

      {/* What FRAKTUR does — factual, sellable, gives context to the wallet
          cards just above it. Not a pitch (that's /companies): trust-framed,
          no $/cost framing, per WEBSITE_BRIEF.md §26 — the Home audience
          isn't a buyer.
          2026-07-11: rebuilt as a contained rounded card (matching the
          wallet cards / Companies "Proof" boxes) instead of a full-bleed
          band — edge-to-edge stripes stacked down the page read as one
          undifferentiated mass, especially once this and "the Kast" shared
          the same treatment. A card sitting on the page's own background
          reads as one deliberate callout instead of another layer. */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-fraktur-electric/40 bg-fraktur-electric/10 p-8 shadow-2xl shadow-black/30 sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">
            What FRAKTUR does
          </p>
          <h2 className="mb-6 font-display text-2xl text-fraktur-text sm:text-3xl">
            We run Bitcoin wallets against real attacks.
            <br />
            Not just read the code.
          </h2>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <p className="text-sm text-fraktur-muted">
              Every wallet above goes through the same funnel: automated attacks at scale, a real run under
              adversarial network conditions, then a narrow, AI-guided deep read of only what still looks risky.
              Each wallet&rsquo;s card shows exactly how many files that funnel covered, and what it found.
              Nothing gets reported until it&rsquo;s been replayed and actually triggered.
            </p>

            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="font-display text-3xl text-fraktur-text">1,334→7</p>
                  <p className="mt-1 text-xs text-fraktur-muted">files, after triage</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-fraktur-electric">6</p>
                  <p className="mt-1 text-xs text-fraktur-muted">confirmed findings</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-fraktur-text">0</p>
                  <p className="mt-1 text-xs text-fraktur-muted">guesses reported</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SupportersGallery supporters={supporters} />

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
