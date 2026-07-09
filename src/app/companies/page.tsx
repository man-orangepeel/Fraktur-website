import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { AuditFlowDiagram } from "@/components/AuditFlowDiagram";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CompareBars, FindingsCard } from "@/components/ProofVisual";
import { getWallets } from "@/lib/data";
import { countBySeverity } from "@/lib/format";

export const revalidate = 60;

/**
 * v2 — ground-up rebuild, deliberately not the v1-v9 full-viewport "slide
 * deck" layout (Hero.tsx / Slide.tsx / ShardArt.tsx are no longer used on
 * this page). Founder's brief: know the product, know the buyer (CTO/VP Eng,
 * 5-50 person Bitcoin company, no dedicated security hire), detach
 * completely from what existed, build the best B2B page from there.
 *
 * Structural change that matters most: this is now a conventional, scannable
 * B2B SaaS page (compact sections, grids, a real product preview in the
 * hero) instead of one-idea-per-full-screen forced scrolling. A CTO
 * evaluating a security vendor wants to scan the whole page in under a
 * minute, not scroll through nine acts of a pitch deck. See
 * WEBSITE_BRIEF.md §18 for the full rationale.
 */

const TIERS = [
  {
    id: "reverify",
    name: "Targeted re-verification",
    price: "Smallest, fastest",
    description:
      "Fixed something we flagged? We re-scan exactly that area and re-stamp it — FRAKTUR-verified, not just team-declared.",
    cta: "Request re-verification",
    subject: "Targeted re-verification request",
  },
  {
    id: "report",
    name: "Complete Findings Report",
    price: "One-time, no commitment",
    description:
      "Your whole repo triaged at Layer 1, every high-risk file flagged (and why), every Layer 2 finding with a working proof-of-concept. Not a line-by-line audit of everything.",
    cta: "Get the report",
    subject: "Complete Findings Report request",
  },
  {
    id: "subscribe",
    name: "Continuous coverage",
    price: "$2K–4K / month",
    description:
      "Every commit triaged at Layer 1 in full, every high-risk file re-audited at Layer 2, ongoing. The tier that keeps your Wallet Watcher badge fresh instead of aging.",
    cta: "Start a subscription",
    subject: "Subscription request",
  },
] as const;

function contextForReason(reason?: string) {
  switch (reason) {
    case "stale":
      return { highlight: "subscribe", banner: "A subscription is what keeps your badge from going stale again." };
    case "declared-fixed":
      return { highlight: "reverify", banner: "Get that fix FRAKTUR-verified, not just self-reported." };
    default:
      return { highlight: "report", banner: "Get every current finding, once, no subscription needed." };
  }
}

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
    a: "Layer 1 (fuzz) + Layer 2 (Selective Loupe) are the core product today, not a roadmap slide. We sell what exists — see the proof below.",
  },
  {
    q: "What if the bug is in the code you didn't review?",
    a: "Nobody claims 100% — that's exactly why every wallet's progress (files audited / files selected) is public on the Wallet Watcher, not asserted in a PDF you can't check.",
  },
  {
    q: "Will you publish our vulnerabilities publicly before we can fix them?",
    a: "No. You get full technical detail — exact file, function, PoC — immediately and for free, always. The public post states that a finding happened and its severity, never exploit-level detail, until you've shipped a fix (or a 90-day embargo expires). Same disclosure model CVEs and Bitcoin Core use.",
  },
  {
    q: "What's the difference between the free Public Disclosure Report and these paid tiers?",
    a: "The Public Disclosure Report — a specific finding, made public once it's fixed or its 90-day embargo lapses — is always free on the Wallet Watcher. These three tiers are for complete, current, or ongoing coverage, not for information already owed to you for free.",
  },
];

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { wallet?: string; reason?: string };
}) {
  const wallets = await getWallets();
  const walletName = searchParams?.wallet;
  const { highlight, banner } = contextForReason(searchParams?.reason);

  // Hero preview — pulls a real entry straight from the live Wallet Watcher
  // (Home page) instead of hand-authored mock numbers, so the hero shows
  // actual proof rather than an illustrative placeholder. See
  // WEBSITE_BRIEF.md §18 (revision note).
  const heroWallet = wallets.find((w) => w.id === "wallet-rowan-01") ?? wallets[0];
  const heroCounts = heroWallet ? countBySeverity(heroWallet.findings) : null;

  return (
    <>
      <Header variant="companies" />

      <main>
        {/* ---------------------------------------------------------------- HERO */}
        <section className="border-b border-fraktur-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">
                For Bitcoin companies without a full time security team
              </p>
              <h1 className="font-display text-4xl font-medium leading-[1.1] text-fraktur-text sm:text-5xl">
                You can&rsquo;t hire a dedicated security team.
                <br />
                You can still ship like one exists.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-fraktur-muted">
                FRAKTUR runs your code instead of just reading it — Bitcoin-native AI, triaged by real attack
                simulation, every finding proof-backed and verified on-chain.
              </p>

              {/* Trust bar — moved directly under the pitch line it supports,
                  and rebuilt as discrete badges (the inline dot-separated
                  version was illegible/cramped at most widths). */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Built on Loupe (Spiral / Block)",
                  "Bitcoin-aware: BIPs · BOLTs · NUTs · BLIPs",
                  "No PoC, no report",
                  "OpenTimestamp-verified",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border-2 border-fraktur-electric/50 bg-fraktur-panel px-3 py-1.5 text-xs text-fraktur-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/apply"
                  className="rounded-full bg-fraktur-orange px-6 py-3 text-sm font-semibold text-black transition hover:bg-fraktur-orangeDim"
                >
                  Apply for a free scan →
                </a>
                <a
                  href="#pricing"
                  className="rounded-full border border-fraktur-border px-6 py-3 text-sm font-semibold text-fraktur-text transition hover:border-fraktur-electric"
                >
                  See pricing
                </a>
              </div>
            </div>

            {/* Real product preview — one live entry pulled straight from the
                Wallet Watcher (Home page), rendered through the exact same
                components (AuditFlowDiagram, SeverityBadge). Proof, not a
                mockup — matches the page's own "Proof, not promises" framing
                below. */}
            {heroWallet && heroCounts && (
              <article className="rounded-xl border border-fraktur-electric/25 bg-fraktur-panel p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {heroWallet.iconInitials && (
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: heroWallet.iconColor || "#8a94a3" }}
                        aria-hidden
                      >
                        {heroWallet.iconInitials}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-fraktur-text">{heroWallet.name}</h3>
                  </div>
                </div>

                <dl className="mb-4 grid grid-cols-2 gap-y-1 text-xs text-fraktur-muted">
                  <dt>Status</dt>
                  <dd className="text-right text-fraktur-text">{heroWallet.status}</dd>
                  <dt>Last review</dt>
                  <dd className="text-right text-fraktur-text">
                    {new Date(heroWallet.lastReviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </dd>
                  <dt>fraKtur</dt>
                  <dd className="text-right text-fraktur-text">{heroWallet.auditToolVersion}</dd>
                </dl>

                <div className="mb-3 rounded-lg bg-fraktur-bg p-3">
                  <AuditFlowDiagram
                    testsRun={heroWallet.testsRun}
                    filesScanned={heroWallet.filesScanned}
                    filesSelected={heroWallet.filesSelected}
                    filesAudited={heroWallet.filesAudited}
                    maxTestsRun={heroWallet.testsRun || 1}
                    maxFilesScanned={heroWallet.filesScanned}
                    findings={heroWallet.findings}
                  />
                </div>

                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  {(["Critical", "High", "Medium", "Low"] as const).map((sev) =>
                    heroCounts[sev] > 0 ? <SeverityBadge key={sev} severity={sev} count={heroCounts[sev]} /> : null
                  )}
                </div>

                <p className="mt-3 text-xs text-fraktur-muted">
                  One live entry from our Wallet Watcher — not a mockup.{" "}
                  <Link href="/#wallets" className="text-fraktur-electric hover:underline">
                    See all wallets →
                  </Link>
                </p>
              </article>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- PROBLEM */}
        <section id="problem" className="scroll-mt-28 border-b border-fraktur-border py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">The problem</p>
            <h2 className="mb-3 max-w-2xl font-display text-3xl text-fraktur-text sm:text-4xl">
              Whatever you&rsquo;re doing today, it doesn&rsquo;t feel like enough.
            </h2>
            <p className="mb-10 max-w-2xl text-sm text-fraktur-muted">
              A full audit is out of reach for most teams. FRAKTUR covers the files that actually matter — with
              Bitcoin-native AI — for a fraction of the cost.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6">
                <p className="font-display text-3xl text-fraktur-text">$755M lost</p>
                <p className="mt-1 text-sm text-fraktur-electric">since April 2026</p>
                <p className="mt-3 text-sm text-fraktur-muted">
                  83+ exploits. No undo, no chargeback, no refund — a single bug is permanent, unrecoverable loss.
                </p>
              </div>
              <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6">
                <p className="font-display text-3xl text-fraktur-text">$50–200K</p>
                <p className="mt-1 text-sm text-fraktur-electric">and stale tomorrow</p>
                <p className="mt-3 text-sm text-fraktur-muted">
                  Formal audits are slow and expensive, and cover a snapshot. The next commit ships unaudited.
                </p>
              </div>
              <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6">
                <p className="font-display text-3xl text-fraktur-text">Reads, doesn&rsquo;t run</p>
                <p className="mt-1 text-sm text-fraktur-electric">static tools miss runtime bugs</p>
                <p className="mt-3 text-sm text-fraktur-muted">
                  Even Bitcoin-aware scanners like Loupe stop at reading the code. Attacks happen when it runs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- HOW IT WORKS */}
        <section id="solution" className="scroll-mt-28 border-b border-fraktur-border bg-fraktur-panel py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">How FRAKTUR works</p>
            <h2 className="mb-10 max-w-2xl font-display text-3xl text-fraktur-text sm:text-4xl">Not smaller. Smarter.</h2>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Attack-surface triage",
                  d: "We run your code with random, malformed, adversarial inputs at scale — the same way real attackers probe it. Crash sites map exactly where to look.",
                },
                {
                  n: "02",
                  t: "Selective Loupe",
                  d: "Bitcoin-native AI agents (Claude + Codex cross-verification) audit only what Layer 1 flagged. Every finding ships with a proof-of-concept that fails on HEAD — no PoC, no report.",
                },
                {
                  n: "03",
                  t: "On-chain proof",
                  d: "Every completed audit is hashed and timestamped via OpenTimestamp — verifiable by anyone, forever, independent of us.",
                },
              ].map((step) => (
                <div key={step.n} className="rounded-2xl border border-fraktur-border bg-fraktur-bg p-6">
                  <p className="font-display text-2xl text-fraktur-electric">{step.n}</p>
                  <p className="mt-2 text-lg font-semibold text-fraktur-text">{step.t}</p>
                  <p className="mt-2 text-sm text-fraktur-muted">{step.d}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 max-w-2xl text-sm text-fraktur-muted">
              The pipeline is how we work fast today. The proof is what stays yours — verifiable on-chain,
              independent of any single tool we&rsquo;re built on.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- PROOF */}
        <section id="proof" className="scroll-mt-28 border-b border-fraktur-border py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">Proof, not promises</p>
            <h2 className="mb-2 max-w-2xl font-display text-3xl text-fraktur-text sm:text-4xl">Our first real-world test</h2>
            <p className="mb-10 text-sm text-fraktur-muted">
              For the wallet&rsquo;s repo we audited (name withheld per responsible disclosure norms).
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <CompareBars
                title="L1 — files triaged per scan"
                beforeLabel="Loupe-only (whole codebase)"
                beforeValue={1300}
                afterLabel="FRAKTUR (triaged)"
                afterValue={63}
                result="-95% noise cut"
              />
              <CompareBars
                title="Cost per scan (Claude Opus 4.8, API-equivalent)"
                beforeLabel="Loupe-only (~1,300 agents)"
                beforeValue={3200}
                afterLabel="FRAKTUR (63 triaged files)"
                afterValue={150}
                unit="$"
                result="-95% cost"
              />
              <FindingsCard />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- PRICING */}
        <section id="pricing" className="scroll-mt-28 border-b border-fraktur-border bg-fraktur-panel py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">
              {walletName ? `Checking in about ${walletName}?` : "Pricing"}
            </p>
            <h2 className="mb-2 max-w-2xl font-display text-3xl text-fraktur-text sm:text-4xl">
              Full audits weren&rsquo;t built for you. This is.
            </h2>
            {walletName && <p className="mb-6 text-sm text-fraktur-electric">{banner}</p>}
            {!walletName && (
              <p className="mb-10 max-w-2xl text-sm text-fraktur-muted">
                Three ways to pay, matched to what you actually need — not one subscription-or-nothing choice.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {TIERS.map((tier) => {
                const isHighlighted = walletName && tier.id === highlight;
                return (
                  <div
                    key={tier.id}
                    className={`flex flex-col rounded-2xl border p-6 ${
                      isHighlighted ? "border-fraktur-electric bg-fraktur-electricDim/30" : "border-fraktur-border bg-fraktur-bg"
                    }`}
                  >
                    <p className="font-display text-lg text-fraktur-text">{tier.name}</p>
                    <p className="mt-1 text-sm font-semibold text-fraktur-electric">{tier.price}</p>
                    <p className="mt-3 flex-1 text-sm text-fraktur-muted">{tier.description}</p>
                    <Link
                      href={`/contact?tier=${tier.id}${walletName ? `&wallet=${encodeURIComponent(walletName)}` : ""}`}
                      className={`mt-5 rounded-full px-4 py-2 text-center text-sm font-semibold ${
                        isHighlighted
                          ? "bg-fraktur-orange text-black hover:bg-fraktur-orangeDim"
                          : "border border-fraktur-border text-fraktur-text hover:border-fraktur-orange"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-start gap-2 rounded-2xl border border-fraktur-border bg-fraktur-bg p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm text-fraktur-muted">
                Not ready to pay yet? Apply for a free scan — 5 accepted per month across all applicants, one free
                scan per project ever.
              </p>
              <a
                href="/apply"
                className="shrink-0 rounded-full border border-fraktur-border px-5 py-2 text-sm font-medium text-fraktur-text hover:border-fraktur-orange"
              >
                Apply for a free scan →
              </a>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- FAQ */}
        <section id="faq" className="scroll-mt-28 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">FAQ</p>
            <h2 className="mb-8 font-display text-3xl text-fraktur-text">Key objections</h2>
            <div className="space-y-3">
              {OBJECTIONS.map((o) => (
                <details key={o.q} className="rounded-xl border border-fraktur-border bg-fraktur-panel p-4">
                  <summary className="cursor-pointer font-medium text-fraktur-text">{o.q}</summary>
                  <p className="mt-2 text-sm text-fraktur-muted">{o.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- FINAL CTA */}
        <section className="border-t border-fraktur-border bg-fraktur-panel py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-3xl text-fraktur-text sm:text-4xl">
              Every wallet fractures somewhere. Know where yours does. Now.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="/apply"
                className="rounded-full bg-fraktur-orange px-6 py-3 text-sm font-semibold text-black hover:bg-fraktur-orangeDim"
              >
                Apply for a free scan →
              </a>
              <Link
                href="/contact"
                className="rounded-full border border-fraktur-border px-6 py-3 text-sm font-semibold text-fraktur-text hover:border-fraktur-orange"
              >
                Talk to us
              </Link>
              <Link href="/" className="rounded-full border border-fraktur-border px-6 py-3 text-sm font-semibold text-fraktur-text hover:border-fraktur-electric">
                See the Wallet Watcher
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
    </>
  );
}
