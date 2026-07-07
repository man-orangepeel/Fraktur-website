import type { Supporter } from "@/lib/types";

export function TickerBanner({ supporters }: { supporters: Supporter[] }) {
  const active = supporters.filter((s) => s.activeLast30Days);
  const loop = [...active, ...active]; // duplicated for a seamless CSS marquee loop

  return (
    <div className="relative overflow-hidden border-y-2 border-fraktur-orange/40 bg-fraktur-panel py-5 sm:py-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-32 w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fraktur-orange/10 blur-3xl" />
      </div>

      <div className="relative mx-auto mb-2 max-w-6xl px-4 text-xs text-fraktur-muted sm:text-sm">
        <span className="font-bold uppercase tracking-wide text-fraktur-orange">The Cast</span>
        {" — active this month."}
      </div>

      {active.length === 0 ? (
        <p className="relative px-4 text-sm text-fraktur-muted">Be the first supporter active this month. →</p>
      ) : (
        <div className="group relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {loop.map((s, i) => (
              <span key={`${s.handle}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fraktur-border text-xs">
                  {s.handle.replace(/^@|^npub1/, "").slice(0, 1).toUpperCase()}
                </span>
                <span className="text-fraktur-text">{s.handle}</span>
                <span className="rounded-full bg-fraktur-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-fraktur-muted">
                  {s.tier}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
