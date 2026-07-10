import { severityColorClass } from "@/lib/format";

/**
 * Recreates the source deck's proof-slide language: a floating dark card,
 * one bold bar chart, the result stated as a single number — not a table row
 * buried in prose. Used on the Companies "Proof" slides.
 */
export function CompareBars({
  title,
  beforeLabel,
  beforeValue,
  afterLabel,
  afterValue,
  unit,
  result,
}: {
  title: string;
  beforeLabel: string;
  beforeValue: number;
  afterLabel: string;
  afterValue: number;
  unit?: string;
  result: string;
}) {
  const max = beforeValue;
  const afterPct = Math.max((afterValue / max) * 100, 3);

  return (
    <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6 shadow-2xl shadow-black/40">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-fraktur-muted">{title}</p>

      <div className="mb-3">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="text-fraktur-muted">{beforeLabel}</span>
          <span className="font-display text-2xl text-fraktur-text">
            {beforeValue.toLocaleString()}
            {unit}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-risk-critical/70" />
      </div>

      <div className="mb-5">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="text-fraktur-muted">{afterLabel}</span>
          <span className="font-display text-2xl text-fraktur-electric">
            {afterValue.toLocaleString()}
            {unit}
          </span>
        </div>
        <div className="h-3 rounded-full bg-fraktur-electric" style={{ width: `${afterPct}%` }} />
      </div>

      <p className="font-display text-3xl text-fraktur-text">{result}</p>
    </div>
  );
}

/**
 * Real figures from FRAKTUR's first production run (2026-07-10). Wallet name
 * withheld per the disclosure policy — only severity + broad category is
 * safe to publish before the audited team ships a fix. See
 * WEBSITE_BRIEF.md §26 for the source table and redaction rules; do not add
 * file names, function names, or exploit mechanisms here.
 */
const REAL_FINDINGS: { severity: "High" | "Medium" | "Low"; category: string; status: string }[] = [
  { severity: "High", category: "Untrusted network-input authenticity", status: "code-verified" },
  { severity: "High", category: "Credential / key handling", status: "confirmed, conditional" },
  { severity: "Medium", category: "Resource-exhaustion (availability)", status: "confirmed live" },
  { severity: "Medium", category: "Transaction state-machine consistency", status: "confirmed" },
  { severity: "Medium", category: "Untrusted network-input authenticity", status: "logic-confirmed" },
  { severity: "Low", category: "Data-structure consistency", status: "confirmed" },
];

export function FindingsCard() {
  return (
    <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6 shadow-2xl shadow-black/40">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-fraktur-muted">
        Security review — first real-world run
      </p>
      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-display text-3xl text-fraktur-text">7</p>
          <p className="text-xs text-fraktur-muted">files deep-read</p>
        </div>
        <div>
          <p className="font-display text-3xl text-fraktur-orange">6</p>
          <p className="text-xs text-fraktur-muted">findings</p>
        </div>
        <div>
          <p className="font-display text-3xl text-fraktur-text">2·3·1</p>
          <p className="text-xs text-fraktur-muted">High · Med · Low</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {REAL_FINDINGS.map((f, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-fraktur-bg px-3 py-2">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${severityColorClass(f.severity)}`}>
              {f.severity}
            </span>
            <span className="truncate text-fraktur-text">{f.category}</span>
            <span className="ml-auto shrink-0 text-xs text-fraktur-muted">{f.status}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-fraktur-muted">
        3 confirmed live · 1 confirmed conditional · 2 logic-confirmed ·{" "}
        <span className="font-semibold text-fraktur-electric">0 refuted</span>
      </p>
    </div>
  );
}
