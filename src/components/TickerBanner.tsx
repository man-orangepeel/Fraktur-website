"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Supporter } from "@/lib/types";
import { supporterProfileUrl } from "@/lib/format";

const SLOTS = 3;
const CYCLE_MS = 3200; // how long a group stays whole before it fractures
const CRACK_MS = 450; // duration of the split/slide/fade-out transition
const STAGGER_MS = 150; // cascade delay between slots

// Same diagonal direction as the FRAKTUR mark's wedge (see ShardArt.tsx's
// SHARD path, roughly bottom-left -> top-right) — split into two
// complementary triangles along that line so together they tile the box.
const PIECE_TOP_LEFT = "polygon(0% 0%, 100% 0%, 0% 100%)";
const PIECE_BOTTOM_RIGHT = "polygon(100% 0%, 100% 100%, 0% 100%)";

function chunkIntoGroups(items: Supporter[]): (Supporter | null)[][] {
  if (items.length === 0) return [[null, null, null]];
  const groups: (Supporter | null)[][] = [];
  for (let i = 0; i < items.length; i += SLOTS) {
    const group: (Supporter | null)[] = items.slice(i, i + SLOTS);
    while (group.length < SLOTS) group.push(null);
    groups.push(group);
  }
  return groups;
}

function SupporterContent({ s }: { s: Supporter | null }) {
  if (!s) {
    return <span className="text-sm text-fraktur-muted">Be the first this month</span>;
  }
  return (
    <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-fraktur-orange/10 px-3 py-1 text-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fraktur-orange text-xs font-semibold text-black">
        {s.handle.replace(/^@|^npub1/, "").slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate font-medium text-fraktur-orange">{s.handle}</span>
      <span className="shrink-0 rounded-full bg-fraktur-orange px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
        {s.tier}
      </span>
    </span>
  );
}

function FractureSlot({ s, cracking, delayMs }: { s: Supporter | null; cracking: boolean; delayMs: number }) {
  const url = s ? supporterProfileUrl(s) : undefined;

  const pieceStyle = (piece: "top" | "bottom"): CSSProperties => {
    const dir = piece === "top" ? -1 : 1;
    return {
      clipPath: piece === "top" ? PIECE_TOP_LEFT : PIECE_BOTTOM_RIGHT,
      transform: cracking ? `translate(${dir * 10}px, ${dir * 14}px) rotate(${dir * 7}deg)` : "translate(0, 0) rotate(0deg)",
      opacity: cracking ? 0 : 1,
      transitionProperty: "transform, opacity",
      transitionDuration: `${CRACK_MS}ms`,
      transitionTimingFunction: "ease-in",
      transitionDelay: `${delayMs}ms`,
    };
  };

  const content = (
    <span className="relative flex h-9 w-44 items-center justify-center sm:w-48">
      <span className="absolute inset-0 flex items-center justify-center" style={pieceStyle("top")}>
        <SupporterContent s={s} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center" style={pieceStyle("bottom")}>
        <SupporterContent s={s} />
      </span>
    </span>
  );

  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}

export function TickerBanner({ supporters }: { supporters: Supporter[] }) {
  const active = supporters.filter((s) => s.activeLast30Days);
  const groups = useMemo(() => chunkIntoGroups(active), [active]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [cracking, setCracking] = useState(false);

  useEffect(() => {
    setGroupIndex(0);
    setCracking(false);
  }, [groups.length]);

  useEffect(() => {
    if (groups.length <= 1) return;
    const startCrack = setInterval(() => setCracking(true), CYCLE_MS);
    return () => clearInterval(startCrack);
  }, [groups.length]);

  useEffect(() => {
    if (!cracking) return;
    const advance = setTimeout(() => {
      setGroupIndex((i) => (i + 1) % groups.length);
      setCracking(false);
    }, CRACK_MS + (SLOTS - 1) * STAGGER_MS + 100);
    return () => clearTimeout(advance);
  }, [cracking, groups.length]);

  const current = groups[groupIndex] ?? groups[0];

  return (
    <div className="relative overflow-hidden border-y-2 border-fraktur-electric/30 bg-fraktur-electric/5 py-6 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-32 w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fraktur-electric/5 blur-3xl" />
      </div>

      <div className="relative mx-auto mb-4 flex max-w-6xl items-center gap-2 px-4 text-sm text-fraktur-muted sm:text-base">
        <span className="text-xl font-bold text-fraktur-text sm:text-2xl">the Kast</span>
        <span className="flex items-center gap-1.5 text-xs text-fraktur-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fraktur-electric" aria-hidden />
          active this month
        </span>
      </div>

      <div key={groupIndex} className="relative flex justify-center gap-8 px-4">
        {current.map((s, i) => (
          <FractureSlot key={i} s={s} cracking={cracking} delayMs={i * STAGGER_MS} />
        ))}
      </div>
    </div>
  );
}
