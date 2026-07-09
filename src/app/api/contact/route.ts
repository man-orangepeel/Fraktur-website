import { NextRequest, NextResponse } from "next/server";
import { airtableConfigured, createLead } from "@/lib/airtable";

/**
 * Every pricing-tier CTA and the final "Talk to us" button on /companies
 * post here now, instead of opening a mailto: link — see WEBSITE_BRIEF.md §19
 * (forms rationalization: one Airtable-backed lead pipeline for every
 * conversion-intent CTA, not a mix of Airtable forms and bare mailto links).
 * Same graceful-fallback shape as /api/apply-free-scan: never silently
 * pretend success, never crash generically if Airtable isn't configured yet.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, tierInterest, walletContext, interestedWallets, message } = body;

    if (!name || !email || !company) {
      return NextResponse.json({ error: "name, email, and company are required" }, { status: 400 });
    }

    if (!airtableConfigured()) {
      return NextResponse.json(
        {
          error:
            "Leads aren't wired up to a database yet — please email contact@fraktur.io directly in the meantime.",
        },
        { status: 503 }
      );
    }

    await createLead({ name, email, company, tierInterest, walletContext, interestedWallets, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact/lead submission failed:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your request. Please try again." },
      { status: 500 }
    );
  }
}
