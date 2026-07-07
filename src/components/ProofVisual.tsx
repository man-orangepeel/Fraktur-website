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

export function FindingsCard() {
  return (
    <div className="rounded-2xl border border-fraktur-border bg-fraktur-panel p-6 shadow-2xl shadow-black/40">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-fraktur-muted">
        Security review — scan summary
      </p>
      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-display text-3xl text-fraktur-text">6</p>
          <p className="text-xs text-fraktur-muted">files reviewed</p>
        </div>
        <div>
          <p className="font-display text-3xl text-fraktur-orange">5</p>
          <p className="text-xs text-fraktur-muted">findings</p>
        </div>
        <div>
          <p className="font-display text-3xl text-fraktur-text">2·1·2</p>
          <p className="text-xs text-fraktur-muted">Med · Med-Hi · Low</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {[
          ["CWE-476", "Signature verification — null client", "Medium"],
          ["CWE-22", "Path / filesystem handling", "Medium"],
          ["CWE-23", "Path / filesystem handling", "Medium-High"],
          ["CWE-362", "Concurrency / race condition", "Low"],
          ["CWE-362", "Concurrency / race condition", "Low"],
        ].map(([cwe, title, sev], i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-fraktur-bg px-3 py-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                sev === "Medium-High"
                  ? "bg-risk-mediumHigh text-black"
                  : sev === "Medium"
                    ? "bg-risk-medium text-black"
                    : "bg-risk-low text-white"
              }`}
            >
              {sev}
            </span>
            <span className="text-fraktur-muted">{cwe}</span>
            <span className="truncate text-fraktur-text">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
