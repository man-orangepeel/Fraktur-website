"use client";

import { useMemo, useState } from "react";
import type { Supporter, SiteSettings } from "@/lib/types";

type SortMode = "rank" | "recent" | "alpha";

export function SupportersGallery({ supporters, settings }: { supporters: Supporter[]; settings: SiteSettings }) {
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
    <section id="supporters" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-fraktur-text">Supporters</h2>
          <p className="text-sm text-fraktur-muted">
            Only supporters of {settings.galleryThresholdSats.toLocaleString("en-US")} sats or more appear here. This
            gallery is permanent once you&rsquo;re in — nobody gets removed.
          </p>
        </div>
        {expanded && (
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-md border border-fraktur-border bg-fraktur-panel px-3 py-1.5 text-sm text-fraktur-text"
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
            {paged.map((s) => (
              <div key={s.handle} className="flex flex-col items-center gap-2 rounded-xl border border-fraktur-border bg-fraktur-panel p-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fraktur-border text-sm font-semibold">
                  {s.handle.replace(/^@|^npub1/, "").slice(0, 2).toUpperCase()}
                </span>
                <span className="w-full truncate text-xs text-fraktur-text" title={s.handle}>
                  {s.handle}
                </span>
                <span className="rounded-full bg-fraktur-orange/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fraktur-orange">
                  {s.tier}
                </span>
              </div>
            ))}
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
                className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-fraktur-muted">
                Page {page + 1} / {Math.ceil(sorted.length / pageSize)}
              </span>
              <button
                disabled={(page + 1) * pageSize >= sorted.length}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-fraktur-border px-3 py-1 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
