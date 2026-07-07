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
          { href: "#supporters", label: "Supporters" },
        ]
      : [
          { href: "#problem", label: "Problem" },
          { href: "#solution", label: "Solution" },
          { href: "#proof", label: "Proof" },
          { href: "#pricing", label: "Pricing" },
          { href: "#faq", label: "FAQ" },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-fraktur-border bg-fraktur-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-full.png" alt="FRAKTUR" width={160} height={32} priority className="h-8 w-auto" />
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
          ⚡ Donate
        </button>
      </div>
    </header>
  );
}
