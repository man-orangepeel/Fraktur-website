import type { Supporter } from "@/lib/types";
import { supporterProfileUrl } from "@/lib/format";

export function TickerBanner({ supporters }: { supporters: Supporter[] }) {
  const active = supporters.filter((s) => s.activeLast30Days);
  const loop = [...active, ...active]; // duplicated for a seamless CSS marquee loop

  return (
    <div className="relative overflow-hidden border-y-2 border-fraktur-electric/30 bg-fraktur-electric/5 py-5 sm:py-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-32 w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fraktur-electric/5 blur-3xl" />
      </div>

      <div className="relative mx-auto mb-3 flex max-w-6xl items-center gap-2 px-4 text-sm text-fraktur-muted sm:text-base">
        <span className="text-xl font-bold text-fraktur-text sm:text-2xl">the Kast</span>
        <span className="flex items-center gap-1.5 text-xs text-fraktur-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fraktur-electric" aria-hidden />
          active this month
        </span>
      </div>

      {active.length === 0 ? (
        <p className="relative px-4 text-sm text-fraktur-muted">Be the first supporter active this month. →</p>
      ) : (
        <div className="group relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {loop.map((s, i) => {
              const url = supporterProfileUrl(s);
              const chipClass =
                "flex items-center gap-2 whitespace-nowrap rounded-full bg-fraktur-orange/10 px-3 py-1 text-sm hover:bg-fraktur-orange/20";
              const inner = (
                <>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fraktur-orange text-xs font-semibold text-black">
                    {s.handle.replace(/^@|^npub1/, "").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="font-medium text-fraktur-orange">{s.handle}</span>
                  <span className="rounded-full bg-fraktur-orange px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                    {s.tier}
                  </span>
                </>
              );
              return url ? (
                <a key={`${s.handle}-${i}`} href={url} target="_blank" rel="noreferrer" className={chipClass}>
                  {inner}
                </a>
              ) : (
                <span key={`${s.handle}-${i}`} className={chipClass}>
                  {inner}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
