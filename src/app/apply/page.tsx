import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { ApplyForm } from "@/components/ApplyForm";
import { getWallets } from "@/lib/data";

export const revalidate = 60;

export default async function ApplyPage({ searchParams }: { searchParams?: { wallet?: string } }) {
  const wallets = await getWallets();

  return (
    <>
      <Header variant="companies" />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">Apply</p>
        <h1 className="mb-4 font-display text-3xl text-fraktur-text sm:text-4xl">Apply for a free scan.</h1>
        <p className="mb-8 text-fraktur-muted">
          This is a queue, not an instant trigger. We review every application — submitting doesn&rsquo;t start a
          scan.
        </p>

        {/* The rules, restated in full — this block is the actual point of
            the form, not a footnote. */}
        <div className="mb-10 space-y-3 rounded-2xl border border-fraktur-border bg-fraktur-panel p-5 text-sm text-fraktur-muted">
          <p className="font-semibold text-fraktur-text">How this works</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="text-fraktur-text">We accept at most 5 free scans per month, across every applicant
              combined</span> — not 5 per company. We choose which applications to accept; this isn&rsquo;t
              first-come-first-served, and applying isn&rsquo;t a guarantee we&rsquo;ll pick yours, or a promise of a
              specific timeline. Not picked this round? Your application stays in the queue for the next one — no
              need to resubmit.
            </li>
            <li>
              <span className="text-fraktur-text">One free scan per project, ever.</span> If your project has already
              received a free scan from us, it isn&rsquo;t eligible for another one — the{" "}
              <a href="/companies#pricing" className="text-fraktur-electric hover:underline">
                Complete Findings Report or a subscription
              </a>{" "}
              are the path after that, not a second free round.
            </li>
            <li>
              <span className="text-fraktur-text">What&rsquo;s included:</span> a full Layer 1 triage of your entire
              repo (every file), plus <span className="text-fraktur-text">one</span> finding disclosed to your team
              in full — exact file, function, and a working proof-of-concept — immediately and free.
            </li>
            <li>
              <span className="text-fraktur-text">What&rsquo;s not included:</span> the rest of what Layer 1 flags
              beyond that one finding — same reports/subscription as above.
            </li>
            <li>
              Our{" "}
              <a href="/legal" className="text-fraktur-electric hover:underline">
                disclosure policy
              </a>{" "}
              applies as normal: your team always gets full detail immediately; anything made public is limited to
              existence + severity until you&rsquo;ve shipped a fix or a 90-day embargo lapses.
            </li>
          </ul>
        </div>

        <ApplyForm wallets={wallets} preselectedWallet={searchParams?.wallet} />
      </main>

      <Footer />
      <DonationDrawer walletOptions={[]} />
    </>
  );
}
