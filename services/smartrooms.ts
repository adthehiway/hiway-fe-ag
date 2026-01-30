import { IPaginationResult } from "@/types";
import { ISmartRoom, SmartLinkAccess } from "@/types";
import { api } from "@/services/api";

export class SmartRoomService {
  private domain = "smartrooms";

  async create(data: Partial<ISmartRoom>): Promise<ISmartRoom> {
    return api.post<ISmartRoom, Partial<ISmartRoom>>(`${this.domain}`, data);
  }

  async getById(id: string): Promise<ISmartRoom> {
    return api.get<ISmartRoom>(`${this.domain}/${id}`);
  }

  async update(id: string, data: Partial<ISmartRoom>): Promise<ISmartRoom> {
    return api.patch<ISmartRoom, Partial<ISmartRoom>>(
      `${this.domain}/${id}`,
      data
    );
  }

  async deleteById(id: string): Promise<ISmartRoom> {
    return api.delete<ISmartRoom>(`${this.domain}/${id}`);
  }

  async getAll(params?: {
    perPage?: number;
    access?: SmartLinkAccess;
    q?: string;
    continuationToken?: number;
  }): Promise<IPaginationResult<ISmartRoom>> {
    const queryParams = [
      params?.access ? `access=${params.access}` : "",
      params?.q ? `q=${params.q}` : "",
      `perPage=${params?.perPage || 50}`,
      params?.continuationToken
        ? `continuationToken=${params.continuationToken}`
        : "",
    ].filter(Boolean);

    // The API returns an array directly, not a pagination result
    const response = await api.get<
      ISmartRoom[] | IPaginationResult<ISmartRoom>
    >(`${this.domain}?${queryParams.join("&")}`);

    // If response is an array, wrap it in pagination format
    if (Array.isArray(response)) {
      return {
        items: response,
        perPage: params?.perPage || 50,
        continuationToken: undefined,
      };
    }

    // Otherwise return as-is (if API returns pagination format)
    return response;
  }

  async addMedia(
    roomId: string,
    mediaIds: string[]
  ): Promise<{ message: string }> {
    console.log("SmartRoomService.addMedia called with:", { roomId, mediaIds });
    const result = await api.post<{ message: string }, { mediaIds: string[] }>(
      `${this.domain}/${roomId}/media`,
      { mediaIds }
    );
    console.log("SmartRoomService.addMedia result:", result);
    return result;
  }

  async addDetails(
    roomId: string,
    data: Record<string, string>,
    sessionId?: string
  ): Promise<boolean> {
    const payload: Record<string, any> = { data };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    return api.post<boolean, Record<string, any>>(
      `${this.domain}/${roomId}/details`,
      payload
    );
  }

  async getAnalytics(): Promise<any> {
    return api.get<any>(`${this.domain}/stats/analytics`);
  }

  async deleteSmartLinks(
    roomId: string,
    smartLinkIds: string[]
  ): Promise<{ message: string }> {
    return api.deleteWithBody<{ message: string }, { smartLinkIds: string[] }>(
      `${this.domain}/${roomId}/smartlinks`,
      { smartLinkIds }
    );
  }

  async updateSmartLink(
    roomId: string,
    smartLinkId: string,
    data: { name?: string; description?: string }
  ): Promise<{ message: string }> {
    return api.patch<
      { message: string },
      { name?: string; description?: string }
    >(`${this.domain}/${roomId}/smartlinks/${smartLinkId}`, data);
  }
}

export default new SmartRoomService();
