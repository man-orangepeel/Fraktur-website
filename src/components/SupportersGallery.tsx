"use client";

import { useMemo, useState } from "react";
import type { Supporter } from "@/lib/types";
import { supporterProfileUrl } from "@/lib/format";

type SortMode = "rank" | "recent" | "alpha";

export function SupportersGallery({ supporters }: { supporters: Supporter[] }) {
  const [expanded, setExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("rank");

  const sorted = useMemo(() => {
    const list = [...supporters];
    if (sortMode === "rank") list.sort((a, b) => b.totalSats - a.totalSats);
    if (sortMode === "recent")
      list.sort((a, b) => new Date(b.lastDonationDate).getTime() - new Date(a.lastDonationDate).getTime());
    if (sortMode === "alpha") list.sort((a, b) => a.handle.localeCompare(b.handle));
    return list;
  }, [supporters, sortMode]);

  const visible = expanded ? sorted : sorted.slice(0, 10);
  const pageSize = 20;
  const [page, setPage] = useState(0);
  const paged = expanded ? visible.slice(page * pageSize, page * pageSize + pageSize) : visible;

  return (
    // Contained rounded card (2026-07-11, was a full-bleed band) — same
    // treatment as "What FRAKTUR does" above it, sitting on the page's own
    // background instead of stacking as another edge-to-edge stripe.
    <section id="supporters" className="mx-auto max-w-6xl px-4 py-10">
    <div className="rounded-2xl border border-fraktur-electric/40 bg-fraktur-electric/10 p-8 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Small orange kicker for the section name, big bold text for the
            actual line (2026-07-11: matches "What FRAKTUR does" — the
            punchy sentence, not the label, is what deserves the emphasis). */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">the Kast</p>
          <h2 className="font-display text-2xl text-fraktur-text sm:text-3xl">
            A fracture heals because someone holds it together.
            <br />
            This is who&rsquo;s holding ours.
          </h2>
        </div>
        {expanded && (
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric"
          >
            <option value="rank">Sort: rank</option>
            <option value="recent">Sort: most recent</option>
            <option value="alpha">Sort: alphabetical</option>
          </select>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-fraktur-muted">No public supporters yet — be the first.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {paged.map((s) => {
              const url = supporterProfileUrl(s);
              const cardClass =
                "flex flex-col items-center gap-2 rounded-xl border border-fraktur-electric/30 bg-fraktur-panel p-4 text-center hover:border-fraktur-electric/60";
              const inner = (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fraktur-orange text-sm font-semibold text-black">
                    {s.handle.replace(/^@|^npub1/, "").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="w-full truncate text-xs font-medium text-fraktur-text" title={s.handle}>
                    {s.handle}
                  </span>
                  <span className="rounded-full bg-fraktur-electric px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {s.tier}
                  </span>
                </>
              );
              return url ? (
                <a key={s.handle} href={url} target="_blank" rel="noreferrer" className={cardClass}>
                  {inner}
                </a>
              ) : (
                <div key={s.handle} className={cardClass}>
                  {inner}
                </div>
              );
            })}
          </div>

          {!expanded && sorted.length > 10 && (
            <button onClick={() => setExpanded(true)} className="mt-6 text-sm font-medium text-fraktur-orange hover:underline">
              See all {sorted.length} supporters →
            </button>
          )}

          {expanded && sorted.length > pageSize && (
            <div className="mt-6 flex items-center gap-3 text-sm">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-fraktur-border px-3 py-1 focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-fraktur-muted">
                Page {page + 1} / {Math.ceil(sorted.length / pageSize)}
              </span>
              <button
                disabled={(page + 1) * pageSize >= sorted.length}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-fraktur-border px-3 py-1 focus:border-fraktur-electric focus:outline-none focus:ring-1 focus:ring-fraktur-electric disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}

          {expanded && (
            <button
              onClick={() => {
                setExpanded(false);
                setPage(0);
              }}
              className="mt-6 text-sm font-medium text-fraktur-orange hover:underline"
            >
              Show fewer supporters ↑
            </button>
          )}
        </>
      )}
    </div>
    </section>
  );
}
