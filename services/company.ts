import { api } from "@/services/api";
import {
  ICompany,
  ICompanyAnalytics,
  ICompanyAnalyticsFilters,
  IPaginationResult,
  IRevenue,
  IUserCompaniesResponse,
  IUserCompany,
  IActivateCompanyResponse,
} from "@/types";

export class CompanyService {
  private domain = "companies";

  async create(data: { name: string; website: string; country: string }): Promise<ICompany> {
    return api.post<ICompany, { name: string; website: string; country: string }>(
      `${this.domain}`,
      data
    );
  }

  async update(data: Partial<ICompany> & { id: string }): Promise<ICompany> {
    return api.put<ICompany, Partial<ICompany> & { id: string }>(
      `${this.domain}`,
      data
    );
  }

  async getById(id: string): Promise<ICompany> {
    return api.get<ICompany>(`${this.domain}/${id}`);
  }

  async getUserCompany(): Promise<ICompany> {
    return api.get<ICompany>(`${this.domain}/user/company`);
  }

  async createOnboardingLink(id: string): Promise<{ url: string }> {
    return api.post<{ url: string }, {}>(
      `${this.domain}/${id}/stripe/onboarding`,
      {}
    );
  }

  async createSigninLink(id: string): Promise<{ url: string }> {
    return api.post<{ url: string }, {}>(
      `${this.domain}/${id}/stripe/signin`,
      {}
    );
  }

  async getAllPublic(): Promise<ICompany[]> {
    return api.get<ICompany[]>(`${this.domain}`);
  }

  async getAnalyticsByCompanyId(
    id: string,
    filters: ICompanyAnalyticsFilters
  ): Promise<ICompanyAnalytics> {
    let queryParams = "";
    if (filters.dateRange) {
      queryParams += `&dateRange=${filters.dateRange}`;
    }
    if (filters.contentType) {
      queryParams += `&contentType=${filters.contentType}`;
    }
    if (filters.source) {
      queryParams += `&source=${filters.source}`;
    }
    if (filters.device) {
      queryParams += `&device=${filters.device}`;
    }
    if (filters.country) {
      queryParams += `&country=${filters.country}`;
    }
    if (filters.mediaId) {
      queryParams += `&mediaId=${filters.mediaId}`;
    }
    return api.get<ICompanyAnalytics>(
      `${this.domain}/${id}/smartlinks/analytics?${queryParams}`
    );
  }

  async getRevenue(params: {
    id: string;
    perPage: number;
    continuationToken?: string;
  }): Promise<IPaginationResult<IRevenue>> {
    return api.get<IPaginationResult<IRevenue>>(
      `${this.domain}/${params.id}/revenues?perPage=${params.perPage}${
        params.continuationToken
          ? "&continuationToken=" + params.continuationToken
          : ""
      }`
    );
  }

  async summaryRevenue(params: {
    id: string;
    dateStart: number;
    dateEnd: number;
  }): Promise<{ revenue: number }> {
    return api.get<{ revenue: number }>(
      `${this.domain}/${params.id}/revenues/summary?dateStart=${params.dateStart}&dateEnd=${params.dateEnd}`
    );
  }

  // Company Switcher Methods
  async getUserCompanies(): Promise<IUserCompaniesResponse> {
    return api.get<IUserCompaniesResponse>("users/me/companies");
  }

  async getActiveCompany(): Promise<IUserCompany> {
    return api.get<IUserCompany>("users/me/companies/active");
  }

  async activateCompany(companyId: string): Promise<IActivateCompanyResponse> {
    return api.post<IActivateCompanyResponse, {}>(
      `users/me/companies/${companyId}/activate`,
      {}
    );
  }
}

export default new CompanyService();
