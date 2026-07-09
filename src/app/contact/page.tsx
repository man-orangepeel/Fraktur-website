import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { ContactForm } from "@/components/ContactForm";
import { getWallets } from "@/lib/data";

export const revalidate = 60;

/**
 * The single destination for every "talk to us / buy a tier" CTA on
 * /companies — replaces the bare mailto: links that used to sit behind the
 * pricing tiers and the final "Talk to us" button. See WEBSITE_BRIEF.md §19
 * (forms rationalization) for why: mailto left zero record of interest and
 * was a second, inconsistent backend next to the Airtable-backed
 * /apply and donation forms. This one posts to /api/contact -> Leads table,
 * same graceful-fallback shape as the other two forms.
 *
 * `?tier=` and `?wallet=` (set by the Companies page links and the wallet
 * audit-history modal) prefill context without forcing a choice — both
 * remain editable.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams?: { tier?: string; wallet?: string };
}) {
  const wallets = await getWallets();

  return (
    <>
      <Header variant="companies" />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <ContactForm wallets={wallets} initialTier={searchParams?.tier} preselectedWallet={searchParams?.wallet} />
      </main>

      <Footer />
      <DonationDrawer walletOptions={[]} />
    </>
  );
}
