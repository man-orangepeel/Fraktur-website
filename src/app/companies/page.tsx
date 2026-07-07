import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
import { Hero } from "@/components/Hero";
import { Slide } from "@/components/Slide";
import { ShardArt } from "@/components/ShardArt";
import { CompareBars, FindingsCard } from "@/components/ProofVisual";
import { getWallets } from "@/lib/data";

export const revalidate = 60;

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
    a: "Layer 1 (fuzz) + Layer 2 (Selective Loupe) are the core product today, not a roadmap slide. We sell what exists — see the proof above.",
  },
  {
    q: "What if the bug is in the code you didn't review?",
    a: "Nobody claims 100% — that's exactly why every wallet's progress (files audited / files selected) is public on the Wallet Watcher, not asserted in a PDF you can't check.",
  },
  {
    q: "Will you publish our vulnerabilities publicly before we can fix them?",
    a: "No. You get full technical detail — exact file, function, PoC — immediately and for free, always. The public post states that a finding happened and its severity, never exploit-level detail, until you've shipped a fix (or a 90-day embargo expires). Same disclosure model CVEs and Bitcoin Core use.",
  },
];

export default async function CompaniesPage() {
  const wallets = await getWallets();

  return (
    <>
      {/* Faint cracked-glass texture, fixed behind every slide — same asset as
          the brand background, tying the split-screen "slide" sections back
          to the rest of the site without competing with the shard art. */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-[0.07]"
        style={{ backgroundImage: "url(/bg-texture.png)" }}
        aria-hidden
      />

      <div className="relative z-10">
        <Header variant="companies" />

        {/* Hero — its own component, not a `Slide` instance (see Hero.tsx for
            the full UX rationale: full-viewport, centered, biggest type on the
            page). Deliberately NOT part of the problem→solution→proof
            narrative below — it's the brand promise, not step 1 of the pitch.
            See WEBSITE_BRIEF.md §14. */}
        <Hero />

      {/* Problem, 3 beats */}
      <Slide
        id="problem"
        headline={<>83 Exploits since April 2026.<br />$755M Lost.<br />No Refund.</>}
        sub="Every one of those dollars is gone for good. Bitcoin has no chargeback, no support ticket, no do-over."
        visual={<ShardArt variant="loss" />}
      />

      <Slide
        headline={<>One Engineer.<br />Millions at Stake.</>}
        sub="1–50 person teams protecting millions in user funds. No dedicated security hire. Audits too slow. Too expensive."
        visual={<ShardArt variant="burden" />}
        visualSide="left"
      />

      <Slide
        headline={<>Static Eyes.<br />Dynamic Threats.</>}
        sub="Generic scanners read code. They don't run it. Attacks happen at runtime. Static analysis alone leaves the door open."
        visual={<ShardArt variant="stillmotion" />}
      />

      {/* The pivot — reframed to resolve a direct wording conflict with the
          Hero ("Cheaper because smarter" vs. an earlier "Not cheaper.
          Concentrated."). "Not smaller. Smarter." kills the unspoken
          objection (cheaper = less thorough) first, then lands on the same
          word the Hero ends on — both statements now close on "smarter,"
          reinforcing the callback instead of just avoiding a contradiction. */}
      <Slide
        id="solution"
        eyebrow="Our answer"
        headline={<>Not smaller.<br />Smarter.</>}
        sub="We don't read less code. We waste less time reading code that never breaks."
        visual={<ShardArt variant="concentration" />}
        visualSide="left"
      />

      {/* Proof, part 1 — Layer 1 concept leads, the measured -95% is the
          supporting visual, not the headline. The concrete Wasabi numbers
          (70+ tests, regtest + mainnet, deterministic-first) are still
          running as of this writing — this slide states the mechanism, which
          doesn't change once real numbers are ready to swap in. */}
      <Slide
        id="proof"
        eyebrow="How we're different from a full audit — Layer 1"
        headline={<>1,000 Attackers.<br />Automated.</>}
        sub="Random, malformed, adversarial inputs at scale — the same way real attackers probe a system, just automated. Crash sites map the risk landscape and tell Layer 2 exactly where to look."
        visual={
          <CompareBars
            title="L1 — LLM agents launched per scan (first test)"
            beforeLabel="Loupe-only (whole codebase)"
            beforeValue={1300}
            afterLabel="FRAKTUR (triaged)"
            afterValue={63}
            result="-95% noise cut"
          />
        }
      />

      {/* Proof, part 2 — Layer 2 concept leads; the concrete finding count
          from our first test is the supporting visual. */}
      <Slide
        headline={<>Bitcoin-Native AI.<br />Targeted by Fuzz.</>}
        sub="Layer 2 runs AI agents with real Bitcoin protocol knowledge — BIPs, BOLTs, NUTs — laser-focused only on what Layer 1 already flagged as risky."
        visual={<FindingsCard />}
        visualSide="left"
      />

      <Slide
        headline={<>$3.2k.<br />Down to $150.</>}
        sub="Better signal, at a lower cost. Same Bitcoin-specific rigor via Loupe — we cut the reading, not the standard."
        visual={
          <CompareBars
            title="Cost per scan (Claude Opus 4.8, API-equivalent)"
            beforeLabel="Loupe-only (~1,300 agents)"
            beforeValue={3200}
            afterLabel="FRAKTUR (63 triaged files)"
            afterValue={150}
            unit="$"
            result="-95% cost"
          />
        }
      />

      {/* Proof, part 4 — verification, deliberately echoing the Home hero
          ("Live, verifiable security scores... Audited, timestamped,
          public.") so both pages tell the same story about proof. */}
      <Slide
        headline="Don't Trust. Verify."
        sub="Every audit is hashed and anchored on-chain via OpenTimestamp — live, verifiable, public. The same proof your users can check on the Wallet Watcher, not a PDF you take our word for."
        visual={<ShardArt variant="verify" />}
        visualSide="left"
      />

      {/* Closing punch + pricing + CTA */}
      <Slide
        id="pricing"
        center
        eyebrow="$2K–4K / month · free scan to start"
        headline="Full audits weren't built for you. This is."
        visual={<ShardArt variant="closing" className="mx-auto max-w-xs opacity-80" />}
      >
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:contact@fraktur.io?subject=Free%20scan%20request"
            className="rounded-full bg-fraktur-orange px-6 py-3 font-semibold text-black hover:bg-fraktur-orangeDim"
          >
            Get a free scan of your public repo
          </a>
          <a
            href="mailto:contact@fraktur.io?subject=Talk%20to%20FRAKTUR"
            className="rounded-full border border-fraktur-border px-6 py-3 font-semibold text-fraktur-text hover:border-fraktur-orange"
          >
            Talk to us
          </a>
        </div>
      </Slide>

      {/* FAQ — utility reference, intentionally plain, not part of the visual arc */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
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
      </section>

        <Footer />
        <DonationDrawer walletOptions={wallets.map((w) => ({ id: w.id, name: w.name }))} />
      </div>
    </>
  );
}
