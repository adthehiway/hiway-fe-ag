import { api } from "@/services/api";
import {
  ContentType,
  IContentFabricFile,
  IContentObject,
  IFeatureUsage,
  IMedia,
  IMediaAnalytics,
  IMediaAsset,
  IMediaRelationship,
  IMediaUploadTokenRequest,
  IMediaUploadTokenResponse,
  IPaginationResult,
  ISmartLink,
  MediaStats,
  MediaStatus,
  ContentRelationshipType,
  IUploadQueueResponse,
} from "@/types";

export class MediaService {
  private domain = "media";

  async create(
    name: string,
    companyId: string,
    title?: string,
    contentType?: ContentType,
    description?: string,
    size?: number,
    mediaFile?: {
      video: Omit<IContentFabricFile, "data" | "presignedUrl">;
    }
  ): Promise<IContentObject> {
    return api.post<
      IContentObject,
      {
        companyId: string;
        name: string;
        title?: string;
        contentType?: ContentType;
        description?: string;
        size?: number;
        mediaFile?: {
          video: Omit<IContentFabricFile, "data" | "presignedUrl">;
        };
      }
    >(`${this.domain}`, {
      companyId,
      name,
      title,
      contentType,
      description,
      size,
      mediaFile,
    });
  }

  async update(id: string, data: Partial<IMedia>): Promise<IMedia> {
    return api.put<IMedia, Partial<IMedia>>(`${this.domain}/${id}`, data);
  }

  async finalize(
    id: string,
    multipartData?: {
      key: string;
      uploadId: string;
      parts: Array<{ ETag: string; PartNumber: number }>;
    }
  ): Promise<{ hash: string }> {
    return api.post<{ hash: string }, {}>(
      `${this.domain}/${id}/finalize`,
      multipartData || {}
    );
  }

  async getPresignedUrlForPart(
    key: string,
    uploadId: string,
    partNumber: number
  ): Promise<{ url: string }> {
    return api.get<{ url: string }>(
      `${this.domain}/presign-part?key=${encodeURIComponent(
        key
      )}&uploadId=${uploadId}&partNumber=${partNumber}`
    );
  }

  async getById(id: string, token: boolean = false): Promise<IMedia> {
    return api.get<IMedia>(`${this.domain}/${id}?token=${token}`);
  }

  async deleteById(id: string): Promise<void> {
    return api.delete<void>(`${this.domain}/${id}`);
  }

  async getStorageDetails(): Promise<{
    total: number;
    used: number;
    remaining: number;
    inProgress: number;
    usedPercentage: number;
  }> {
    return api.get<{
      total: number;
      used: number;
      remaining: number;
      inProgress: number;
      usedPercentage: number;
    }>(`${this.domain}/storage`);
  }

  async getByStatus(params: {
    status: MediaStatus[];
    perPage: number;
    search?: string;
  }): Promise<IPaginationResult<IMedia>> {
    let url = `${this.domain}?status=${params.status.join(",")}&perPage=${
      params.perPage
    }`;
    if (params.search) {
      url += `&search=${encodeURIComponent(params.search)}`;
    }
    return api.get<IPaginationResult<IMedia>>(url);
  }
  async getAllSmartlinks(id: string): Promise<ISmartLink[]> {
    return api.get<ISmartLink[]>(`${this.domain}/${id}/smartlinks`);
  }

  async getAllThumbnails(id: string): Promise<any> {
    return api.get<any>(`${this.domain}/${id}/thumbnails`);
  }

  async getAnalyticsByMediaId(id: string): Promise<IMediaAnalytics> {
    return api.get<IMediaAnalytics>(`${this.domain}/${id}/analytics`);
  }

  async addSubtitle(
    id: string,
    data: {
      url: string;
      filename: string;
      filesize?: number;
      language: string;
      label: string;
      isDefault?: boolean;
    }
  ): Promise<{
    success: boolean;
    message: string;
    id: string;
    hash: string;
    partHash: string;
  }> {
    return api.post<
      {
        success: boolean;
        message: string;
        id: string;
        hash: string;
        partHash: string;
      },
      {
        url: string;
        filename: string;
        filesize?: number;
        language: string;
        label: string;
        isDefault?: boolean;
      }
    >(`${this.domain}/${id}/subtitles`, data);
  }

  async getAssets(id: string): Promise<{
    assets: IMediaAsset[];
    storageUsage: IFeatureUsage;
  }> {
    return api.get<{ assets: IMediaAsset[]; storageUsage: IFeatureUsage }>(
      `${this.domain}/${id}/assets`
    );
  }

  async addAsset(
    mediaId: string,
    data: {
      url: string;
      filename: string;
      filesize?: number;
      assetType: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    id: string;
  }> {
    return api.post<
      {
        success: boolean;
        message: string;
        id: string;
      },
      {
        url: string;
        filename: string;
        filesize?: number;
        assetType: string;
      }
    >(`${this.domain}/${mediaId}/assets`, data);
  }

  async updateAsset(
    mediaId: string,
    assetId: string,
    data: {
      assetType: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return api.patch<
      {
        success: boolean;
        message: string;
      },
      {
        assetType: string;
      }
    >(`${this.domain}/${mediaId}/assets/${assetId}`, data);
  }

  async deleteAsset(
    mediaId: string,
    assetId: string
  ): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(
      `${this.domain}/${mediaId}/assets/${assetId}`
    );
  }

  async requestUploadToken(): Promise<IMediaUploadTokenResponse> {
    return api.post<IMediaUploadTokenResponse>(
      `${this.domain}/upload-token`,
      {}
    );
  }

  async getStats(): Promise<MediaStats> {
    return api.get<MediaStats>(`${this.domain}/stats`);
  }

  async getMediaList({
    search,
    status,
    contentType,
    continuationToken,
    perPage,
  }: {
    search?: string;
    status?: MediaStatus;
    contentType?: string;
    continuationToken?: number;
    perPage?: number;
  }): Promise<IPaginationResult<IMedia>> {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (contentType) query.set("contentType", contentType);
    if (continuationToken)
      query.set("continuationToken", continuationToken.toString());
    if (perPage) query.set("perPage", perPage.toString());
    return api.get<IPaginationResult<IMedia>>(
      `${this.domain}?${query.toString()}`
    );
  }

  // Content Relationships API methods
  async getContentRelationships(
    mediaId: string,
    relationshipType: ContentRelationshipType
  ): Promise<IMediaRelationship[]> {
    return api.get<IMediaRelationship[]>(
      `${this.domain}/${mediaId}/relationships?type=${relationshipType}`
    );
  }

  async addContentRelationship(
    mediaId: string,
    data: {
      targetSmartLinkId: string;
      relationshipType: ContentRelationshipType;
      associatedType?:
        | "PROMO"
        | "COMMERCIAL"
        | "TRAILER"
        | "BONUS_CLIP"
        | "BTS";
    }
  ): Promise<IMediaRelationship> {
    return api.post<
      IMediaRelationship,
      {
        targetSmartLinkId: string;
        relationshipType: ContentRelationshipType;
        associatedType?:
          | "PROMO"
          | "COMMERCIAL"
          | "TRAILER"
          | "BONUS_CLIP"
          | "BTS";
      }
    >(`${this.domain}/${mediaId}/relationships`, data);
  }

  async deleteContentRelationship(
    mediaId: string,
    relationshipId: string
  ): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(
      `${this.domain}/${mediaId}/relationships/${relationshipId}`
    );
  }

  async getUploadQueue(params?: {
    continuationToken?: number;
    perPage?: number;
  }): Promise<IUploadQueueResponse> {
    const query = new URLSearchParams();
    if (params?.continuationToken) {
      query.set("continuationToken", params.continuationToken.toString());
    }
    if (params?.perPage) {
      query.set("perPage", params.perPage.toString());
    }
    const queryString = query.toString();
    return api.get<IUploadQueueResponse>(
      `${this.domain}/upload-queue${queryString ? `?${queryString}` : ""}`
    );
  }

  async retryMedia(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return api.post<{
      success: boolean;
      message: string;
    }>(`${this.domain}/${id}/retry`, {});
  }
}

export default new MediaService();
