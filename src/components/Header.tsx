"use client";

import Image from "next/image";
import Link from "next/link";
import { useDonation } from "./DonationContext";

export function Header({ variant }: { variant: "home" | "companies" }) {
  const { open } = useDonation();

  const homeAnchors =
    variant === "home"
      ? [
          { href: "#wallets", label: "Wallets" },
          { href: "#supporters", label: "the Kast" },
        ]
      : [
          { href: "#problem", label: "Problem" },
          { href: "#solution", label: "Solution" },
          { href: "#proof", label: "Proof" },
          { href: "#pricing", label: "Pricing" },
          { href: "#faq", label: "FAQ" },
        ];

  return (
    <header className="sticky top-0 z-40 bg-fraktur-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:py-5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-full.png" alt="FRAKTUR" width={320} height={64} priority className="h-16 w-auto sm:h-20" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-fraktur-muted md:flex">
          {homeAnchors.map((a) => (
            <a key={a.href} href={a.href} className="hover:text-fraktur-text">
              {a.label}
            </a>
          ))}
          {variant === "home" ? (
            <Link href="/companies" className="hover:text-fraktur-text">
              For Companies
            </Link>
          ) : (
            <Link href="/" className="hover:text-fraktur-text">
              Home
            </Link>
          )}
        </nav>

        <button
          onClick={() => open()}
          className="rounded-full bg-fraktur-orange px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-fraktur-orangeDim"
        >
          ⚡ Help us fraKtur it
        </button>
      </div>
      {/* Thin electric-blue accent line — solid, no gradient. */}
      <div className="h-[2px] w-full bg-fraktur-electric" />
    </header>
  );
}
