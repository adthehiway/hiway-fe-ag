"use client";
import Header from "@/components/dashboard/layout/Header";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { UploadProgressWidget } from "@/components/dashboard/layout/upload-progress";
import { MediaManagerProvider } from "@/contexts/media-manager";
import { NavigationProvider } from "@/contexts/navigation";
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
    <NavigationProvider>
      <MediaManagerProvider>
        {/* Outer light background */}
        <div className="h-screen w-screen bg-slate-100 p-3 md:p-4 overflow-hidden">
          {/* Navy frame - wraps everything */}
          <div className="h-full w-full bg-[#0f172a] rounded-[2rem] p-3 md:p-4 flex gap-3 md:gap-4">
            {/* Sidebar area */}
            <div className={cn(
              "flex-shrink-0 transition-all duration-300 hidden lg:block",
              !isCollapsed ? "w-60" : "w-20"
            )}>
              <Sidebar />
            </div>

            {/* Main content area with tabs above */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header with tabs - sits on navy frame */}
              <Header />

              {/* Content card - tabs connect to top, color matches tab */}
              <main className="flex-1 bg-slate-50 rounded-b-[1.5rem] rounded-tr-[1.5rem] shadow-xl overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  <StripeOnboardingBanner />
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
        <UploadProgressWidget />
      </MediaManagerProvider>
    </NavigationProvider>
  );
}
