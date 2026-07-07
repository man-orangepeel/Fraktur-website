import type { Metadata } from "next";
import "./globals.css";
import { DonationProvider } from "@/components/DonationContext";

// The editorial serif carrying every headline on the Companies page — chosen
// to match the source pitch deck's typographic voice (large, quiet,
// confident serif type doing the talking instead of body copy). Deliberately
// a system/web-safe serif stack, NOT next/font/google: fetching a font from
// Google's CDN at build time failed in this sandbox (no egress to
// fonts.googleapis.com) and is exactly the kind of fragile external
// build-time dependency worth avoiding in general — a self-hosted font file
// is the right upgrade if a specific typeface becomes important later (see
// WEBSITE_BRIEF.md §11), not a Google Fonts fetch.

export const metadata: Metadata = {
  title: "FRAKTUR — Bitcoin-native security, proven on-chain",
  description:
    "Live, verifiable security scores for Bitcoin wallets — audited, timestamped, public. FRAKTUR runs the code, not just reads it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-fraktur-bg font-sans text-fraktur-text">
        <DonationProvider>{children}</DonationProvider>
      </body>
    </html>
  );
}
