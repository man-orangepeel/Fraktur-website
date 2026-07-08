import { NextRequest, NextResponse } from "next/server";
import { airtableConfigured, createFreeScanApplication } from "@/lib/airtable";

/**
 * Queues a free-scan application for manual review — see WEBSITE_BRIEF.md
 * §17. This route never triggers a scan and never auto-approves anything;
 * it only writes a Pending row. The 5/month cap is a human decision made by
 * reviewing the Airtable table, not logic enforced here — the whole point
 * of qualification-by-form is that a person looks at every request before
 * FRAKTUR commits Layer 2 + PoC + review time to it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl, contactEmail, projectName, teamSize, note } = body;

    if (!repoUrl || !contactEmail) {
      return NextResponse.json({ error: "repoUrl and contactEmail are required" }, { status: 400 });
    }

    if (!airtableConfigured()) {
      // No Airtable base connected yet — don't silently pretend this
      // succeeded. Tell the caller exactly what to do instead so no
      // application is ever lost.
      return NextResponse.json(
        {
          error:
            "Applications aren't wired up to a database yet — please email contact@fraktur.io with your repo URL directly in the meantime.",
        },
        { status: 503 }
      );
    }

    await createFreeScanApplication({ repoUrl, contactEmail, projectName, teamSize, note });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apply-free-scan failed:", err);
    return NextResponse.json({ error: "Something went wrong submitting your application. Please try again." }, { status: 500 });
  }
}
