import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";
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

        {/* Cover */}
      <Slide
        id="problem"
        eyebrow="FRAKTUR — for Bitcoin companies who can't afford to look away"
        headline="Cheaper because smarter."
        visual={<ShardArt variant="cover" />}
      />

      {/* Problem, 3 beats — headline only, exactly like the source deck */}
      <Slide headline={<>83 Exploits since April 2026.<br />$755M Lost.<br />No Refund.</>} visual={<ShardArt variant="loss" />} />

      <Slide headline={<>One Engineer.<br />Millions at Stake.</>} visual={<ShardArt variant="burden" />} visualSide="left" />

      <Slide headline={<>Static Eyes.<br />Dynamic Threats.</>} visual={<ShardArt variant="stillmotion" />} />

      {/* The pivot — the reframed value proposition */}
      <Slide
        id="solution"
        eyebrow="Our answer"
        headline={<>Not cheaper.<br />Concentrated.</>}
        sub="We don't read less code. We waste less time reading code that never breaks."
        visual={<ShardArt variant="concentration" />}
        visualSide="left"
      />

      {/* Proof — our first real-world test, exact figures from FRAKTUR.pdf pp.12-14 */}
      <Slide
        id="proof"
        eyebrow="Proof — our first real-world test"
        headline={<>1,300 files.<br />Down to 63.</>}
        sub="For the wallet's repo we audited."
        visual={
          <CompareBars
            title="L1 — LLM agents launched per scan"
            beforeLabel="Loupe-only (whole codebase)"
            beforeValue={1300}
            afterLabel="FRAKTUR (triaged)"
            afterValue={63}
            result="-95% data to verify"
          />
        }
      />

      <Slide
        headline={<>6 files.<br />5 real findings.</>}
        visual={<FindingsCard />}
        visualSide="left"
      />

      <Slide
        headline={<>$3.2k.<br />Down to $150.</>}
        sub="Same Bitcoin-specific rigor — BIPs, BOLTs, NUTs — via Loupe. We cut the reading, not the standard."
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
