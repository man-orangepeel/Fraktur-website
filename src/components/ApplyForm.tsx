"use client";

import { useState } from "react";
import type { Wallet } from "@/lib/types";

/**
 * The bounded, qualified version of "request a free scan" — see
 * WEBSITE_BRIEF.md §17. This is a queue, not a self-serve trigger: no scan
 * runs on submit. A person reviews every application before FRAKTUR commits
 * Layer 2 + PoC + human-review time to it, which is the actual fix for the
 * "unbounded free-audit cost center" risk the founder flagged.
 */
export function ApplyForm({ wallets, preselectedWallet }: { wallets: Wallet[]; preselectedWallet?: string }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [note, setNote] = useState("");
  const [interestedWallets, setInterestedWallets] = useState<string[]>(() => {
    const match = wallets.find((w) => w.name === preselectedWallet);
    return match ? [match.name] : [];
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleWallet(name: string) {
    setInterestedWallets((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/apply-free-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, contactEmail, projectName, teamSize, note, interestedWallets }),
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

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-fraktur-electric bg-fraktur-electricDim/30 p-6 text-fraktur-text">
        <p className="font-display text-xl">You&rsquo;re in the queue.</p>
        <p className="mt-2 text-sm text-fraktur-muted">
          We review applications monthly. If we pick yours, we&rsquo;ll reach out at the email you gave us — no need
          to follow up in the meantime.
        </p>
      </div>
    );
  }

  return (
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
          <label className="mb-1 block text-xs text-fraktur-muted">Company / project *</label>
          <input
            required
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

      {wallets.length > 0 && (
        <div>
          <label className="mb-1 block text-xs text-fraktur-muted">
            Which wallet(s) on the Wallet Watcher are you interested in? (optional)
          </label>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-fraktur-border p-2 pr-1">
            {wallets.map((w) => {
              const checked = interestedWallets.includes(w.name);
              return (
                <label
                  key={w.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-fraktur-electric bg-fraktur-electricDim/40 text-fraktur-text"
                      : "border-transparent bg-fraktur-bg text-fraktur-muted hover:border-fraktur-electricDim"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleWallet(w.name)}
                    className="accent-fraktur-electric"
                  />
                  {w.name}
                </label>
              );
            })}
          </div>
        </div>
      )}

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
  );
}
