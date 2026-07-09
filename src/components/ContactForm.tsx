"use client";

import { useState } from "react";
import type { Wallet } from "@/lib/types";

const TIER_LABELS: Record<string, string> = {
  reverify: "Targeted re-verification",
  report: "Complete Findings Report",
  subscribe: "Continuous coverage",
};

export function ContactForm({
  wallets,
  initialTier,
  preselectedWallet,
}: {
  wallets: Wallet[];
  initialTier?: string;
  preselectedWallet?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [tierInterest, setTierInterest] = useState(initialTier || "");
  const [message, setMessage] = useState("");
  const [interestedWallets, setInterestedWallets] = useState<string[]>(() => {
    const match = wallets.find((w) => w.name === preselectedWallet);
    return match ? [match.name] : [];
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleWallet(walletName: string) {
    setInterestedWallets((prev) => (prev.includes(walletName) ? prev.filter((n) => n !== walletName) : [...prev, walletName]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          tierInterest,
          walletContext: preselectedWallet,
          interestedWallets,
          message,
        }),
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
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fraktur-orange">Talk to us</p>
      <h1 className="mb-4 font-display text-3xl text-fraktur-text sm:text-4xl">
        {tierInterest && TIER_LABELS[tierInterest] ? `${TIER_LABELS[tierInterest]} — let's talk.` : "Tell us what you need."}
      </h1>
      <p className="mb-8 text-fraktur-muted">
        A person reads every request here, usually within a day or two — no auto-reply pretending this is a support
        queue.
      </p>

      {status === "done" ? (
        <div className="rounded-2xl border border-fraktur-electric bg-fraktur-electricDim/30 p-6 text-fraktur-text">
          <p className="font-display text-xl">Got it.</p>
          <p className="mt-2 text-sm text-fraktur-muted">We&rsquo;ll get back to you at the email you gave us.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-fraktur-muted">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fraktur-muted">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fraktur-muted">Company / project *</label>
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
            />
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
            <label className="mb-1 block text-xs text-fraktur-muted">What are you interested in?</label>
            <select
              value={tierInterest}
              onChange={(e) => setTierInterest(e.target.value)}
              className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
            >
              <option value="">Not sure yet — just talk</option>
              <option value="reverify">Targeted re-verification</option>
              <option value="report">Complete Findings Report</option>
              <option value="subscribe">Continuous coverage</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-fraktur-muted">Anything else that helps</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-fraktur-border bg-fraktur-panel p-2.5 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-fraktur-orange py-2.5 font-semibold text-black transition hover:bg-fraktur-orangeDim disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : "Send"}
          </button>
          {status === "error" && <p className="text-sm text-risk-critical">{errorMessage}</p>}
        </form>
      )}
    </>
  );
}
