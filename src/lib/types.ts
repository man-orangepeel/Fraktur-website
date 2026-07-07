export type WalletStatus = "In progress" | "Completed";

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface Finding {
  id: string;
  walletId: string;
  cwe?: string;
  title: string;
  severity: Severity;
  status?: "Open" | "Fixed";
  disclosureUrl?: string;
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
