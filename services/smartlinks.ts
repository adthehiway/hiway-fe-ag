import { IPaginationResult } from "@/types";
import {
  ISmartLink,
  SmartLinkAccess,
  SmartlinksAnalytics,
  SmartLinkStatus,
} from "@/types";
import { api } from "@/services/api";

export class SmartLinkService {
  private domain = "smartlinks";

  async create(data: Partial<ISmartLink>): Promise<ISmartLink> {
    return api.post<ISmartLink, Partial<ISmartLink>>(`${this.domain}`, data);
  }

  async getById(id: string): Promise<ISmartLink> {
    return api.get<ISmartLink>(`${this.domain}/${id}`);
  }

  async update(id: string, data: Partial<ISmartLink>): Promise<ISmartLink> {
    return api.patch<ISmartLink, Partial<ISmartLink>>(
      `${this.domain}/${id}`,
      data
    );
  }

  async deleteById(id: string): Promise<ISmartLink> {
    return api.delete<ISmartLink>(`${this.domain}/${id}`);
  }

  async getAll(params: {
    perPage: number;
    access?: SmartLinkAccess;
    q?: string;
    continuationToken?: number;
    status?: SmartLinkStatus;
  }): Promise<IPaginationResult<ISmartLink>> {
    const queryParams = [
      `access=${params.access ?? ""}`,
      `q=${params.q ?? ""}`,
      `perPage=${params.perPage}`,
      params.status !== SmartLinkStatus.ALL && params.status !== undefined
        ? `status=${params.status}`
        : "",
      params.continuationToken
        ? `continuationToken=${params.continuationToken}`
        : "",
    ];

    return api.get<IPaginationResult<ISmartLink>>(
      `${this.domain}?${queryParams.join("&")}`
    );
  }

  async getAnalytics(): Promise<SmartlinksAnalytics> {
    return api.get<SmartlinksAnalytics>(`${this.domain}/stats/analytics`);
  }

  async addDetails(
    smartlinkId: string,
    data: Record<string, string>,
    sessionId?: string
  ): Promise<boolean> {
    const payload: Record<string, any> = { data };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    return api.post<boolean, Record<string, any>>(
      `${this.domain}/${smartlinkId}/details`,
      payload
    );
  }
}

export default new SmartLinkService();
