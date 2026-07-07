import { ShardArt } from "./ShardArt";

/**
 * The Companies page opener — deliberately its own component, not another
 * `Slide`. Founder's feedback on the first pass: reusing `Slide`'s split-
 * screen/90vh layout made the hero read as just an emptier version of the
 * next slide, not a distinct arrival moment. Fixes, as a UX pass:
 *
 * - Full min-h-screen, content centered (not split into two columns with a
 *   half-empty text side) — height now serves a single composition instead
 *   of leftover whitespace.
 * - The single biggest type on the whole page (up to text-8xl) — every
 *   content slide caps at text-6xl, so the brand line is unambiguously the
 *   loudest moment, not competing visually with what follows.
 * - The shard art is a full-bleed atmospheric backdrop behind the text, not
 *   confined to a visual "half" — paired with a sparing night-blue glow
 *   (`fraktur-electricDim`), the one deliberately restrained use of the
 *   second brand accent on this page.
 * - A scroll cue anchored to the first problem slide — the hero no longer
 *   feels like it's floating disconnected from the rest of the page.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-fraktur-border px-6 text-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.18]">
        <ShardArt variant="cover" className="h-[150%] w-[150%] max-w-none" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(27,42,92,0.45), transparent 60%)" }}
        aria-hidden
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-fraktur-orange">
          FRAKTUR — for Bitcoin companies who can&rsquo;t afford to look away
        </p>
        <h1 className="font-display text-5xl font-medium leading-[1.08] text-fraktur-text sm:text-6xl md:text-7xl lg:text-8xl">
          Cheaper because smarter.
        </h1>
      </div>

      <a
        href="#problem"
        className="absolute bottom-10 z-10 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-fraktur-muted transition hover:text-fraktur-orange"
      >
        <span>The problem</span>
        <span className="animate-bounce text-base leading-none">↓</span>
      </a>
    </section>
  );
}
