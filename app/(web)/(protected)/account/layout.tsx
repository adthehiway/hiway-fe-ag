"use client";
import Header from "@/components/account/Header";
import { AccountSidebar, AccountSidebarProvider } from "@/components/account/AccountSidebar";
import { cn } from "@/lib/utils";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountSidebarProvider>
      <div className={cn("flex w-full")}>
        <AccountSidebar />
        <main
          className={cn(
            "flex-1 min-h-screen duration-300 pt-16 transition-all w-full lg:pl-64"
          )}
        >
          <Header />
          <div className="flex-1 space-y-3 p-2 md:p-4 w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </AccountSidebarProvider>
  );
};

export default layout;
