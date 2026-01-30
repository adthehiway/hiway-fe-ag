"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ReferralProviderProps = {
  children: ReactNode;
};

type ReferralContext = {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  clearReferralCode: () => void;
};

export function ReferralProvider({ children }: ReferralProviderProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract referral code from URL parameters and remove it
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);

      // Remove the ref parameter from URL without page reload
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("ref");

      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;

      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  const clearReferralCode = () => {
    setReferralCode(null);
  };

  return (
    <ReferralContext.Provider
      value={{
        referralCode,
        setReferralCode,
        clearReferralCode,
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
}

export const ReferralContext = createContext({} as ReferralContext);

export function useReferral() {
  return useContext(ReferralContext);
}
