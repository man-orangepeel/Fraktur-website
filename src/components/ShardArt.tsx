/**
 * Original, on-brand abstract visuals — no stock photography. Every
 * composition is built from the same shard silhouette as the FRAKTUR mark
 * (a thin fractured wedge), repeated and varied in scale/opacity/rotation to
 * carry a specific idea, the way the source pitch deck used a single strong
 * photo per slide. See WEBSITE_BRIEF.md §11 for why photography was replaced
 * with generated shard compositions (licensing + brand consistency).
 */

const SHARD = "M 8 92 L 88 6 L 94 10 L 14 96 Z"; // the mark's wedge, normalized to a 100x100 box

function Shard({
  x,
  y,
  scale,
  rotate,
  opacity,
  color = "#f5891a",
  blur,
}: {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  color?: string;
  blur?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
      <path d={SHARD} fill={color} />
    </g>
  );
}

export type ShardVariant = "cover" | "loss" | "burden" | "stillmotion" | "concentration" | "verify" | "closing";

export function ShardArt({ variant, className }: { variant: ShardVariant; className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f5891a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f5891a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#glow)" />

      {variant === "cover" && (
        <>
          <Shard x={110} y={340} scale={2.6} rotate={0} opacity={0.12} color="#f5891a" />
          <Shard x={140} y={310} scale={1.9} rotate={0} opacity={0.22} color="#f5891a" />
          <Shard x={170} y={280} scale={1.3} rotate={0} opacity={1} color="#f5891a" />
        </>
      )}

      {variant === "loss" && (
        <>
          {/* A single shard breaking apart — fragments drifting down and away, nothing recovered. */}
          <Shard x={170} y={120} scale={1.2} rotate={0} opacity={1} color="#f5891a" />
          <Shard x={230} y={190} scale={0.5} rotate={24} opacity={0.5} color="#e2542c" />
          <Shard x={120} y={230} scale={0.35} rotate={-18} opacity={0.35} color="#e2542c" />
          <Shard x={260} y={270} scale={0.22} rotate={40} opacity={0.22} color="#8a94a3" />
          <Shard x={90} y={300} scale={0.18} rotate={-32} opacity={0.15} color="#8a94a3" />
        </>
      )}

      {variant === "burden" && (
        <>
          {/* One solid shard at the base carrying a tall stack of faint, thin ones above it. */}
          <Shard x={160} y={330} scale={1.6} rotate={0} opacity={1} color="#f5891a" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Shard key={i} x={175 - i * 4} y={300 - i * 34} scale={1.1 - i * 0.06} rotate={0} opacity={0.16 - i * 0.012} color="#e6e9ee" />
          ))}
        </>
      )}

      {variant === "stillmotion" && (
        <>
          {/* One crisp, still shard vs. several motion-streaked (blurred) ones around it. */}
          <Shard x={170} y={220} scale={1.4} rotate={0} opacity={1} color="#f5891a" />
          <Shard x={230} y={140} scale={0.9} rotate={4} opacity={0.25} color="#8a94a3" blur={6} />
          <Shard x={260} y={110} scale={0.9} rotate={4} opacity={0.15} color="#8a94a3" blur={10} />
          <Shard x={110} y={300} scale={0.7} rotate={-6} opacity={0.2} color="#8a94a3" blur={5} />
        </>
      )}

      {variant === "concentration" && (
        <>
          {/* Many faint scattered fragments funneling into one bright, precise shard — the 1,300 → 63 idea, drawn. */}
          {[
            [60, 60, 0.14, -30],
            [320, 70, 0.14, 40],
            [40, 340, 0.12, 15],
            [340, 320, 0.12, -20],
            [80, 200, 0.16, 10],
            [300, 190, 0.16, -10],
            [200, 60, 0.14, 0],
            [200, 340, 0.12, 0],
          ].map(([x, y, op, rot], i) => (
            <Shard key={i} x={x} y={y} scale={0.28} rotate={rot} opacity={op} color="#8a94a3" />
          ))}
          <Shard x={175} y={225} scale={1.3} rotate={0} opacity={1} color="#f5891a" />
        </>
      )}

      {variant === "verify" && (
        <>
          {/* A shard sealed inside a timestamp ring — the on-chain proof idea,
              drawn in electric blue rather than brand orange: this is the one
              deliberate exception, reserved for verification/trust imagery
              (matches the "Verify" links elsewhere on the site). */}
          <circle cx="200" cy="200" r="120" fill="none" stroke="#3b6fed" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 8" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="#3b6fed" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="1 10" />
          <Shard x={190} y={230} scale={1.5} rotate={0} opacity={1} color="#3b6fed" />
        </>
      )}

      {variant === "closing" && (
        <>
          <Shard x={200} y={230} scale={2.2} rotate={0} opacity={1} color="#f5891a" />
          <Shard x={210} y={200} scale={1.4} rotate={0} opacity={0.15} color="#e6e9ee" />
        </>
      )}
    </svg>
  );
}
