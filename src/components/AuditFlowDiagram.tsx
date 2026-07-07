import type { Severity } from "@/lib/types";
import { reductionPct, severityHex } from "@/lib/format";

const FRAKTUR_ORANGE = "#f5891a";
const FRAKTUR_ORANGE_DIM = "#c96f14";
const FRAKTUR_TEXT = "#e6e9ee";
const FRAKTUR_MUTED = "#8a94a3";
const FRAKTUR_BORDER = "#1c232c";

export interface AuditFlowDiagramProps {
  testsRun?: number;
  filesScanned: number;
  filesSelected: number;
  filesAudited: number;
  maxTestsRun: number;
  maxFilesScanned: number;
  riskBadge: Severity | "None";
}

function scaleWidth(value: number, max: number, min = 6, cap = 40): number {
  if (max <= 0) return min;
  return min + (cap - min) * Math.min(value / max, 1);
}

// Tapered "ribbon" band between two (x, centerY, width) points, curved horizontally.
function taperBand(x0: number, yc0: number, w0: number, x1: number, yc1: number, w1: number, curviness = 0.55): string {
  const dx = (x1 - x0) * curviness;
  const topStart = yc0 - w0 / 2;
  const botStart = yc0 + w0 / 2;
  const topEnd = yc1 - w1 / 2;
  const botEnd = yc1 + w1 / 2;
  return `M ${x0} ${topStart} C ${x0 + dx} ${topStart}, ${x1 - dx} ${topEnd}, ${x1} ${topEnd} L ${x1} ${botEnd} C ${x1 - dx} ${botEnd}, ${x0 + dx} ${botStart}, ${x0} ${botStart} Z`;
}

export function AuditFlowDiagram({
  testsRun,
  filesScanned,
  filesSelected,
  filesAudited,
  maxTestsRun,
  maxFilesScanned,
  riskBadge,
}: AuditFlowDiagramProps) {
  const l1Pct = reductionPct(filesScanned, filesSelected);
  const riskHex = severityHex(riskBadge);

  const filesW0 = scaleWidth(filesScanned, maxFilesScanned);
  const filesW1 = scaleWidth(filesSelected, maxFilesScanned);
  const testsW = testsRun !== undefined ? scaleWidth(testsRun, maxTestsRun) : 0;

  const mergedW = Math.max(filesW1, testsW || filesW1 * 0.5) * 0.85;

  const filesPath = taperBand(10, 30, filesW0, 340, 65, filesW1 * 0.85);
  const testsPath = testsRun !== undefined ? taperBand(10, 96, testsW, 340, 65, testsW * 0.85) : null;
  const outputPath = taperBand(340, 65, mergedW, 500, 65, mergedW);

  const gradId = `flow-${riskBadge}-${filesScanned}-${filesSelected}`;

  return (
    <div>
      <svg viewBox="0 0 520 130" preserveAspectRatio="none" className="h-[100px] w-full sm:h-[120px]" aria-hidden>
        <defs>
          <linearGradient id={`${gradId}-files`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ORANGE} stopOpacity={0.5} />
            <stop offset="100%" stopColor={FRAKTUR_ORANGE} stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id={`${gradId}-tests`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ORANGE_DIM} stopOpacity={0.35} />
            <stop offset="100%" stopColor={FRAKTUR_ORANGE_DIM} stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id={`${gradId}-merge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ORANGE} />
            <stop offset="100%" stopColor={riskHex} />
          </linearGradient>
        </defs>

        {testsPath && <path d={testsPath} fill={`url(#${gradId}-tests)`} />}
        <path d={filesPath} fill={`url(#${gradId}-files)`} />
        <path d={outputPath} fill={`url(#${gradId}-merge)`} />

        {!testsPath && (
          <path
            d={taperBand(10, 96, 10, 340, 65, 6)}
            fill="none"
            stroke={FRAKTUR_MUTED}
            strokeOpacity={0.4}
            strokeDasharray="3 4"
          />
        )}

        {/* Files lane labels */}
        <text x="12" y="20" fontSize="11" fontWeight={600} fill={FRAKTUR_TEXT}>
          {filesScanned.toLocaleString("en-US")} files
        </text>
        <text x="248" y="52" fontSize="11" fontWeight={700} fill={FRAKTUR_TEXT}>
          {filesSelected.toLocaleString("en-US")} selected
        </text>
        <text x="248" y="66" fontSize="10" fill={FRAKTUR_ORANGE}>
          -{l1Pct}% noise cut
        </text>

        {/* Tests lane label */}
        {testsRun !== undefined ? (
          <text x="12" y="110" fontSize="11" fontWeight={600} fill={FRAKTUR_TEXT}>
            {testsRun} dynamic tests
          </text>
        ) : (
          <text x="12" y="110" fontSize="10" fill={FRAKTUR_MUTED}>
            No dynamic test data yet
          </text>
        )}

        {/* Output label */}
        <text x="352" y="60" fontSize="11" fontWeight={700} fill={FRAKTUR_TEXT}>
          Findings
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="shrink-0 text-fraktur-muted">Audited</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: FRAKTUR_BORDER }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max((filesAudited / Math.max(filesSelected, 1)) * 100, filesAudited > 0 ? 3 : 0)}%`,
              backgroundColor: FRAKTUR_ORANGE,
            }}
          />
        </div>
        <span className="shrink-0 font-semibold text-fraktur-text">
          {filesAudited}/{filesSelected}
        </span>
      </div>
    </div>
  );
}
