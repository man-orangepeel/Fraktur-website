import type { Severity } from "@/lib/types";
import { severityColorClass } from "@/lib/format";

export function SeverityBadge({
  severity,
  count,
  onClick,
}: {
  severity: Severity;
  count: number;
  // Accepted (but unused) for backward compatibility with existing call
  // sites — the per-badge tooltip that used to read this has moved to a
  // single disclosure-info icon next to the "Fractures" heading instead
  // (see WalletList.tsx), so badges are purely visual now.
  walletName?: string;
  // Optional — when passed (WalletList.tsx), the badge becomes clickable and
  // opens the audit history for that wallet, since severity counts are
  // exactly the kind of thing a visitor wants to drill into. Omitted call
  // sites (e.g. the static Companies-page hero preview) stay non-interactive.
  onClick?: () => void;
}) {
  const className = `rounded-full px-2 py-0.5 font-medium ${severityColorClass(severity)}`;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-fraktur-electric`}
      >
        {count} {severity}
      </button>
    );
  }
  return (
    <span className={className}>
      {count} {severity}
    </span>
  );
}
