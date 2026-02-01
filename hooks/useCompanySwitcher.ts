import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CompanyService from "@/services/company";
import { IUserCompany, IUserCompaniesResponse } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/utils";
import { MOCK_MODE, mockUserCompanies, mockCompany } from "@/lib/mock-data";

function getMockUserCompaniesResponse(): IUserCompaniesResponse {
  return {
    companies: mockUserCompanies.map(c => ({
      companyId: c.id,
      companyName: c.name,
      companyLogo: c.logo,
      role: c.role,
      id: c.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    activeCompanyId: mockCompany.id,
  } as IUserCompaniesResponse;
}

/**
 * Hook for managing company switching
 */
export function useCompanySwitcher() {
  const queryClient = useQueryClient();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  // Load companies
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useQuery<IUserCompaniesResponse>({
    queryKey: ["user-companies", MOCK_MODE ? "mock" : "api"],
    queryFn: () => MOCK_MODE ? Promise.resolve(getMockUserCompaniesResponse()) : CompanyService.getUserCompanies(),
    staleTime: MOCK_MODE ? Infinity : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Initialize active company from localStorage or API response
  useEffect(() => {
    if (companiesData?.companies) {
      const stored = localStorage.getItem("activeCompanyId");
      const validStored =
        stored && companiesData.companies.some((c) => c.companyId === stored);

      if (companiesData.activeCompanyId) {
        // Use active company from API
        setActiveCompanyId(companiesData.activeCompanyId);
        localStorage.setItem("activeCompanyId", companiesData.activeCompanyId);
      } else if (validStored) {
        // Use stored company if valid
        setActiveCompanyId(stored);
      } else if (companiesData.companies.length > 0) {
        // Default to first company
        const firstCompanyId = companiesData.companies[0].companyId;
        setActiveCompanyId(firstCompanyId);
        localStorage.setItem("activeCompanyId", firstCompanyId);
      }
    }
  }, [companiesData]);

  // Activate company mutation
  const { mutate: switchCompany, isPending: isSwitching } = useMutation({
    mutationFn: (companyId: string) =>
      CompanyService.activateCompany(companyId),
    onSuccess: (data) => {
      setActiveCompanyId(data.companyId);
      localStorage.setItem("activeCompanyId", data.companyId);
      // Invalidate all company-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
      // Refresh user data to get updated role
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(`Switched to ${data.companyName}`);
      // Navigate to dashboard and reload page
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const companies = companiesData?.companies || [];
  const activeCompany = companies.find((c) => c.companyId === activeCompanyId);

  return {
    companies,
    activeCompanyId,
    activeCompany,
    switchCompany,
    isLoadingCompanies,
    isSwitching,
    refetchCompanies,
  };
}
