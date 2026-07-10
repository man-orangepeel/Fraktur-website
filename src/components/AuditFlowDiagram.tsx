/**
 * Single-lane funnel: files scanned -> files deep-read -> findings by
 * severity. Used per-wallet (Home wallet cards, /wallets/[slug], Companies
 * hero preview) — this is deliberately narrower in scope than the 4-stage
 * methodology explainer on /companies (see that page's "How FRAKTUR works"
 * section), because stages 1-2 of the pipeline don't vary wallet to wallet;
 * only the file funnel and the findings do, so that's what this diagram
 * exists to show, as clearly as possible.
 *
 * Previously had a second "tests run" lane. Dropped (2026-07-10): that
 * number isn't backed by real per-wallet data yet (see Wallet.testsRun's own
 * comment — "not yet in Airtable for real wallets"), and the one concrete
 * "test count" in the real pipeline results (108) is FRAKTUR's own CI suite,
 * not a per-wallet metric. Displaying it would have been inventing a figure.
 */
import type { Finding, Severity } from "@/lib/types";
import { severityHex } from "@/lib/format";

const FRAKTUR_ELECTRIC = "#3b6fed";
const FRAKTUR_TEXT = "#e6e9ee";
const FRAKTUR_MUTED = "#8a94a3";

export interface AuditFlowDiagramProps {
  filesScanned: number;
  filesSelected: number;
  // Accepted (but unused) for backward compatibility with existing call
  // sites — the audited/selected progress gauge that used to read this
  // moved to WalletList's own "Fact 2" status pill instead.
  filesAudited?: number;
  maxFilesScanned: number;
  findings: Finding[];
}

const SEVERITY_RANK: Record<Severity, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };

function scaleWidth(value: number, max: number, min = 8, cap = 56): number {
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
const MIN_MERGE_X = 150; // floor so the ribbon never fully disappears when there's just one block

export function AuditFlowDiagram({ filesScanned, filesSelected, maxFilesScanned, findings }: AuditFlowDiagramProps) {
  const filesW0 = scaleWidth(filesScanned, maxFilesScanned);
  const filesW1 = scaleWidth(filesSelected, maxFilesScanned);
  const mergedW = filesW1 * 0.85;

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

  // The fusion point sits just before the leftmost block (or dot-run) — its
  // width adjusts to how many vulnerabilities there are, it isn't fixed.
  const mergeStartX = Math.max(RIGHT_EDGE - blocksTotalWidth - dotsSpace, MIN_MERGE_X);
  const blocksStartX = RIGHT_EDGE - blocksTotalWidth;
  const blocks = displaySeverities.map((sev, i) => ({ x: blocksStartX + i * (BLOCK_W + GAP), sev }));
  const dotsX = overflowCount > 0 ? mergeStartX + GAP : null;

  const CENTER_Y = 54;

  const filesPath = taperBand(10, CENTER_Y, filesW0, mergeStartX, CENTER_Y, filesW1 * 0.85);
  const mergePath = taperBand(mergeStartX, CENTER_Y, mergedW, RIGHT_EDGE + 4, CENTER_Y, mergedW);

  const gradId = `flow-${filesScanned}-${filesSelected}-${totalFindings}`;

  return (
    <div>
      <svg viewBox="0 0 520 100" preserveAspectRatio="none" className="h-[90px] w-full sm:h-[100px]" aria-hidden>
        <defs>
          <linearGradient id={`${gradId}-files`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={FRAKTUR_ELECTRIC} stopOpacity={0.5} />
            <stop offset="100%" stopColor={FRAKTUR_ELECTRIC} stopOpacity={0.95} />
          </linearGradient>
        </defs>

        <path d={filesPath} fill={`url(#${gradId}-files)`} />
        {/* Always full width, independent of finding count. */}
        <path d={mergePath} fill={FRAKTUR_ELECTRIC} />

        {/* Up to 10 fixed-width blocks, most severe kept, ordered low (left)
            -> critical (right), right-aligned to the card edge. Anything
            beyond 10 collapses into a dot-run just before the first block —
            the fusion rectangle's width adjusts to reach exactly there. */}
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={CENTER_Y - 15} width={BLOCK_W} height={30} rx={2} fill={severityHex(b.sev)} />
        ))}
        {dotsX !== null &&
          [0, 1, 2].map((j) => <circle key={j} cx={dotsX + j * DOT_STEP} cy={CENTER_Y} r={DOT_R} fill={FRAKTUR_TEXT} opacity={0.9} />)}

        {/* Files scanned — top left, the raw number the funnel starts from. */}
        <text x="12" y="18" fontSize="13" fontWeight={700} fill={FRAKTUR_TEXT}>
          {filesScanned.toLocaleString("en-US")} files
        </text>
        <text x="12" y="31" fontSize="10" fill={FRAKTUR_MUTED}>
          scanned
        </text>

        {/* Files selected — top right, just above the finding blocks. Raw
            count only (2026-07-10: dropped the "-X% noise cut" subtitle —
            the count itself is the clearer, less abstract number). */}
        <text x={blocksStartX - 6} y="18" textAnchor="end" fontSize="13" fontWeight={700} fill={FRAKTUR_TEXT}>
          {filesSelected.toLocaleString("en-US")} deep-read
        </text>

        {/* Findings — bottom right, under the severity blocks. */}
        <text x={RIGHT_EDGE} y="90" textAnchor="end" fontSize="13" fontWeight={700} fill={FRAKTUR_TEXT}>
          {totalFindings === 0 ? "0 findings" : `${totalFindings} finding${totalFindings === 1 ? "" : "s"}`}
        </text>
      </svg>
    </div>
  );
}
