import { api } from "@/services/api";
import {
  IPaginationResult,
  IMediaPurchase,
  ICRMAnalytics,
  SmartLinkAccess,
  ICRMContact,
  IContactDetails,
  IPaginatedSmartLinksWatched,
  IPaginatedRevenueHistory,
} from "@/types";

export class CRMService {
  private domain = "crm";

  async getAnalytics(): Promise<ICRMAnalytics> {
    return api.get<ICRMAnalytics>(`${this.domain}/analytics`);
  }

  async getContacts(params: {
    id: string;
    perPage: number;
    continuationToken?: string;
    access?: SmartLinkAccess;
    q?: string;
  }): Promise<IPaginationResult<ICRMContact>> {
    const searchParams = new URLSearchParams({
      perPage: params.perPage.toString(),
    });

    if (params.continuationToken) {
      searchParams.append("continuationToken", params.continuationToken);
    }
    if (params.access) {
      searchParams.append("access", params.access);
    }
    if (params.q) {
      searchParams.append("q", params.q);
    }

    return api.get<IPaginationResult<ICRMContact>>(
      `${this.domain}/contacts?${searchParams.toString()}`
    );
  }

  async getContactDetails(contactId: string): Promise<IContactDetails> {
    return api.get<IContactDetails>(`${this.domain}/contacts/${contactId}`);
  }

  async getSmartLinksWatched(
    contactId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IPaginatedSmartLinksWatched> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return api.get<IPaginatedSmartLinksWatched>(
      `${
        this.domain
      }/contacts/${contactId}/smartlinks?${searchParams.toString()}`
    );
  }

  async getRevenueHistory(
    contactId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IPaginatedRevenueHistory> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return api.get<IPaginatedRevenueHistory>(
      `${
        this.domain
      }/contacts/${contactId}/revenue-history?${searchParams.toString()}`
    );
  }

  async exportContacts(): Promise<Blob> {
    const response = await api.getResponse<Blob>(`${this.domain}/export`, {
      responseType: "blob",
    });
    return response.data;
  }
}

export default new CRMService();
