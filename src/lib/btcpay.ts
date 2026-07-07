// Server-side only. Talks to a self-hosted or managed BTCPay Server instance.
// This replaces the earlier "self-reported sats amount" design: the donor
// never types in an amount. Instead, we create a BTCPay invoice tagged with
// our own orderId, the donor pays it, and BTCPay's webhook tells us — with a
// verified signature — exactly how much actually arrived. See
// WEBSITE_BRIEF.md §7 for why this replaced the manual-approval flow.
import crypto from "crypto";

interface CreateInvoiceParams {
  orderId: string;
  amountSats?: number; // optional — donor may choose "pay what you want"
  metadata?: Record<string, unknown>;
}

export async function createBtcPayInvoice({ orderId, amountSats, metadata }: CreateInvoiceParams) {
  const { BTCPAY_URL, BTCPAY_API_KEY, BTCPAY_STORE_ID } = process.env;
  if (!BTCPAY_URL || !BTCPAY_API_KEY || !BTCPAY_STORE_ID) {
    throw new Error("BTCPay Server is not configured — set BTCPAY_URL / BTCPAY_API_KEY / BTCPAY_STORE_ID.");
  }

  // BTCPay's Greenfield API takes amount in the store's default currency, not
  // sats directly — for a sats-denominated donation flow we use the "BTC"
  // currency and convert, or omit amount entirely to let the donor name it on
  // BTCPay's own checkout page ("pay what you want").
  const body: Record<string, unknown> = {
    metadata: { orderId, ...metadata },
    checkout: { redirectURL: `${process.env.NEXT_PUBLIC_SITE_URL}/?donation=thanks` },
  };
  if (amountSats) {
    body.amount = (amountSats / 100_000_000).toFixed(8); // sats -> BTC
    body.currency = "BTC";
  }

  const res = await fetch(`${BTCPAY_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `token ${BTCPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`BTCPay invoice creation failed (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<{ id: string; checkoutLink: string }>;
}

/**
 * BTCPay signs webhook payloads with an HMAC-SHA256 of the raw request body,
 * using the per-webhook secret configured in the BTCPay dashboard. Verify it
 * before trusting anything in the payload — this is what makes the donation
 * amount trustworthy instead of self-reported.
 */
export function verifyBtcPaySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Minimal shape of the BTCPay "InvoiceSettled" webhook event we care about. */
export interface BtcPayWebhookEvent {
  type: string; // e.g. "InvoiceSettled"
  invoiceId: string;
  metadata?: { orderId?: string };
}
