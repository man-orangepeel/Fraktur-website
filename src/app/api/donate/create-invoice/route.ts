import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createBtcPayInvoice } from "@/lib/btcpay";
import { createPendingDonation } from "@/lib/airtable";

/**
 * Step 1 of the donation flow. The donor has just filled the allocation form
 * (no amount typed anywhere — see WEBSITE_BRIEF.md §7). We:
 *   1. Create a "pending" Donation record in Airtable with a fresh orderId.
 *   2. Ask BTCPay to create an invoice tagged with that same orderId.
 *   3. Return the checkout link/QR to the browser.
 * Nothing here is trusted as a final amount — that only happens in the
 * webhook handler once BTCPay confirms the payment actually settled.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { allocationChoice, walletRecordIds, newWalletSuggestion, xHandle, nostrNpub, consentToPublicGallery, amountSats } = body;

    if (!allocationChoice) {
      return NextResponse.json({ error: "allocationChoice is required" }, { status: 400 });
    }

    const orderId = randomUUID();

    const donationRecordId = await createPendingDonation({
      orderId,
      allocationChoice,
      walletRecordIds,
      newWalletSuggestion,
      xHandle,
      nostrNpub,
      consentToPublicGallery: Boolean(consentToPublicGallery),
    });

    const invoice = await createBtcPayInvoice({
      orderId,
      amountSats, // optional — omit to let the donor set the amount on BTCPay's own checkout page
      metadata: { donationRecordId },
    });

    return NextResponse.json({ checkoutLink: invoice.checkoutLink, invoiceId: invoice.id });
  } catch (err: any) {
    console.error("create-invoice failed:", err);
    return NextResponse.json({ error: "Could not create invoice. Please try again shortly." }, { status: 500 });
  }
}
