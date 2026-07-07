import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { getWallets } from "@/lib/data";

export const revalidate = 60;

const PROOF_ROWS = [
  {
    metric: "L1 — Proof of Efficiency: LLM agents launched per scan",
    before: "1,300 files",
    after: "63 files",
    result: "-95% data to be verified",
  },
  {
    metric: "L2 — Proof of Efficacy: files reviewed / findings",
    before: "—",
    after: "6 files reviewed (of 63 selected)",
    result: "5 findings: 2 Medium, 1 Medium-High, 2 Low",
  },
  {
    metric: "Cost per scan (Claude Opus 4.8, $8/$25 per 1M tokens, API-equivalent)",
    before: "~$3.2k (~1,300 agents)",
    after: "~$150–158 (63 triaged files)",
    result: "-95% cost",
  },
];

const OBJECTIONS = [
  {
    q: "Loupe is free — why pay?",
    a: "We sell the managed service + fuzz testing + OpenTimestamp + Wallet Watcher. Loupe requires Linux workers, bubblewrap, Claude/Codex CLI, ops. We sell the outcome, not the tool.",
  },
  {
    q: "AI hallucinates.",
    a: "Every finding requires a PoC regression test that fails on HEAD. No PoC = no report. Architecturally enforced, not a policy promise.",
  },
  {
    q: "Vaporware?",
    a: "Layer 1 (fuzz) + Layer 2 (Selective Loupe) are the core product today, not a roadmap slide. We sell what exists — see the proof numbers above.",
  },
];

export default async function CompaniesPage() {
  const wallets = await getWallets();

  return (
    <>
      <Header variant="companies" />

      {/* Problem — S1–S3 */}
      <section id="problem" className="mx-auto max-w-4xl px-4 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fraktur-orange">The problem</p>
        <h1 className="text-3xl font-semibold text-fraktur-text sm:text-4xl">Bitcoin software is under attack — and losing.</h1>
        <p className="mt-4 text-fraktur-muted">
          Since April 2026, there have been <strong className="text-fraktur-text">83–85 exploits</strong> of crypto
          protocols, for a total loss in the range of <strong className="text-fraktur-text">$755–775 million</strong>. A
          single bug in key handling, transaction signing, or protocol logic means permanent, unrecoverable loss of
          funds. There is no &ldquo;undo&rdquo; in Bitcoin. No customer support. No refund.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-fraktur-border bg-fraktur-panel p-5">
            <h3 className="font-semibold text-fraktur-text">One engineer. Millions at stake.</h3>
            <p className="mt-2 text-sm text-fraktur-muted">
              Companies of 5–50 engineers ship code that protects millions in user funds — with no dedicated security
              hire. Audits are expensive ($50K–$200K), slow, and cover a snapshot. Every commit after that is
              unaudited.
            </p>
          </div>
          <div className="rounded-xl border border-fraktur-border bg-fraktur-panel p-5">
            <h3 className="font-semibold text-fraktur-text">Static eyes. Dynamic threats.</h3>
            <p className="mt-2 text-sm text-fraktur-muted">
              Generic scanners miss Bitcoin-specific logic entirely. Loupe (open-source, Spiral/Block) is a major step
              forward, but it stops at reading the code. It does not run it, stress-test it, or simulate attacks
              against it.
            </p>
          </div>
        </div>
      </section>

      {/* Solution — S4–S6 */}
      <section id="solution" className="border-t border-fraktur-border bg-fraktur-panel py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fraktur-orange">The solution</p>
          <h2 className="text-2xl font-semibold text-fraktur-text sm:text-3xl">
            &ldquo;We don&rsquo;t just read your code. We break it — so attackers can&rsquo;t.&rdquo;
          </h2>
          <p className="mt-4 text-fraktur-muted">
            We run an agentic pipeline that first stress-tests the code dynamically (fuzz testing), then uses those
            results to guide AI static analysis — spending computational budget only where it matters. Every
            confirmed finding is timestamped on-chain. Every audited wallet is published.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-fraktur-border bg-fraktur-bg p-5">
              <h3 className="font-semibold text-fraktur-text">Layer 1 — Attack-surface triage</h3>
              <p className="mt-2 text-sm text-fraktur-muted">
                Executes the codebase dynamically with random, malformed, and adversarial inputs at scale. Identifies
                crash sites and edge cases invisible to static analysis. Fast and cheap — its output tells Layer 2
                exactly where to focus.
              </p>
            </div>
            <div className="rounded-xl border border-fraktur-border bg-fraktur-bg p-5">
              <h3 className="font-semibold text-fraktur-text">Layer 2 — Selective Loupe</h3>
              <p className="mt-2 text-sm text-fraktur-muted">
                Runs Loupe&rsquo;s AI agents (Claude + Codex cross-verification) selectively on the highest-risk areas,
                with full Bitcoin protocol knowledge (BIPs, BOLTs, NUTs, BLIPs). Every suspected vulnerability must
                produce a PoC regression test that fails on HEAD — no PoC, no report.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-fraktur-border bg-fraktur-bg p-5">
            <h3 className="font-semibold text-fraktur-text">OpenTimestamp — on-chain proof of audit</h3>
            <p className="mt-2 text-sm text-fraktur-muted">
              For every completed audit, we hash the tool version, the exact commit audited, and the full report, and
              register it on-chain via the OpenTimestamp protocol. Wallet companies can prove a real audit happened —
              without trusting a third party.{" "}
              <a href="/" className="font-medium text-fraktur-orange hover:underline">
                See it live on the Wallet Watcher →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Proof — first real-world test, exact figures from FRAKTUR.pdf pp.12-14 */}
      <section id="proof" className="mx-auto max-w-4xl px-4 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fraktur-orange">Proof</p>
        <h2 className="text-2xl font-semibold text-fraktur-text sm:text-3xl">Our first real-world test</h2>
        <p className="mt-3 text-sm text-fraktur-muted">
          For the wallet&rsquo;s repo we audited (name withheld per responsible-disclosure norms).
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-fraktur-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-fraktur-panel text-fraktur-muted">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">Loupe-only</th>
                <th className="p-3">FRAKTUR (triaged)</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {PROOF_ROWS.map((row) => (
                <tr key={row.metric} className="border-t border-fraktur-border">
                  <td className="p-3 text-fraktur-text">{row.metric}</td>
                  <td className="p-3 text-fraktur-muted">{row.before}</td>
                  <td className="p-3 text-fraktur-text">{row.after}</td>
                  <td className="p-3 font-medium text-fraktur-orange">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-fraktur-muted">
          Source: our first-test scan deck. Vulnerability breakdown confirmed as 2 Medium, 1 Medium-High, 2 Low (5
          total).
        </p>
      </section>

      {/* Pricing — from Annex A2 Market Size */}
      <section id="pricing" className="border-t border-fraktur-border bg-fraktur-panel py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fraktur-orange">Pricing</p>
          <h2 className="text-2xl font-semibold text-fraktur-text sm:text-3xl">Continuous coverage, not a snapshot.</h2>
          <p className="mt-4 text-fraktur-muted">
            Realistic ACV: <strong className="text-fraktur-text">$24K–48K/year</strong> ($2K–4K/month) for Bitcoin-native
            companies with 5–50 engineers handling funds. Year 1 goal: 5 clients ($120K–240K ARR).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:contact@fraktur.io?subject=Free%20scan%20request"
              className="rounded-full bg-fraktur-orange px-5 py-2.5 font-semibold text-black hover:bg-fraktur-orangeDim"
            >
              Get a free scan of your public repo
            </a>
            <a
              href="mailto:contact@fraktur.io?subject=Talk%20to%20FRAKTUR"
              className="rounded-full border border-fraktur-border px-5 py-2.5 font-semibold text-fraktur-text hover:border-fraktur-orange"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ — Annex A8 */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fraktur-orange">FAQ</p>
        <h2 className="mb-6 text-2xl font-semibold text-fraktur-text sm:text-3xl">Key objections</h2>
        <div className="space-y-4">
          {OBJECTIONS.map((o) => (
            <details key={o.q} className="rounded-xl border border-fraktur-border bg-fraktur-panel p-4">
              <summary className="cursor-pointer font-medium text-fraktur-text">{o.q}</summary>
              <p className="mt-2 text-sm text-fraktur-muted">{o.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
