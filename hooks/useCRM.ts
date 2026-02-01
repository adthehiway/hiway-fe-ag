import { useQuery } from "@tanstack/react-query";
import CRMService from "@/services/crm";
import {
  ICRMAnalytics,
  ICRMContact,
  IContactDetails,
  IPaginatedSmartLinksWatched,
  IPaginatedRevenueHistory,
  SmartLinkAccess,
} from "@/types";
import { MOCK_MODE, mockCRMAnalytics, mockCRMContacts } from "@/lib/mock-data";

export const useCRMAnalytics = () => {
  return useQuery<ICRMAnalytics>({
    queryKey: ["crm", "analytics"],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockCRMAnalytics as any) : CRMService.getAnalytics(),
    staleTime: MOCK_MODE ? Infinity : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCRMContacts = (params: {
  id: string;
  perPage: number;
  continuationToken?: string;
  access?: SmartLinkAccess;
  q?: string;
}) => {
  return useQuery({
    queryKey: ["crm", "contacts", params],
    queryFn: () => MOCK_MODE ? Promise.resolve(mockCRMContacts as any) : CRMService.getContacts(params),
    staleTime: MOCK_MODE ? Infinity : 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useContactDetails = (contactId: string) => {
  return useQuery<IContactDetails>({
    queryKey: ["crm", "contact-details", contactId],
    queryFn: () => CRMService.getContactDetails(contactId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!contactId,
  });
};

export const useSmartLinksWatched = (
  contactId: string,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery<IPaginatedSmartLinksWatched>({
    queryKey: ["crm", "smartlinks-watched", contactId, page, limit],
    queryFn: () => CRMService.getSmartLinksWatched(contactId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!contactId,
  });
};

export const useRevenueHistory = (
  contactId: string,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery<IPaginatedRevenueHistory>({
    queryKey: ["crm", "revenue-history", contactId, page, limit],
    queryFn: () => CRMService.getRevenueHistory(contactId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!contactId,
  });
};
