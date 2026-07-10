"use client";

import Image from "next/image";
import Link from "next/link";
import type { Supporter } from "@/lib/types";
import { useDonation } from "./DonationContext";
import { TickerBanner } from "./TickerBanner";

export function Header({ variant, supporters }: { variant: "home" | "companies"; supporters?: Supporter[] }) {
  const { open } = useDonation();

  // Absolute path + fragment — this header (variant="companies") is also
  // reused on /apply, where a bare "#problem" href would just tack the
  // fragment onto the current URL instead of navigating to the section.
  const companiesAnchors = [
    { href: "/companies#problem", label: "Problem" },
    { href: "/companies#solution", label: "Solution" },
    { href: "/companies#proof", label: "Proof" },
    { href: "/companies#pricing", label: "Pricing" },
    { href: "/companies#faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-fraktur-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-full.png" alt="FRAKTUR" width={320} height={64} priority className="h-16 w-auto sm:h-20" />
        </Link>

        {variant === "companies" && (
          <nav className="hidden items-center gap-6 text-sm text-fraktur-muted md:flex">
            {companiesAnchors.map((a) => (
              <Link key={a.href} href={a.href} className="hover:text-fraktur-text">
                {a.label}
              </Link>
            ))}
            <Link href="/" className="hover:text-fraktur-text">
              Wallet Watcher
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {variant === "home" && (
            <Link
              href="/companies"
              className="rounded-full border border-fraktur-electric bg-transparent px-4 py-1.5 text-sm font-semibold text-fraktur-electric transition hover:bg-fraktur-electric/10"
            >
              For Companies
            </Link>
          )}
          <button
            onClick={() => open()}
            className="rounded-full bg-fraktur-orange px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-fraktur-orangeDim"
          >
            ⚡ Help us fraKtur it before they do
          </button>
        </div>
      </div>

      {/* "the Kast" — compact, sticky, Home only (2026-07-10, replaces the
          old full-bleed mid-page placement — see page.tsx). Not shown on
          Companies: a donor ticker cracking/reforming in a loop next to a
          B2B pricing page doesn't fit that audience. Thin blue line + light
          blue wash mark it as a distinct band from the logo row above. */}
      {variant === "home" && supporters && (
        <div className="border-t border-fraktur-electric/60 bg-fraktur-electric/10">
          <TickerBanner supporters={supporters} compact />
        </div>
      )}

      {/* Bottom accent line — matched to the top border's weight (1px,
          60% opacity) instead of a heavier solid 2px bar (2026-07-11: the
          two didn't match, the bottom one read as noticeably thicker). */}
      <div className="h-px w-full bg-fraktur-electric/60" />
    </header>
  );
}
