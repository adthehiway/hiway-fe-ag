"use client";

import { RoleGuard } from "@/components/dashboard/common/RoleGuard";
import PageTitle from "@/components/dashboard/layout/PageTitle";
import { ExportButton } from "@/components/dashboard/analytics/ExportButton";
import {
  AnalyticsOverviewSection,
  ViewsEngagementSection,
  EngagementAnalysisSection,
  GeographicSection,
  TrafficSourcesSection,
  FreeContentSection,
  PaidContentSection,
  SocialExternalSection,
  B2BScreenersSection,
  SyndicatedSection,
  ReportsHubSection,
} from "@/components/dashboard/analytics/sections";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Section mapping for rendering
const sectionComponents: Record<string, React.ComponentType> = {
  "analytics-overview": AnalyticsOverviewSection,
  "views-engagement": ViewsEngagementSection,
  "engagement-analysis": EngagementAnalysisSection,
  "geographic": GeographicSection,
  "traffic-sources": TrafficSourcesSection,
  "free-content": FreeContentSection,
  "paid-content": PaidContentSection,
  "social-external": SocialExternalSection,
  "b2b-screeners": B2BScreenersSection,
  "syndicated": SyndicatedSection,
  "reports-hub": ReportsHubSection,
};

// Section titles for the page header
const sectionTitles: Record<string, { title: string; description: string }> = {
  "analytics-overview": { title: "Analytics Overview", description: "Track your content performance and audience insights" },
  "views-engagement": { title: "Views & Engagement", description: "Monitor viewing metrics and audience engagement" },
  "engagement-analysis": { title: "Engagement Analysis", description: "Deep dive into how viewers interact with your content" },
  "geographic": { title: "Geographic Analytics", description: "Understand where your audience is located" },
  "traffic-sources": { title: "Traffic Sources", description: "See where your viewers are coming from" },
  "free-content": { title: "Free Content Analytics", description: "Performance metrics for free content" },
  "paid-content": { title: "Paid Content Analytics", description: "Revenue and performance for monetized content" },
  "social-external": { title: "Social & External", description: "Track social shares and external embeds" },
  "b2b-screeners": { title: "B2B Screeners", description: "Monitor screener activity and buyer engagement" },
  "syndicated": { title: "Syndicated Content", description: "Track performance across distribution partners" },
  "reports-hub": { title: "Reports Hub", description: "Generate and download analytics reports" },
};

// Sections that support export functionality
const exportableSections = [
  "analytics-overview",
  "views-engagement",
  "engagement-analysis",
  "geographic",
  "traffic-sources",
  "free-content",
  "paid-content",
  "social-external",
  "b2b-screeners",
  "syndicated",
];

const AnalyticsContent = () => {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") || "analytics-overview";

  const ActiveSectionComponent = sectionComponents[activeSection] || AnalyticsOverviewSection;
  const { title, description } = sectionTitles[activeSection] || sectionTitles["analytics-overview"];
  const showExport = exportableSections.includes(activeSection);

  const handleExport = (format: string, timeframe: string) => {
    // In a real app, this would trigger an API call to generate the export
    console.log(`Exporting ${activeSection} data as ${format} for ${timeframe} days`);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title={title}
        description={description}
        content={showExport ? <ExportButton onExport={handleExport} /> : null}
      />

      <ActiveSectionComponent />
    </div>
  );
};

const AnalyticsPageContent = () => {
  return (
    <Suspense fallback={<div className="space-y-6"><PageTitle title="Analytics" description="Loading..." content={null} /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
};

const AnalyticsPage = () => {
  return (
    <RoleGuard requiredPermission="analytics:read">
      <AnalyticsPageContent />
    </RoleGuard>
  );
};

export default AnalyticsPage;
