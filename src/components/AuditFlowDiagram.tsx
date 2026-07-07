import type { Finding, Severity } from "@/lib/types";
import { reductionPct, severityHex } from "@/lib/format";

const FRAKTUR_ELECTRIC = "#3b6fed";
const FRAKTUR_ELECTRIC_DIM = "#1b2a5c";
const FRAKTUR_TEXT = "#e6e9ee";
const FRAKTUR_MUTED = "#8a94a3";
const FRAKTUR_BORDER = "#1c232c";
const SEVERITY_NONE_HEX = "#3ba55d";

export interface AuditFlowDiagramProps {
  testsRun?: number;
  filesScanned: number;
  filesSelected: number;
  filesAudited: number;
  maxTestsRun: number;
  maxFilesScanned: number;
  findings: Finding[];
}

const SEVERITY_RANK: Record<Severity, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };

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

const RIGHT_EDGE = 496;
const MAX_BLOCKS = 10;
const BLOCK_W = 14;
const GAP = 3;
const DOT_R = 3.2;
const DOT_STEP = 8;
const MIN_MERGE_X = 140; // floor so the ribbons never fully disappear when there's just one block

export function AuditFlowDiagram({
  testsRun,
  filesScanned,
  filesSelected,
  filesAudited,
  maxTestsRun,
  maxFilesScanned,
  findings,
}: AuditFlowDiagramProps) {
  const l1Pct = reductionPct(filesScanned, filesSelected);

  const filesW0 = scaleWidth(filesScanned, maxFilesScanned);
  const filesW1 = scaleWidth(filesSelected, maxFilesScanned);
  const testsW = testsRun !== undefined ? scaleWidth(testsRun, maxTestsRun) : 0;

  const mergedW = Math.max(filesW1, testsW || filesW1 * 0.5) * 0.85;

  const totalFindings = findings.length;

  // Keep the 10 most severe findings (Critical first); anything beyond that
  // is summarized as a dot-run rather than shrunk to fit.
  const sortedDesc = [...findings].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  const kept = sortedDesc.slice(0, MAX_BLOCKS);
  const overflowCount = Math.max(totalFindings - MAX_BLOCKS, 0);
  const displaySeverities: (Severity | "None")[] =
    totalFindings === 0 ? ["None"] : [...kept].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]).map((f) => f.severity);

  const blocksTotalWidth = displaySeverities.length * BLOCK_W + (displaySeverities.length - 1) * GAP;
  const dotsSpace = overflowCount > 0 ? 3 * DOT_STEP + GAP * 2 : 0;

  // The fusion point sits just before the leftmost block (or dot-run) —
  // its width adjusts to how many vulnerabilities there are, it isn't fixed.
  const mergeStartX = Math.max(RIGHT_EDGE - blocksTotalWidth - dotsSpace, MIN_MERGE_X);
  const blocksStartX = RIGHT_EDGE - blocksTotalWidth;
  const blocks = displaySeverities.map((sev, i) => ({ x: blocksStartX + i * (BLOCK_W + GAP), sev }));
  const dotsX = overflowCount > 0 ? mergeStartX + GAP : null;

  const filesPath = taperBand(10, 30, filesW0, mergeStartX, 65, filesW1 * 0.85);
  const testsPath = testsRun !== undefined ? taperBand(10, 96, testsW, mergeStartX, 65, testsW * 0.85) : null;
  // Width now equals exactly what's needed to reach the blocks — the fusion
  // rectangle hugs its content instead of always spanning the full card.
  const mergePath = taperBand(mergeStartX, 65, mergedW, RIGHT_EDGE + 4, 65, mergedW);

  const auditPct = filesSelected > 0 ? (filesAudited / filesSelected) * 100 : 0;
  const isComplete = filesSelected > 0 && filesAudited >= filesSelected;
  const gaugeFill = isComplete ? SEVERITY_NONE_HEX : FRAKTUR_ELECTRIC;

  const gradId = `flow-${filesScanned}-${filesSelected}-${totalFindings}`;

  return (
    <div>
      <svg viewBox="0 0 520 130" preserveAspectRatio="none" className="h-[100px] w-full sm:h-[120px]" aria-hidden>
        <defs>
          <linearGradient id={`${gradId}-files`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ELECTRIC} stopOpacity={0.5} />
            <stop offset="100%" stopColor={FRAKTUR_ELECTRIC} stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id={`${gradId}-tests`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ELECTRIC_DIM} stopOpacity={0.5} />
            <stop offset="100%" stopColor={FRAKTUR_ELECTRIC_DIM} stopOpacity={0.85} />
          </linearGradient>
        </defs>

        {testsPath && <path d={testsPath} fill={`url(#${gradId}-tests)`} />}
        <path d={filesPath} fill={`url(#${gradId}-files)`} />
        {/* Always full width, independent of finding count. */}
        <path d={mergePath} fill={FRAKTUR_ELECTRIC} />

        {!testsPath && (
          <path
            d={taperBand(10, 96, 10, mergeStartX, 65, 6)}
            fill="none"
            stroke={FRAKTUR_MUTED}
            strokeOpacity={0.4}
            strokeDasharray="3 4"
          />
        )}

        {/* Up to 10 fixed-width blocks, most severe kept, ordered low (left)
            -> critical (right), right-aligned to the card edge. Anything
            beyond 10 collapses into a dot-run just before the first block —
            the fusion rectangle's width adjusts to reach exactly there. */}
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={65 - 15} width={BLOCK_W} height={30} rx={2} fill={severityHex(b.sev)} />
        ))}
        {dotsX !== null &&
          [0, 1, 2].map((j) => <circle key={j} cx={dotsX + j * DOT_STEP} cy={65} r={DOT_R} fill={FRAKTUR_TEXT} opacity={0.9} />)}

        {/* Files lane label */}
        <text x="12" y="20" fontSize="11" fontWeight={600} fill={FRAKTUR_TEXT}>
          {filesScanned.toLocaleString("en-US")} files
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

        {/* Right edge pinned to the leftmost finding block's own left edge
            (== the fusion point when there's no overflow dot-run), in the
            strip above both ribbons — by the time the ribbons reach that x
            they've already narrowed well below y=20, so this never overlaps
            the traits. */}
        <text x={blocksStartX - 6} y="20" textAnchor="end" fontSize="11" fontWeight={700} fill={FRAKTUR_ELECTRIC}>
          -{l1Pct}% noise cut
        </text>

        {/* Same layout/weight as the "files" label, right-aligned to match
            the blocks' own right edge, sitting just above them. */}
        <text x={RIGHT_EDGE} y="44" textAnchor="end" fontSize="11" fontWeight={600} fill={FRAKTUR_TEXT}>
          {totalFindings === 0 ? "0 findings" : `${totalFindings} finding${totalFindings === 1 ? "" : "s"}`}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="shrink-0 text-fraktur-muted">Audited</span>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full border"
          style={{ backgroundColor: FRAKTUR_BORDER, borderColor: FRAKTUR_ELECTRIC }}
        >
          <div
            className="h-full rounded-full transition-colors"
            style={{
              width: `${Math.max(auditPct, filesAudited > 0 ? 3 : 0)}%`,
              backgroundColor: gaugeFill,
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
