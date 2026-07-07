"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DonationContextValue {
  isOpen: boolean;
  prefill: DonationPrefill;
  open: (prefill?: DonationPrefill) => void;
  close: () => void;
}

export interface DonationPrefill {
  allocationChoice?: "Product Dev" | "Specific Wallet" | "Team";
  walletId?: string;
  walletName?: string;
}

const DonationContext = createContext<DonationContextValue | null>(null);

export function DonationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<DonationPrefill>({});

  return (
    <DonationContext.Provider
      value={{
        isOpen,
        prefill,
        open: (p) => {
          setPrefill(p || {});
          setIsOpen(true);
        },
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const ctx = useContext(DonationContext);
  if (!ctx) throw new Error("useDonation must be used within a DonationProvider");
  return ctx;
}
