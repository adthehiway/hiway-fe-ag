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

          {/* Main content - white card inside navy frame */}
          <main className="flex-1 bg-white rounded-[1.5rem] shadow-xl overflow-hidden flex flex-col">
            <Header />
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
              <StripeOnboardingBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
      <UploadProgressWidget />
    </MediaManagerProvider>
  );
}
