import type { Metadata } from "next";
import "./globals.css";
import { DonationProvider } from "@/components/DonationContext";

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
