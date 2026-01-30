import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CompanyService from "@/services/company";
import {
  ICompany,
  ICompanyAnalytics,
  ICompanyAnalyticsFilters,
  IRevenue,
} from "@/types";

// Hook for fetching a single company by ID
export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => CompanyService.getUserCompany(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching all public companies
export function usePublicCompanies() {
  return useQuery({
    queryKey: ["companies", "public"],
    queryFn: () => CompanyService.getAllPublic(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for updating a company
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ICompany> & { id: string }) =>
      CompanyService.update(data),
    onSuccess: (updatedCompany, variables) => {
      // Update the specific company in cache
      queryClient.setQueryData(["company", variables.id], updatedCompany);

      // Invalidate public companies list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["companies", "public"] });
    },
    onError: (error) => {
      console.error("Failed to update company:", error);
    },
  });
}

// Hook for creating a company
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; website: string; country: string }) =>
      CompanyService.create(data),
    onSuccess: (newCompany: ICompany) => {
      // Add the new company to the cache
      queryClient.setQueryData(["company", newCompany.id], newCompany);

      // Invalidate public companies list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["companies", "public"] });
    },
    onError: (error) => {
      console.error("Failed to create company:", error);
    },
  });
}

// Hook for company analytics
export function useCompanyAnalytics(
  companyId: string,
  filters: ICompanyAnalyticsFilters
) {
  return useQuery({
    queryKey: ["company-analytics", companyId, filters],
    queryFn: () => CompanyService.getAnalyticsByCompanyId(companyId, filters),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for company revenue
export function useCompanyRevenue(params: {
  id: string;
  perPage: number;
  continuationToken?: string;
}) {
  return useQuery({
    queryKey: [
      "company-revenue",
      params.id,
      params.perPage,
      params.continuationToken,
    ],
    queryFn: () => CompanyService.getRevenue(params),
    enabled: !!params.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for company revenue summary
export function useCompanyRevenueSummary(params: {
  id: string;
  dateStart: number;
  dateEnd: number;
}) {
  return useQuery({
    queryKey: [
      "company-revenue-summary",
      params.id,
      params.dateStart,
      params.dateEnd,
    ],
    queryFn: () => CompanyService.summaryRevenue(params),
    enabled: !!params.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

