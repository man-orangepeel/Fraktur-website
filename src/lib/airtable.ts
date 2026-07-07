// Server-side only. Never import this from a "use client" component —
// the API key must never reach the browser bundle.
import type { Finding, Severity, Supporter, SupporterTier } from "./types";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

function airtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
}

async function airtableFetch(table: string, params: string = "") {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const url = `${AIRTABLE_API_BASE}/${baseId}/${encodeURIComponent(table)}${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    // Revalidate periodically rather than caching forever or refetching every request.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Airtable request failed (${res.status}): ${table}`);
  }
  return res.json();
}

interface AirtableRecord<T> {
  id: string;
  fields: T;
}

export { airtableConfigured, airtableFetch };
export type { AirtableRecord };

// --- Findings ------------------------------------------------------------
// Findings are the source of truth for per-wallet vulnerability detail and
// severity counts. Counts are computed here in code rather than via Airtable
// rollup formulas, which keeps the "5 findings by severity" logic simple and
// visible instead of buried in spreadsheet formulas.

interface FindingFields {
  "Wallet"?: string[]; // linked record id(s)
  "CWE"?: string;
  "Title"?: string;
  "Severity"?: Severity;
  "Status"?: "Open" | "Fixed";
  "Disclosure URL"?: string;
}

export async function fetchFindingsForWallet(walletRecordId: string): Promise<Finding[]> {
  const table = process.env.AIRTABLE_TABLE_FINDINGS || "Findings";
  const filter = encodeURIComponent(`FIND('${walletRecordId}', ARRAYJOIN({Wallet}))`);
  const data = await airtableFetch(table, `?filterByFormula=${filter}`);
  const records: AirtableRecord<FindingFields>[] = data.records || [];
  return records.map((r) => ({
    id: r.id,
    walletId: walletRecordId,
    cwe: r.fields["CWE"],
    title: r.fields["Title"] || "Untitled finding",
    severity: (r.fields["Severity"] as Severity) || "Low",
    status: r.fields["Status"],
    disclosureUrl: r.fields["Disclosure URL"],
  }));
}

// --- Supporters ------------------------------------------------------------
// Supporters is an aggregation table (rollups over Donations, see WEBSITE_BRIEF.md
// §4.2). Total Sats here is the BTCPay-verified sum ONLY — donations that never
// got a payment-confirmed webhook do not count toward it.

interface SupporterFields {
  Handle?: string;
  Network?: "x" | "nostr";
  "Total Sats"?: number;
  "Last Donation Date"?: string;
  "Active Last 30 Days"?: boolean;
  "Gallery Eligible"?: boolean;
}

function tierForAmount(sats: number, threshold: number): SupporterTier {
  if (sats >= threshold * 10) return "Patron";
  if (sats >= threshold * 2) return "Backer";
  return "Supporter";
}

export async function fetchSupporters(galleryThreshold: number): Promise<Supporter[]> {
  const table = process.env.AIRTABLE_TABLE_SUPPORTERS || "Supporters";
  const filter = encodeURIComponent("{Gallery Eligible} = TRUE()");
  const data = await airtableFetch(table, `?filterByFormula=${filter}`);
  const records: AirtableRecord<SupporterFields>[] = data.records || [];
  return records.map((r) => {
    const total = r.fields["Total Sats"] || 0;
    return {
      handle: r.fields.Handle || "anonymous",
      network: (r.fields.Network as Supporter["network"]) || "unknown",
      totalSats: total,
      tier: tierForAmount(total, galleryThreshold),
      lastDonationDate: r.fields["Last Donation Date"] || "",
      activeLast30Days: Boolean(r.fields["Active Last 30 Days"]),
      galleryEligible: Boolean(r.fields["Gallery Eligible"]),
    };
  });
}

// --- Settings ------------------------------------------------------------

export async function fetchSettings(): Promise<{ galleryThresholdSats: number; activeWindowDays: number }> {
  const table = process.env.AIRTABLE_TABLE_SETTINGS || "Settings";
  const data = await airtableFetch(table, "?maxRecords=1");
  const record = (data.records || [])[0];
  return {
    galleryThresholdSats: record?.fields?.["Gallery Threshold (sats)"] ?? 212121,
    activeWindowDays: record?.fields?.["Active Window (days)"] ?? 30,
  };
}

// --- Donations ------------------------------------------------------------
// Two-step lifecycle, by design (see WEBSITE_BRIEF.md §7):
//   1. createPendingDonation() — written the moment the donor submits the
//      form, before any payment exists. Sats Amount is NOT set here; there is
//      no self-reported amount field anywhere in this flow anymore.
//   2. markDonationSettled() — called only from the BTCPay webhook handler,
//      after the signature has been verified, with the amount BTCPay itself
//      reports as received. This is the only path that ever sets Sats Amount
//      or Approved.

interface CreateDonationInput {
  orderId: string;
  allocationChoice: "Product Dev" | "Specific Wallet" | "Team";
  walletRecordIds?: string[];
  newWalletSuggestion?: string;
  xHandle?: string;
  nostrNpub?: string;
  consentToPublicGallery: boolean;
}

export async function createPendingDonation(input: CreateDonationInput): Promise<string> {
  const table = process.env.AIRTABLE_TABLE_DONATIONS || "Donations";
  const res = await fetch(`${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        "Order ID": input.orderId,
        "Allocation Choice": input.allocationChoice,
        ...(input.walletRecordIds ? { "Wallet(s) Selected": input.walletRecordIds } : {}),
        ...(input.newWalletSuggestion ? { "New Wallet Suggestion": input.newWalletSuggestion } : {}),
        ...(input.xHandle ? { "X Handle": input.xHandle } : {}),
        ...(input.nostrNpub ? { "Nostr npub": input.nostrNpub } : {}),
        "Consent to Public Gallery": input.consentToPublicGallery,
        "Payment Verified": false,
        Approved: false,
      },
    }),
  });
  if (!res.ok) throw new Error(`Airtable createPendingDonation failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.id as string;
}

export async function findDonationByOrderId(orderId: string) {
  const table = process.env.AIRTABLE_TABLE_DONATIONS || "Donations";
  const filter = encodeURIComponent(`{Order ID} = '${orderId}'`);
  const data = await airtableFetch(table, `?filterByFormula=${filter}&maxRecords=1`);
  return (data.records || [])[0] || null;
}

/**
 * Called ONLY after verifyBtcPaySignature() has passed. Writes the amount
 * BTCPay itself reports — never a value supplied by the client — and flips
 * Payment Verified + Approved. This is the entire fix for the self-reported-
 * amount gap: there is no code path left that lets a browser-supplied number
 * become the Sats Amount on a Donation record.
 */
export async function markDonationSettled(donationRecordId: string, verifiedSats: number) {
  const table = process.env.AIRTABLE_TABLE_DONATIONS || "Donations";
  const res = await fetch(
    `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${donationRecordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          "Sats Amount": verifiedSats,
          "Payment Verified": true,
          Approved: true,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Airtable markDonationSettled failed (${res.status}): ${await res.text()}`);
}

// --- Wallets ------------------------------------------------------------

interface WalletFields {
  Name?: string;
  "Logo/Repo URL"?: string;
  Status?: string;
  "Last Review Date"?: string;
  "Audit Tool Version"?: string;
  "OpenTimestamp Hash"?: string;
  "OTS Proof URL"?: string;
  "Tests Run"?: number;
  "Files Scanned (L1 input)"?: number;
  "Files Selected (L1 output)"?: number;
  "Files Audited (L2 progress)"?: number;
  "Risk Badge"?: string;
  Published?: boolean;
}

export async function fetchPublishedWallets() {
  const table = process.env.AIRTABLE_TABLE_WALLETS || "Wallets";
  const filter = encodeURIComponent("{Published} = TRUE()");
  const data = await airtableFetch(table, `?filterByFormula=${filter}`);
  const records: AirtableRecord<WalletFields>[] = data.records || [];

  const wallets = await Promise.all(
    records.map(async (r) => {
      const findings = await fetchFindingsForWallet(r.id);
      return {
        id: r.id,
        name: r.fields.Name || "Unnamed wallet",
        repoUrl: r.fields["Logo/Repo URL"],
        status: (r.fields.Status as any) || "In progress",
        lastReviewDate: r.fields["Last Review Date"] || "",
        auditToolVersion: r.fields["Audit Tool Version"] || "",
        otsHash: r.fields["OpenTimestamp Hash"],
        otsProofUrl: r.fields["OTS Proof URL"],
        testsRun: r.fields["Tests Run"] || undefined,
        filesScanned: r.fields["Files Scanned (L1 input)"] || 0,
        filesSelected: r.fields["Files Selected (L1 output)"] || 0,
        filesAudited: r.fields["Files Audited (L2 progress)"] || 0,
        riskBadge: (r.fields["Risk Badge"] as any) || "None",
        published: Boolean(r.fields.Published),
        findings,
      };
    })
  );
  return wallets;
}
