"use client";

import { useState } from "react";
import type { Severity } from "@/lib/types";
import { severityColorClass } from "@/lib/format";

export function SeverityBadge({
  severity,
  count,
  walletName,
}: {
  severity: Severity;
  count: number;
  walletName: string;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setPinned((p) => !p)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPinned(false);
            setHover(false);
          }
        }}
        aria-expanded={open}
        className={`rounded-full px-2 py-0.5 font-medium ${severityColorClass(severity)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-fraktur-electric`}
      >
        {count} {severity}
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-fraktur-electric/40 bg-fraktur-panel p-3 text-xs font-normal normal-case leading-relaxed text-fraktur-muted shadow-xl"
        >
          <p>
            {count} {severity}-severity finding{count === 1 ? "" : "s"}. Full technical detail was shared with the{" "}
            <span className="text-fraktur-text">{walletName}</span> team immediately, free of charge. Public
            write-up follows once they ship a fix, or after a 90-day window — never before.
          </p>
          <a href="/legal" className="mt-2 inline-block font-medium text-fraktur-electric hover:underline">
            How we disclose →
          </a>
        </div>
      )}
    </span>
  );
}
