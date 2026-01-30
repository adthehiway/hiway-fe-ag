import { Loader } from "@/components/ui/loader";
import { DlaProvider } from "@/contexts/dla";
import { DtoProvider } from "@/contexts/dto";
import { QueryProvider } from "@/contexts/query-provider";
import { ReferralProvider } from "@/contexts/referral";
import { SidebarProvider } from "@/contexts/sidebar";
import { UploadProvider } from "@/contexts/upload";
import React, { Suspense } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
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
  );
};

export default Providers;
