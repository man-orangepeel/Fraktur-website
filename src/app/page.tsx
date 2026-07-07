import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TickerBanner } from "@/components/TickerBanner";
import { WalletList } from "@/components/WalletList";
import { SupportersGallery } from "@/components/SupportersGallery";
import { DonationDrawer } from "@/components/DonationDrawer";
import { getWallets, getSupporters, getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [wallets, supporters, settings] = await Promise.all([getWallets(), getSupporters(), getSettings()]);

  return (
    <>
      <Header variant="home" />

      {/* Hero — intentionally minimal. No pitch content lives here; that's
          exclusively on /companies. See WEBSITE_BRIEF.md §2.1. */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h1 className="text-3xl font-semibold text-fraktur-text sm:text-4xl">
          Live, verifiable security scores for Bitcoin wallets.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-fraktur-muted">Audited, timestamped, public.</p>
        <p className="mt-6 text-sm text-fraktur-muted">
          Run a Bitcoin company?{" "}
          <Link href="/companies" className="font-medium text-fraktur-orange hover:underline">
            For Companies →
          </Link>
        </p>
      </section>

      <TickerBanner supporters={supporters} settings={settings} />
      <WalletList wallets={wallets} />
      <SupportersGallery supporters={supporters} settings={settings} />

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
