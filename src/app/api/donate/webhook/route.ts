import { NextRequest, NextResponse } from "next/server";
import { verifyBtcPaySignature, type BtcPayWebhookEvent } from "@/lib/btcpay";
import { findDonationByOrderId, markDonationSettled } from "@/lib/airtable";

/**
 * Step 2 of the donation flow, and the actual fix for the self-reported-
 * amount problem (WEBSITE_BRIEF.md §7). Configure this URL as a webhook in
 * the BTCPay Server dashboard (Store Settings → Webhooks), subscribed at
 * minimum to "An invoice has been settled". BTCPay signs the payload with
 * BTCPAY_WEBHOOK_SECRET — we verify that signature before trusting anything
 * in the body, so a forged request can never inflate a donor's total.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("btcpay-sig");

  if (!verifyBtcPaySignature(rawBody, signature)) {
    console.warn("Rejected BTCPay webhook: invalid signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as BtcPayWebhookEvent;

  if (event.type !== "InvoiceSettled") {
    // Ignore every other event type (InvoiceCreated, InvoiceExpired, etc.) —
    // we only ever mark a donation Approved once funds are actually settled.
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const orderId = event.metadata?.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "missing orderId in webhook metadata" }, { status: 400 });
  }

  const donation = await findDonationByOrderId(orderId);
  if (!donation) {
    console.error(`No Donation record found for orderId ${orderId}`);
    return NextResponse.json({ error: "unknown orderId" }, { status: 404 });
  }

  // BTCPay's invoice payload carries the settled amount; in a full
  // implementation, fetch the invoice by event.invoiceId to read the exact
  // paid amount in sats rather than trusting a value on the webhook event
  // itself (kept as a follow-up — see README "Known gaps").
  const verifiedSats = await resolveSettledAmountSats(event.invoiceId);
  await markDonationSettled(donation.id, verifiedSats);

  // Linking this Donation to a Supporters row (find-or-create by handle) is
  // handled by an Airtable Automation triggered on "Payment Verified = true"
  // — see README.md "Airtable automations required" and WEBSITE_BRIEF.md §4.2.
  // Keeping that relational bookkeeping in Airtable, rather than in this
  // handler, matches the project's "editing rows is the update mechanism"
  // philosophy and avoids a second source of truth for supporter identity.

  return NextResponse.json({ ok: true });
}

async function resolveSettledAmountSats(invoiceId: string): Promise<number> {
  const { BTCPAY_URL, BTCPAY_API_KEY, BTCPAY_STORE_ID } = process.env;
  const res = await fetch(`${BTCPAY_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices/${invoiceId}`, {
    headers: { Authorization: `token ${BTCPAY_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Could not fetch settled invoice ${invoiceId}`);
  const invoice = await res.json();
  // BTCPay reports amount in the invoice's currency; when created in BTC we
  // convert back to sats. Adjust here if the store's default currency differs.
  const btc = parseFloat(invoice.amount);
  return Math.round(btc * 100_000_000);
}
