import type { Severity } from "@/lib/types";
import { severityColorClass } from "@/lib/format";

export function SeverityBadge({
  severity,
  count,
}: {
  severity: Severity;
  count: number;
  // Accepted (but unused) for backward compatibility with existing call
  // sites — the per-badge tooltip that used to read this has moved to a
  // single disclosure-info icon next to the "Fractures" heading instead
  // (see WalletList.tsx), so badges are purely visual now.
  walletName?: string;
}) {
  return (
    <span className={`rounded-full px-2 py-0.5 font-medium ${severityColorClass(severity)}`}>
      {count} {severity}
    </span>
  );
}
