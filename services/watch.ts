import { api } from "@/services/api";
import { IWatch } from "@/types";

export class WatchService {
  private domain = "watch";

  async getBySmartLinkSlug(slug: string): Promise<IWatch> {
    return api.get<IWatch>(`${this.domain}/smartlink/${slug}`);
  }

  async createAccessTokenBySmartLinkSlug(
    slug: string
  ): Promise<
    { token: string } | { error: string; code: string; message: string }
  > {
    return api.post<
      { token: string } | { error: string; code: string; message: string },
      {}
    >(`${this.domain}/token/smartlink/${slug}`, {});
  }

  async createView({
    smartlinkSlug,
    data,
  }: {
    smartlinkSlug?: string;
    data: { device?: string; country?: string; source?: string };
  }): Promise<{ id: string }> {
    const url = `${this.domain}/smartlink/${smartlinkSlug}/views`;
    return api.post<
      { id: string },
      { device?: string; country?: string; source?: string }
    >(url, data);
  }

  async updateViewDuration({
    viewId,
    viewDuration,
  }: {
    viewId: string;
    viewDuration: number;
  }): Promise<void> {
    const payload: { viewDuration: number } = { viewDuration };
    return api.patch<void, typeof payload>(
      `${this.domain}/smartlink/views/${viewId}`,
      payload
    );
  }

  async createCheckoutLink(
    id: string,
    rental?: boolean
  ): Promise<{ id: string; clientSecret: string }> {
    return api.post<{ id: string; clientSecret: string }, {}>(
      `${this.domain}/checkout/${id}`,
      {
        rental,
      }
    );
  }

  async downloadMediaBySmartlinkSlug(
    slug: string,
    onProgress?: (percent: number) => void
  ): Promise<Blob> {
    const response = await api.getResponse<Blob>(
      `${this.domain}/download/${slug}`,
      {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  }

  async getRoomBySlug({ slug, sid, sessionId }: { slug: string, sid?: string, sessionId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (sid) {
      queryParams.set("sid", sid);
    }
    if (sessionId) {
      queryParams.set("sessionId", sessionId);
    }
    const url = `${this.domain}/room/${slug}?${queryParams.toString()}`;
    return api.get<any>(url);
  }

  async getRoomById({roomId, sid, sessionId}: {roomId: string, sid?: string, sessionId?: string}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (sid) {
      queryParams.set("sid", sid);
    }
    if (sessionId) {
      queryParams.set("sessionId", sessionId);
    }
    const url = `${this.domain}/room/id/${roomId}?${queryParams.toString()}`;
    return api.get<any>(url);
  }

  async createRoomCheckoutLink(
    roomId: string,
    rental?: boolean
  ): Promise<{ id: string; clientSecret: string }> {
    return api.post<{ id: string; clientSecret: string }, { rental?: boolean }>(
      `${this.domain}/room/checkout/${roomId}`,
      { rental }
    );
  }
}

export default new WatchService();
