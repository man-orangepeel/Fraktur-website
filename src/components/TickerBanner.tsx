"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Supporter } from "@/lib/types";
import { supporterProfileUrl } from "@/lib/format";

const SLOTS = 3;
const CYCLE_MS = 3200; // how long a group stays whole/at rest before it starts to crack
const STAGGER_MS = 400; // cascade delay between slots, left -> right
const CRACK_GROW_MS = 500; // phase 1: hairline fissure appears, still 100% opaque
const PAUSE_MS = 650; // hold on the fissure so it's clearly visible before it worsens
const EXPLODE_MS = 550; // phase 2: fissure widens, block separates and fades out
const BUFFER_MS = 150; // small safety margin before swapping in the next group
const STAGGER_MAX = (SLOTS - 1) * STAGGER_MS;

// Same diagonal direction as the FRAKTUR mark's wedge (see ShardArt.tsx's
// SHARD path, roughly bottom-left -> top-right) — split into two
// complementary triangles along that line so together they tile the box.
const PIECE_TOP_LEFT = "polygon(0% 0%, 100% 0%, 0% 100%)";
const PIECE_BOTTOM_RIGHT = "polygon(100% 0%, 100% 100%, 0% 100%)";

type Phase = "rest" | "fissure" | "explode";

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

// Fixed-per-donor accent (not re-randomized on every render) — proves each
// cycle is showing genuinely different supporters rather than the same
// group looping, since the color pattern changes with them.
const ACCENT = {
  orange: { chip: "bg-fraktur-orange/10", avatar: "bg-fraktur-orange text-black", text: "text-fraktur-orange", badge: "bg-fraktur-orange text-black" },
  electric: { chip: "bg-fraktur-electric/10", avatar: "bg-fraktur-electric text-white", text: "text-fraktur-electric", badge: "bg-fraktur-electric text-white" },
} as const;

function supporterAccent(handle: string): keyof typeof ACCENT {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) hash = (hash * 31 + handle.charCodeAt(i)) >>> 0;
  return hash % 2 === 0 ? "orange" : "electric";
}

function SupporterContent({ s }: { s: Supporter | null }) {
  if (!s) {
    return <span className="whitespace-nowrap text-sm text-fraktur-muted">Be the first this month</span>;
  }
  const accent = ACCENT[supporterAccent(s.handle)];
  return (
    <span className={`flex items-center gap-2 whitespace-nowrap rounded-full ${accent.chip} px-4 py-1.5 text-sm`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${accent.avatar}`}>
        {s.handle.replace(/^@|^npub1/, "").slice(0, 1).toUpperCase()}
      </span>
      <span className={`font-medium ${accent.text}`}>{s.handle}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.badge}`}>
        {s.tier}
      </span>
    </span>
  );
}

function pieceStyle(piece: "top" | "bottom", phase: Phase, delayMs: number): CSSProperties {
  const dir = piece === "top" ? -1 : 1;
  const clipPath = piece === "top" ? PIECE_TOP_LEFT : PIECE_BOTTOM_RIGHT;

  if (phase === "explode") {
    return {
      clipPath,
      transform: `translate(${dir * 16}px, ${dir * 20}px) rotate(${dir * 9}deg)`,
      opacity: 0,
      transitionProperty: "transform, opacity",
      transitionDuration: `${EXPLODE_MS}ms`,
      transitionTimingFunction: "ease-in",
      transitionDelay: `${delayMs}ms`,
    };
  }
  if (phase === "fissure") {
    // A hairline separation only — still fully opaque. This is the crack
    // "appearing", not the block coming apart yet.
    return {
      clipPath,
      transform: `translate(${dir * 3}px, ${dir * 3}px) rotate(0deg)`,
      opacity: 1,
      transitionProperty: "transform, opacity",
      transitionDuration: `${CRACK_GROW_MS}ms`,
      transitionTimingFunction: "ease-out",
      transitionDelay: `${delayMs}ms`,
    };
  }
  return {
    clipPath,
    transform: "translate(0, 0) rotate(0deg)",
    opacity: 1,
    transitionProperty: "transform, opacity",
    transitionDuration: "0ms",
    transitionDelay: "0ms",
  };
}

function FractureSlot({ s, phase, delayMs }: { s: Supporter | null; phase: Phase; delayMs: number }) {
  const url = s ? supporterProfileUrl(s) : undefined;

  const content = (
    <span className="relative flex h-10 items-center justify-center px-2">
      <span className="invisible flex items-center">
        <SupporterContent s={s} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center" style={pieceStyle("top", phase, delayMs)}>
        <SupporterContent s={s} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center" style={pieceStyle("bottom", phase, delayMs)}>
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
  const [phase, setPhase] = useState<Phase>("rest");

  useEffect(() => {
    if (groups.length <= 1) {
      setPhase("rest");
      return;
    }
    const toFissure = setTimeout(() => setPhase("fissure"), CYCLE_MS);
    const toExplode = setTimeout(() => setPhase("explode"), CYCLE_MS + STAGGER_MAX + CRACK_GROW_MS + PAUSE_MS);
    const toNext = setTimeout(
      () => {
        setGroupIndex((i) => (i + 1) % groups.length);
        setPhase("rest");
      },
      CYCLE_MS + STAGGER_MAX + CRACK_GROW_MS + PAUSE_MS + STAGGER_MAX + EXPLODE_MS + BUFFER_MS
    );
    return () => {
      clearTimeout(toFissure);
      clearTimeout(toExplode);
      clearTimeout(toNext);
    };
  }, [groupIndex, groups.length]);

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

      <div key={groupIndex} className="relative mx-auto flex max-w-full flex-wrap justify-center gap-x-16 gap-y-4 px-8 sm:gap-x-24 lg:gap-x-32">
        {current.map((s, i) => (
          <FractureSlot key={i} s={s} phase={phase} delayMs={i * STAGGER_MS} />
        ))}
      </div>
    </div>
  );
}
