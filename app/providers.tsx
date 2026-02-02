import { Loader } from "@/components/ui/loader";
import { ThemeProvider } from "@/components/common/theme-provider";
import { DlaProvider } from "@/contexts/dla";
import { DtoProvider } from "@/contexts/dto";
import { QueryProvider } from "@/contexts/query-provider";
import { ReferralProvider } from "@/contexts/referral";
import { SidebarProvider } from "@/contexts/sidebar";
import { UploadProvider } from "@/contexts/upload";
import React, { Suspense } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "light-v1-1", "dark", "dark-v1-1", "dark-v1-2", "dark-v2", "dark-v3"]}
      disableTransitionOnChange
    >
      <QueryProvider>
        <DtoProvider>
          <DlaProvider>
            <UploadProvider>
              <Suspense fallback={<Loader fullScreen />}>
                <ReferralProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </ReferralProvider>
              </Suspense>
            </UploadProvider>
          </DlaProvider>
        </DtoProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default Providers;
