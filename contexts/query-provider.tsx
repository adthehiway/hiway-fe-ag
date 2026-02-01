"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import {
  MOCK_MODE,
  mockUser,
  mockUserCompanies,
  mockDashboardOverview,
  mockMediaList,
  mockCompany,
  mockUserStats,
  mockReferrals,
  mockCompanyMembers,
  mockCompanyInvitations,
  mockApiKeys,
  mockBillingPlan,
  mockBillingInvoices,
  mockBillingUsage,
  mockMonetizationStats,
  mockPayoutSchedule,
  mockCoupons,
  mockSmartlinks,
  mockSmartlinksAnalytics,
  mockSmartrooms,
  mockSmartRoomsAnalytics,
  mockCRMAnalytics,
  mockCRMContacts,
  mockCompanyAnalytics,
  mockMediaStats,
  mockUploadQueue,
  mockStorageDetails,
  mock2FAStatus,
  mockSettings,
} from "@/lib/mock-data";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // In mock mode, don't retry failed requests
          retry: MOCK_MODE ? false : 3,
          // In mock mode, data never goes stale
          staleTime: MOCK_MODE ? Infinity : 5 * 60 * 1000,
        },
      },
    });

    // Pre-populate cache with mock data
    if (MOCK_MODE) {
      // User & Auth
      client.setQueryData(["user", "me"], mockUser);
      client.setQueryData(["user", "stats"], mockUserStats);
      client.setQueryData(["user", "referrals"], mockReferrals);
      client.setQueryData(["user-companies"], mockUserCompanies);
      client.setQueryData(["2fa", "status"], mock2FAStatus);

      // Company
      client.setQueryData(["company"], mockCompany);

      // Dashboard
      client.setQueryData(["dashboard-overview"], mockDashboardOverview);

      // Media / Content Library
      client.setQueryData(["media", "list"], mockMediaList);
      client.setQueryData(["media-list", undefined, undefined, undefined, undefined, 12], { items: mockMediaList, continuationToken: null });
      client.setQueryData(["media-list", "", "READY", undefined, undefined, 12], { items: mockMediaList, continuationToken: null });
      client.setQueryData(["media-by-status", ["READY"], 100, undefined], { items: mockMediaList });
      client.setQueryData(["media-by-status", ["WAITING_TRANSCODING_START", "UPLOADING_TO_ELUVIO", "TRANSCODING_IN_PROGRESS", "WAITING_FINALIZE_ABR_MEZZANINE_START", "FINALIZE_ABR_MEZZANINE_IN_PROGRESS", "MODERATION_IN_PROGRESS"], 100, undefined], { items: [] });
      client.setQueryData(["media-stats"], mockMediaStats);
      client.setQueryData(["storage-details"], mockStorageDetails);
      client.setQueryData(["upload-queue", mockUser.id, 100, undefined], mockUploadQueue);

      // Settings - Members & Invitations
      client.setQueryData(["company-members", mockCompany.id, { page: 1, limit: 20 }], mockCompanyMembers);
      client.setQueryData(["company-invitations", mockCompany.id, 1, 20], mockCompanyInvitations);
      client.setQueryData(["api-keys", mockCompany.id], mockApiKeys);

      // Billing
      client.setQueryData(["billing-plan"], mockBillingPlan);
      client.setQueryData(["billing-invoices"], mockBillingInvoices);
      client.setQueryData(["billing-usage"], mockBillingUsage);

      // Monetization
      client.setQueryData(["monetization", "stats"], mockMonetizationStats);
      client.setQueryData(["monetization", "payout-schedule"], mockPayoutSchedule);
      client.setQueryData(["monetization", "coupons"], mockCoupons);

      // Smartlinks
      client.setQueryData(["smartlinks", "PRIVATE", "", undefined], { pages: [mockSmartlinks], pageParams: [null] });
      client.setQueryData(["smartlinks", "PUBLIC", "", undefined], { pages: [mockSmartlinks], pageParams: [null] });
      client.setQueryData(["smartlinks-analytics"], mockSmartlinksAnalytics);

      // Smartrooms
      client.setQueryData(["smartrooms", "PRIVATE", ""], { pages: [mockSmartrooms], pageParams: [null] });
      client.setQueryData(["smartrooms", "PUBLIC", ""], { pages: [mockSmartrooms], pageParams: [null] });
      client.setQueryData(["smartrooms-analytics"], mockSmartRoomsAnalytics);

      // CRM
      client.setQueryData(["crm", "analytics"], mockCRMAnalytics);
      client.setQueryData(["crm", "contacts", { access: "PUBLIC", perPage: 50 }], mockCRMContacts);

      // Analytics
      client.setQueryData(["company-analytics", mockCompany.id, { dateRange: "30d" }], mockCompanyAnalytics);

      // Settings
      client.setQueryData(["settings"], mockSettings);
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
