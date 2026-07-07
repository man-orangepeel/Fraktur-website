"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useDonation } from "./DonationContext";
import type { AllocationChoice } from "@/lib/types";

/**
 * No amount field anywhere in this form — see WEBSITE_BRIEF.md §7. The donor
 * names their own allocation preference and identity, submits, and is handed
 * a BTCPay-hosted checkout (opened as an in-page modal via BTCPay's own
 * btcpay.js, so the drawer never navigates away). The amount that ends up on
 * the donor's public record is whatever BTCPay's webhook later confirms was
 * actually paid — never anything typed into this form.
 */
export function DonationDrawer({ walletOptions }: { walletOptions: { id: string; name: string }[] }) {
  const { isOpen, close, prefill } = useDonation();
  const [allocation, setAllocation] = useState<AllocationChoice>(prefill.allocationChoice || "Product Dev");
  const [selectedWallets, setSelectedWallets] = useState<string[]>(prefill.walletId ? [prefill.walletId] : []);
  const [newWallet, setNewWallet] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [nostrNpub, setNostrNpub] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      setAllocation(prefill.allocationChoice || "Product Dev");
      setSelectedWallets(prefill.walletId ? [prefill.walletId] : []);
    }
  }, [isOpen, prefill]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/donate/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allocationChoice: allocation,
          walletRecordIds: allocation === "Specific Wallet" ? selectedWallets : undefined,
          newWalletSuggestion: allocation === "Specific Wallet" ? newWallet || undefined : undefined,
          xHandle: xHandle || undefined,
          nostrNpub: nostrNpub || undefined,
          consentToPublicGallery: consent,
        }),
      });
      if (!res.ok) throw new Error("invoice creation failed");
      const { checkoutLink } = await res.json();

      // Open BTCPay's hosted checkout as an in-page modal (btcpay.js), so the
      // donor never leaves this page. Falls back to a new tab if the script
      // hasn't loaded yet for some reason.
      const win = window as any;
      if (win.btcpay?.showInvoice) {
        win.btcpay.showInvoice(checkoutLink);
      } else {
        window.open(checkoutLink, "_blank");
      }
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <>
      <Script src={`${process.env.NEXT_PUBLIC_BTCPAY_URL}/modal/btcpay.js`} strategy="lazyOnload" />

      {/* Backdrop keeps page content visible/scrollable behind it, per the
          founder's explicit call to avoid a full dimmed modal (trust-sensitive
          audience — see WEBSITE_BRIEF.md §5). */}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={close}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-fraktur-border bg-fraktur-panel p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-xl font-semibold text-fraktur-text">Support FRAKTUR</h3>
            <button onClick={close} className="text-fraktur-muted hover:text-fraktur-text" aria-label="Close">
              ✕
            </button>
          </div>

          <p className="mb-5 rounded-lg bg-fraktur-bg p-3 text-sm text-fraktur-muted">
            Donations fund a public good (open Bitcoin security). This is a tip, not an investment — no
            equity, no token, no expectation of return. The &ldquo;Team&rdquo; option is a direct tip to
            contributors, not a salary or invoice payment.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fraktur-text">Where should this go?</legend>
              <div className="space-y-2 text-sm">
                {(
                  [
                    ["Product Dev", "Product development — we decide between dev and audit work"],
                    ["Specific Wallet", "Audit a specific wallet — pick one below, or suggest a new one"],
                    ["Team", "Team — direct tips to contributors"],
                  ] as [AllocationChoice, string][]
                ).map(([value, label]) => (
                  <label key={value} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="allocation"
                      checked={allocation === value}
                      onChange={() => setAllocation(value)}
                      className="mt-1"
                    />
                    <span className="text-fraktur-text">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {allocation === "Specific Wallet" && (
              <div className="space-y-2 rounded-lg border border-fraktur-border p-3">
                <label className="block text-xs text-fraktur-muted">Pick from published wallets</label>
                <select
                  multiple
                  value={selectedWallets}
                  onChange={(e) => setSelectedWallets(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text"
                >
                  {walletOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <label className="block text-xs text-fraktur-muted">Or suggest a wallet not listed yet</label>
                <input
                  value={newWallet}
                  onChange={(e) => setNewWallet(e.target.value)}
                  placeholder="Wallet name / repo URL"
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-fraktur-muted">X handle (optional)</label>
                <input
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@you"
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-fraktur-muted">Nostr npub (optional)</label>
                <input
                  value={nostrNpub}
                  onChange={(e) => setNostrNpub(e.target.value)}
                  placeholder="npub1…"
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-fraktur-text">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              I&rsquo;d like to appear in the public supporters gallery if my total reaches the threshold.
            </label>

            <p className="text-xs text-fraktur-muted">
              Only supporters whose total donations reach 212,121 sats appear in the public gallery. This
              is verified automatically once BTCPay confirms your payment — there&rsquo;s no amount to type
              in below.
            </p>

            <p className="text-xs text-fraktur-muted">
              Your allocation choice is a preference, not a binding contract — FRAKTUR keeps final judgment
              on audit prioritization to avoid pay-to-audit conflicts of interest.
            </p>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-fraktur-orange py-2.5 font-semibold text-black transition hover:bg-fraktur-orangeDim disabled:opacity-50"
            >
              {status === "loading" ? "Preparing your invoice…" : "Continue to payment ⚡"}
            </button>
            {status === "error" && (
              <p className="text-sm text-risk-critical">Something went wrong creating the invoice. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
