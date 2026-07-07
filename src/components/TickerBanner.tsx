import type { Supporter, SiteSettings } from "@/lib/types";

export function TickerBanner({ supporters, settings }: { supporters: Supporter[]; settings: SiteSettings }) {
  const active = supporters.filter((s) => s.activeLast30Days);
  const loop = [...active, ...active]; // duplicated for a seamless CSS marquee loop

  return (
    <div className="border-y border-fraktur-border bg-fraktur-panel py-3">
      <div className="mx-auto mb-2 max-w-6xl px-4 text-xs text-fraktur-muted">
        <span className="font-semibold text-fraktur-orange">Supporters active this month</span>
        {" — "}
        Only supporters of {settings.galleryThresholdSats.toLocaleString("en-US")} sats or more appear here.
      </div>

      {active.length === 0 ? (
        <p className="px-4 text-sm text-fraktur-muted">Be the first supporter active this month. →</p>
      ) : (
        <div className="group overflow-hidden">
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
