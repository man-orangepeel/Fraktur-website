export type WalletStatus = "In progress" | "Completed";

export type Severity = "Critical" | "High" | "Medium" | "Low";

// "Declared Fixed" — the team says it's fixed; free, but not independently
// re-scanned. "Verified Fixed" — FRAKTUR re-ran Layer 1+2 and confirmed the
// fix holds; this is the paid re-verification product (see WEBSITE_BRIEF.md
// §16 / HOME_UX_SPEC.md §6) and gets a visually stronger badge.
export type FindingStatus = "Open" | "Declared Fixed" | "Verified Fixed";

export interface Finding {
  id: string;
  walletId: string;
  cwe?: string;
  title: string;
  severity: Severity;
  status?: FindingStatus;
  disclosureUrl?: string;
}

// One audit round for a wallet. `findingIds` points into that wallet's own
// `findings` array rather than duplicating finding data. A round only
// becomes visible in detail once `publiclyDisclosed` is true (fix shipped
// or the embargo window lapsed) — until then the UI shows a responsible-
// disclosure placeholder instead of the finding detail.
export interface AuditHistoryEntry {
  date: string; // ISO date this round was performed
  version: string; // audit tool version used for this round
  publiclyDisclosed: boolean;
  disclosureDate?: string; // ISO date this round is/was cleared for public detail
  findingIds: string[];
}

export interface Wallet {
  id: string;
  name: string;
  repoUrl?: string;
  iconInitials?: string; // 1-2 letter monogram shown before the name (real logo art not embedded — see icon note)
  iconColor?: string; // approximate real-world brand color for the monogram avatar
  status: WalletStatus;
  lastReviewDate: string; // ISO date
  auditToolVersion: string;
  otsHash?: string;
  otsProofUrl?: string;
  testsRun?: number; // dynamic: deterministic regtest/mainnet + LLM fuzz tests run pre-Loupe (optional — not yet in Airtable)
  filesScanned: number; // Layer 1 input
  filesSelected: number; // Layer 1 output
  filesAudited: number; // Layer 2 progress (out of filesSelected)
  riskBadge: Severity | "None";
  findings: Finding[];
  auditHistory?: AuditHistoryEntry[]; // optional — not yet in Airtable for real wallets
  published: boolean;
}

export type SupporterTier = "Supporter" | "Backer" | "Patron";

export interface Supporter {
  handle: string; // X handle or Nostr npub, as entered
  network: "x" | "nostr" | "unknown";
  totalSats: number; // verified total only — never a self-reported number
  tier: SupporterTier;
  lastDonationDate: string; // ISO date
  activeLast30Days: boolean;
  galleryEligible: boolean;
}

export interface SiteSettings {
  galleryThresholdSats: number; // 212121, confirmed
  activeWindowDays: number; // 30, confirmed
}

export type AllocationChoice = "Product Dev" | "Specific Wallet" | "Team";
