"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCategoryForPath } from "@/config/dashboard/navigation";

interface NavigationContextType {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string>("content");

  // Update active category based on current path
  useEffect(() => {
    const category = getCategoryForPath(pathname);
    setActiveCategory(category);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
