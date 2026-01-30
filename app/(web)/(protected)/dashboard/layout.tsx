"use client";
import Header from "@/components/dashboard/layout/Header";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { UploadProgressWidget } from "@/components/dashboard/layout/upload-progress";
import { MediaManagerProvider } from "@/contexts/media-manager";
import { useSidebar } from "@/contexts/sidebar";
import { cn } from "@/lib/utils";
import { StripeOnboardingBanner } from "@/components/dashboard/common/StripeOnboardingBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();
  return (
    <MediaManagerProvider>
      <div className={cn("flex  w-full")}>
        <Sidebar />
        <main
          className={cn(
            "flex-1  min-h-screen max-lg:w-full max-lg:pt-16 transition-all duration-300 pt-16",
            !isCollapsed ? "lg:pl-64" : "lg:pl-20",
          )}
        >
          <Header />
          <div className="flex-1 space-y-3   p-2 md:p-4 lg:p-6 w-full overflow-x-hidden ">
            <StripeOnboardingBanner />
            {children}
          </div>
        </main>
        <UploadProgressWidget />
      </div>
    </MediaManagerProvider>
  );
}
