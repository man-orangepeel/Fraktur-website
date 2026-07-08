"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationDrawer } from "@/components/DonationDrawer";

/**
 * The bounded, qualified version of "request a free scan" — see
 * WEBSITE_BRIEF.md §17. This is a queue, not a self-serve trigger: no scan
 * runs on submit. A person reviews every application before FRAKTUR commits
 * Layer 2 + PoC + human-review time to it, which is the actual fix for the
 * "unbounded free-audit cost center" risk the founder flagged.
 */
export default function ApplyPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/apply-free-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, contactEmail, projectName, teamSize, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <Header variant="companies" />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">Apply</p>
        <h1 className="mb-4 font-display text-3xl text-fraktur-text sm:text-4xl">Apply for a free scan.</h1>
        <p className="mb-8 text-fraktur-muted">
          This is a queue, not an instant trigger. We review every application — submitting doesn&rsquo;t start a
          scan.
        </p>

        {/* The rules, restated in full — this block is the actual point of
            the form, not a footnote. */}
        <div className="mb-10 space-y-3 rounded-2xl border border-fraktur-border bg-fraktur-panel p-5 text-sm text-fraktur-muted">
          <p className="font-semibold text-fraktur-text">How this works</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="text-fraktur-text">We take a maximum of 5 free scans per month.</span> We choose which
              applications to accept — this isn&rsquo;t first-come-first-served, and applying isn&rsquo;t a
              guarantee we&rsquo;ll pick yours, or a promise of a specific timeline.
            </li>
            <li>
              <span className="text-fraktur-text">What&rsquo;s included:</span> a full Layer 1 triage of your entire
              repo (every file), plus <span className="text-fraktur-text">one</span> finding disclosed to your team
              in full — exact file, function, and a working proof-of-concept — immediately and free.
            </li>
            <li>
              <span className="text-fraktur-text">What&rsquo;s not included:</span> the rest of what Layer 1 flags
              beyond that one finding. That&rsquo;s exactly what the{" "}
              <Link href="/companies#pricing" className="text-fraktur-electric hover:underline">
                Complete Findings Report or a subscription
              </Link>{" "}
              are for.
            </li>
            <li>
              Our{" "}
              <Link href="/legal" className="text-fraktur-electric hover:underline">
                disclosure policy
              </Link>{" "}
              applies as normal: your team always gets full detail immediately; anything made public is limited to
              existence + severity until you&rsquo;ve shipped a fix or a 90-day embargo lapses.
            </li>
          </ul>
        </div>

        {status === "done" ? (
          <div className="rounded-2xl border border-fraktur-electric bg-fraktur-electricDim/30 p-6 text-fraktur-text">
            <p className="font-display text-xl">You&rsquo;re in the queue.</p>
            <p className="mt-2 text-sm text-fraktur-muted">
              We review applications monthly. If we pick yours, we&rsquo;ll reach out at the email you gave us — no
              need to follow up in the meantime.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-fraktur-muted">Public repo URL *</label>
              <input
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-org/your-wallet"
                className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-fraktur-muted">Contact email *</label>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@yourproject.com"
                className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-fraktur-muted">Project / wallet name</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-fraktur-muted">Team size</label>
                <input
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-fraktur-muted">
                Anything that helps us prioritize (funds handled, users, why now)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-fraktur-orange py-2.5 font-semibold text-black transition hover:bg-fraktur-orangeDim disabled:opacity-50"
            >
              {status === "loading" ? "Submitting…" : "Submit application"}
            </button>
            {status === "error" && <p className="text-sm text-risk-critical">{errorMessage}</p>}
          </form>
        )}
      </main>

      <Footer />
      <DonationDrawer walletOptions={[]} />
    </>
  );
}
