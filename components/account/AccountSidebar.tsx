"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Home, ShoppingCart, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../ui/icons";

interface AccountSidebarContextProps {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const AccountSidebarContext = createContext<
  AccountSidebarContextProps | undefined
>(undefined);

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const AccountSidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowSize();

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (width >= 1024) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [width]);

  return (
    <AccountSidebarContext.Provider
      value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}
    >
      {children}
    </AccountSidebarContext.Provider>
  );
};

export const useAccountSidebar = () => {
  const context = useContext(AccountSidebarContext);
  if (!context) {
    throw new Error(
      "useAccountSidebar must be used within AccountSidebarProvider"
    );
  }
  return context;
};

const navItems = [
  {
    name: "Home",
    href: "/account",
    icon: Home,
  },
  {
    name: "Purchases",
    href: "/account/purchases",
    icon: ShoppingCart,
  },
  {
    name: "Rentals",
    href: "/account/rentals",
    icon: FileText,
  },
  {
    name: "Collection",
    href: "/account/collections",
    icon: Folder,
  },
];

export const AccountSidebar = () => {
  const { isOpen, closeSidebar, toggleSidebar } = useAccountSidebar();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed z-40 top-0 left-0 h-full flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border shadow-lg w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {isOpen && (
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden z-50 fixed -right-12 top-4"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="size-6" />
          </Button>
        )}

        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          <img
            src="/images/logo.png"
            alt="Hiway"
            width={60}
            height={60}
            className="text-accent inline-block"
          />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ name, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={name}
                href={href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    closeSidebar();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-1 transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "text-white hover:bg-secondary/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    active ? "bg-accent" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      active ? "text-white" : "text-white"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-semibold" : "font-normal"
                  )}
                >
                  {name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-sidebar-border space-y-2 text-xs text-muted-foreground text-center">
          <div>Built with ❤️ for the independent film industry</div>
          <div>© 2025 UFLIX Ltd trading as Hiway. All rights reserved.</div>
        </div>
      </aside>
    </>
  );
};
