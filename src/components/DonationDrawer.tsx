"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useDonation } from "./DonationContext";
import type { AllocationChoice } from "@/lib/types";

const ALLOCATIONS: [AllocationChoice, string][] = [
  ["Product Dev", "Product development"],
  ["Specific Wallet", "Audit a specific wallet"],
  ["Team", "Direct tips to the team"],
];

/**
 * No amount field anywhere in this form — see WEBSITE_BRIEF.md §7. The donor
 * names their own allocation preference and identity, submits, and is handed
 * a BTCPay-hosted checkout (opened as an in-page modal via BTCPay's own
 * btcpay.js, so the drawer never navigates away). The amount that ends up on
 * the donor's public record is whatever BTCPay's webhook later confirms was
 * actually paid — never anything typed into this form.
 *
 * v2 (UX pass): every disclosure line lives in one small-print block under
 * the submit button — nothing above the form competes with it for attention.
 * Selection states (allocation card, wallet chips) use the site's night-blue
 * accent (`fraktur-electric` / `electricDim`) rather than orange, keeping
 * orange reserved for the one action that matters: the submit button.
 *
 * v3: no allocation is preselected, ever — the founder's call was that even
 * arriving via a wallet card's "Help us go deeper" link shouldn't force
 * "Specific Wallet" as the answer before the donor has chosen anything. What
 * *is* carried over from that click is which wallet to pre-check — but only
 * once the donor picks "Specific Wallet" themselves; it stays dormant until
 * then. `prefill.allocationChoice` (still sent by WalletList.tsx) is
 * therefore deliberately ignored here rather than requiring a change on the
 * Home side.
 */
export function DonationDrawer({ walletOptions }: { walletOptions: { id: string; name: string }[] }) {
  const { isOpen, close, prefill } = useDonation();
  const [allocation, setAllocation] = useState<AllocationChoice | undefined>(undefined);
  const [selectedWallets, setSelectedWallets] = useState<string[]>(prefill.walletId ? [prefill.walletId] : []);
  const [newWallet, setNewWallet] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [nostrNpub, setNostrNpub] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "needs-allocation">("idle");

  useEffect(() => {
    if (isOpen) {
      // Deliberately NOT prefill.allocationChoice — see v3 note above. Only
      // the wallet selection is carried over, dormant until the donor picks
      // "Specific Wallet" on their own.
      setAllocation(undefined);
      setSelectedWallets(prefill.walletId ? [prefill.walletId] : []);
    }
  }, [isOpen, prefill]);

  if (!isOpen) return null;

  function toggleWallet(id: string) {
    setSelectedWallets((cur) => (cur.includes(id) ? cur.filter((w) => w !== id) : [...cur, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allocation) {
      setStatus("needs-allocation");
      return;
    }
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
          className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-fraktur-electricDim bg-fraktur-panel p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-start justify-between">
            <h3 className="text-xl font-semibold text-fraktur-text">Support FRAKTUR</h3>
            <button onClick={close} className="text-fraktur-muted hover:text-fraktur-text" aria-label="Close">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium text-fraktur-text">Where should this go?</legend>
              {ALLOCATIONS.map(([value, label]) => {
                const checked = allocation === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      checked
                        ? "border-fraktur-electric bg-fraktur-electricDim/40 text-fraktur-text"
                        : "border-fraktur-border text-fraktur-muted hover:border-fraktur-electricDim"
                    }`}
                  >
                    <input
                      type="radio"
                      name="allocation"
                      checked={checked}
                      onChange={() => setAllocation(value)}
                      className="accent-fraktur-electric"
                    />
                    {label}
                  </label>
                );
              })}
            </fieldset>

            {allocation === "Specific Wallet" && (
              <div className="space-y-3 rounded-lg border border-fraktur-border p-3">
                <p className="text-xs text-fraktur-muted">Published wallets</p>
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {walletOptions.map((w) => {
                    const checked = selectedWallets.includes(w.id);
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
                          onChange={() => toggleWallet(w.id)}
                          className="accent-fraktur-electric"
                        />
                        {w.name}
                      </label>
                    );
                  })}
                </div>
                <input
                  value={newWallet}
                  onChange={(e) => setNewWallet(e.target.value)}
                  placeholder="Or suggest one — name / repo URL"
                  className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                placeholder="X handle (optional)"
                className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
              />
              <input
                value={nostrNpub}
                onChange={(e) => setNostrNpub(e.target.value)}
                placeholder="Nostr npub (optional)"
                className="w-full rounded-md border border-fraktur-border bg-fraktur-bg p-2 text-sm text-fraktur-text focus:border-fraktur-electric focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-fraktur-text">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-fraktur-electric" />
              Show me in the public supporters gallery.
            </label>

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
            {status === "needs-allocation" && (
              <p className="text-sm text-risk-critical">Please choose where this should go, above.</p>
            )}

            <p className="text-xs leading-relaxed text-fraktur-muted">
              Donations are tips for open Bitcoin security — not an investment, equity, or salary; the
              &ldquo;Team&rdquo; option pays contributors directly, not as wages. Reaching 212,121 sats gets you
              into the public gallery. Your allocation is a preference, not a contract — FRAKTUR keeps final
              say on audit priority to avoid pay-to-audit conflicts.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
